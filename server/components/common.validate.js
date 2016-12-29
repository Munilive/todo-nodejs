'use strict';

/**
 * javascript library
 * @link https://lodash.com/docs/4.17.3
 * @link https://lodash.com/s
 */
const _ = require('lodash');
/**
 * root 부터 경로를 지정하기 위해서 사용
 * @link https://www.npmjs.com/package/root-require
 * @type {requireFromModuleRoot}
 */
const rootRequire = require('root-require');
const commonMessage = rootRequire('server/constants/common.message');
const lang = require('./utils/lang');
const EntityError = require('./error').EntityError;

module.exports = {
  /**
   * 건너 뛸 수량 유효성 검사
   * @param skip
   */
  checkSkip(skip) {
    // 전달되지 않은 경우 패스
    if (_.isNil(skip)) {
      return;
    }
    // 유효한 타입이 아닌 경우 에러 처리
    if (lang.isNumber(skip) === false) {
      throw new EntityError(commonMessage.WRONG_TYPEOF_SKIP, 'skip');
    }
  },
  /**
   * 한번에 출력할 수 유효성 검사
   * @param limit
   */
  checkLimit(limit) {
    // 전달되지 않은 경우 패스
    if (_.isNil(limit)) {
      return;
    }
    // 유효한 타입이 아닌 경우 에러 처리
    if (lang.isNumber(limit) === false) {
      throw new EntityError(commonMessage.WRONG_TYPEOF_LIMIT, 'limit');
    }
  },
};
