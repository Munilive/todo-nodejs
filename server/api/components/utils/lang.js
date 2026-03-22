'use strict';

const _ = require('lodash');
const mongoose = require('mongoose');

const DATE_REGEX = /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[1-2][0-9]|3[0-1])$/;
const TIME_REGEX = /^([0-1][0-9]|2[0-3]):[0-5][0-9]$/;

module.exports = {
  /**
   * 문자열이 Date 로 변경가능한 형태인지 검사
   * @param {string} datetime - 문자열 날짜
   * @returns {boolean}
   */
  isDatetimeString(datetime) {
    return isNaN(new Date(datetime)) === false;
  },

  /**
   * 날짜 문자열 형태 검사
   *  - yyyy-MM-dd
   * @param {string} date - 날짜 문자열
   * @returns {boolean}
   */
  isDateString(date) {
    return DATE_REGEX.test(date);
  },

  /**
   * 시간 문자열 형태 검사
   *  - HH:mm
   * @param {string} time - 시간 문자열
   * @returns {boolean}
   */
  isTimeString(time) {
    return TIME_REGEX.test(time);
  },

  /**
   * 몽고 DB의 ObjectId 형태로 변경될 수 있는지 검사
   * @param {ObjectId|string} objectId - 몽고DB 오브젝트 ID
   * @returns {boolean|*}
   */
  isObjectId(objectId) {
    return mongoose.Types.ObjectId.isValid(objectId);
  },

  /**
   * 숫자 또는 숫자 값이 적힌 스트링 여부 검사
   * @param {string|number} num
   * @returns {boolean}
   */
  isNumber(num) {
    return _.isNumber(num) || !isNaN(parseInt(num, 10));
  },

  /**
   * 불리언 또는 불리언 값이 적힌 스트링 여부 검사
   * @param {string|boolean} bool
   * @returns {boolean}
   */
  isBoolean(bool) {
    return _.includes([true, false, 'true', 'false'], bool);
  },

  /**
   * 불리언 true 또는 스트링 "true" 여부 검사
   *  - request 시 "true" 전달 사유.
   * @param {string|boolean} bool
   * @returns {boolean}
   */
  isTrue(bool) {
    return bool === true || bool === 'true';
  },

  /**
   * 불리언 false 또는 스트링 "false" 여부 검사
   *  - request 시 "false" 전달 사유.
   * @param {string|boolean} bool
   * @returns {boolean}
   */
  isFalse(bool) {
    return bool === false || bool === 'false';
  },

  /**
   * Promise 함수 여부
   * @param val
   * @returns {*|boolean}
   */
  isPromise(val) {
    return val && typeof val.then === 'function';
  },
};
