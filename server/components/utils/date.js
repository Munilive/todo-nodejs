'use strict';

const WRONG_TYPEOF_DATE = 'Date 타입으로 변환할 수 없는 매개변수(`date`)가 전달되었습니다.';

/**
 * 10보다 작은 숫자앞에 0 패딩
 * @param num
 * @returns {*}
 * @private
 */
function padZero(num) {
  return num < 10 ? `0${num}` : `${num}`;
}

module.exports = {
  /**
   * 날짜를 받아 `yyyyMMdd` 스트링 리턴
   * @param date
   * @returns {string}
   */
  getDate(date) {
    const source = new Date(date);
    if (isNaN(source.getTime())) {
      throw new Error(WRONG_TYPEOF_DATE);
    }
    return source.getFullYear() + (padZero(source.getMonth() + 1)) + padZero(source.getDate());
  },

  /**
   * 날짜를 받아 `HHmmssSSS` 스트링 리턴
   * @param date
   * @returns {*}
   */
  getTimeOnly(date) {
    const source = new Date(date);
    if (isNaN(source.getTime())) {
      throw new Error(WRONG_TYPEOF_DATE);
    }
    return padZero(source.getHours())
      + padZero(source.getMinutes())
      + padZero(source.getSeconds())
      + padZero(source.getMilliseconds());
  },

  /**
   * 날짜를 받아 `yyyy-MM-dd` 스트링 리턴
   * @param {Date|string|number} date
   * @returns {string}
   */
  toDateString(date) {
    const source = new Date(date);
    if (isNaN(source.getTime())) {
      throw new Error(WRONG_TYPEOF_DATE);
    }
    return `${source.getFullYear()}-${padZero(source.getMonth() + 1)}-${padZero(source.getDate())}`;
  },

  /**
   * 날짜를 받아 `HH:mm` 스트링 리턴
   * @param {Date|string|number} date
   * @returns {string}
   */
  toTimeString(date) {
    const source = new Date(date);
    if (isNaN(source.getTime())) {
      throw new Error(WRONG_TYPEOF_DATE);
    }
    return `${padZero(source.getHours())}:${padZero(source.getMinutes())}`;
  },
};
