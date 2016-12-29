'use strict';

const path = require('path');
const express = require('express');
// express 에서 사용하는 모듈들
/**
 * request body 파싱
 *
 * @link https://github.com/expressjs/body-parser
 * @type {Parsers}
 */
const bodyParser = require('body-parser');
/**
 * 개발시 에러 핸들링을 위해
 * @link https://github.com/expressjs/errorhandler
 */
const errorHandler = require('errorhandler');
/**
 * express app header 보안을 위해서 사용 - header 설정 변경 가능
 * @link https://www.npmjs.com/package/helmet
 * @type {helmet}
 */
const helmet = require('helmet');
/**
 * method ?
 * @link https://github.com/expressjs/method-override
 */
const methodOverride = require('method-override');
/**
 * cookie 파싱을 위해 사용
 * @link https://www.npmjs.com/package/cookie-parser
 * @type {cookieParser}
 */
const cookieParser = require('cookie-parser');
/**
 * favicon 설정을 위해 사용
 * @link https://www.npmjs.com/package/serve-favicon
 * @type {favicon}
 */
const favicon = require('serve-favicon');
/**
 * 정적인 파일 처리를 위해 사용
 * @link https://www.npmjs.com/package/serve-static
 * @type {serveStatic}
 */
const serveStatic = require('serve-static');

// 로그 포멧을 지정하기 위해 모듈을 한번 더 쌈
const morgan = require('./morgan');
// 압축을 여부를 추가하기 위해 모듈은 한번 더 쌈
const compression = require('./compression');

// 환경설정을 불러옴
const config = require('../environment');
const ENV = require('../environment.constants');

/**
 * express 설정을 리턴함
 */
module.exports = () => {
  const DEVELOPMENT = ENV.DEVELOPMENT;
  const PRODUCTION = ENV.PRODUCTION;
  const TEST = ENV.TEST;
  const app = express();
  const env = app.get('env');

  if (env === DEVELOPMENT || env === TEST) {
    app.use(serveStatic(`${config.root}/.tmp`));
  }

  if (env === PRODUCTION) {
    // 운영에서 파피콘 설정
    app.use(favicon(path.join(config.root, 'public', 'favicon.ico')));
  }

  // 프론트 앱 위치 설정
  if (env === DEVELOPMENT) {
    // appPath 라는 이름으로 경로를 추가
    app.set('appPath', path.join(config.root, 'client'));
  } else {
    app.set('appPath', path.join(config.root, 'public'));
  }

  app.use(serveStatic(app.get('appPath'), { index: 'index.html' }));

  morgan(app);      // morgan 사용이전의 스태틱 파일에 대한 로그는 무시한다.
  compression(app);

  // request body 사이즈를 100메가바이트로 설정
  // querystring 라이브러리 이용해서 url encoded 파싱
  app.use(bodyParser.urlencoded({ extended: false, limit: '100mb' }));
  app.use(bodyParser.json({ limit: '100mb' }));
  app.use(methodOverride());
  app.use(cookieParser());
  app.use(helmet());

  if (env === DEVELOPMENT) {
    // 에러 핸들러는 개발 모드에서만 사용되며, 마지막에 위치해야 한다.
    app.use(errorHandler());
  }

  return app;
};
