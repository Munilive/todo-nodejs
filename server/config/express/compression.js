'use strict';

/**
 * gzip 압축을 위해 사용
 *
 * @link https://github.com/expressjs/compression
 * @link http://expressjs.com/ko/advanced/best-practice-performance.html
 * @type {compression}
 */
const compression = require('compression');

/**
 * 요청 헤더에 'x-no-compression'이 선언되었을 경우, 압축금지
 *
 * @param req
 * @param res
 * @returns {*}
 */
const shouldCompress = (req, res) => {
  if (req.headers['x-no-compression']) {
    return false;
  }
  return compression.filter(req, res);
};

/**
 * 요청 본문의 압축여부를 조건에 따라 분기처리하기 위한 함수
 *
 * @param app
 */
module.exports = (app) => {
  // 요청 헤더의 'x-no-compresson' 키값에 따라 압축여부 설정
  app.use(compression({ filter: shouldCompress }));
};
