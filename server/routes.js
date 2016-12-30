'use strict';

const winston = require('winston');
const config = require('./config/environment');
const commonMessage = require('./constants/common.message');
const NotFoundError = require('./components/error').NotFoundError;

/**
 * 응답 형식 공통 모듈
 */
const response = require('./components/response');

module.exports = (app) => {
  app.use('/api/todo', require('./api/todo'));

  // 없는 api를 호출 하면 에러
  app.use('/api/*', () => {
    throw new NotFoundError(commonMessage.NOT_FOUND_API);
  });

  // 공통 에러 핸들링
  app.use('/*', (err, req, res, next) => {
    winston.info(`error - ${err.name}`);
    Promise.reject(err).catch(response.handleError(res));
  });

  app.route(config.healthCheck).get(response.sendOK);
};
