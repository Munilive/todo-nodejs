'use strict';

/**
 * 로그를 기록 하기 위해 사용
 *
 * @link https://www.npmjs.com/package/morgan
 * @link http://chan180.tistory.com/164
 * @type {morgan}
 */
const morgan = require('morgan');
const dateUtil = require('../../components/utils/date');

/**
 * 모건 로그 포멧을 지정함
 * :currentMoment -> currentMomentPipe 함수에서 추가 되는 파라메터
 * :method -> request method
 * :url -> requires url
 * :status -> response status 응답코드
 * :response-time -> 응답 시간 (마이크로초)
 * :res[content-length] -> response 크기
 * @type {string}
 */
const MORGAN_OUTPUT = '[:currentMoment] :method :url :status :response-time ms - :res[content-length]';

/**
 * 리퀘스트 객체에 현재시간 추가
 * @param req
 * @param res
 * @param next
 */
const currentMomentPipe = (req, res, next) => {
  // 현재시간 추가 (`yyyy-MM-dd HH:mm`)
  req.currentMoment = `${dateUtil.toDateString(Date.now())} ${dateUtil.toTimeString(Date.now())}`;
  next();
};

/**
 * API 요청시 출력되는 콘솔 로그에 현재 시간을 추가하기 위한 모건 메시지 수정 코드
 * app을 받아서 미들웨어 사용을 추가
 * @param app
 */
module.exports = (app) => {
  // Request 변수에 현재시간을 추가 함(+09:00)
  app.use(currentMomentPipe);

  // 모건 토큰에 현재 시간을 추가
  morgan.token('currentMoment', req => req.currentMoment);

  // 모건 로그 포멧을 입력
  app.use(morgan(MORGAN_OUTPUT));
};
