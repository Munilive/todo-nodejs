'use strict';

const _ = require('lodash');

/**
 * 두 날짜 사이의 값
 * @param {string} startDate
 * @param {string} endDate
 * @returns {{$gte: (Date|global.Date), $lte: (Date|global.Date)}}
 */
function betweenUTC(startDate, endDate) {
  return {
    $gte: new Date(`${startDate} 00:00:00.000`),
    $lte: new Date(`${endDate} 23:59:59.999`),
  };
}

/**
 * 서울 표준시 기준 두 날짜 사이의 값
 * @param {string} startDate
 * @param {string} endDate
 * @returns {{$gte: (Date|global.Date), $lte: (Date|global.Date)}}
 */
function betweenKST(startDate, endDate) {
  return {
    $gte: new Date(`${startDate}T00:00:00.000Z`),
    $lte: new Date(`${endDate}T23:59:59.999Z`),
  };
}

/**
 * 전달된 날짜보다 빠른 날짜 검색
 * @param {Date|number|string} date
 * @returns {{$lte: Date}}
 */
function beforeThen(date) {
  if (!_.isDate(date)) {
    date = new Date(date);
  }
  return { $lte: date };
}

/**
 * 전달된 날짜보다 느린 날짜 검색
 * @param {Date|number|string} date
 * @returns {{$gte: Date}}
 */
function afterThen(date) {
  if (!_.isDate(date)) {
    date = new Date(date);
  }
  return { $gte: date };
}

/**
 * 배열 내 포함 값 쿼리
 *  - 콤마로 구분된 스트링, 배열
 * @param {Array|string} array
 * @returns {{$in: (Array|*)}}
 */
function includes(array) {
  return {
    $in: Array.isArray(array) ? array : array.split(','),
  };
}

/**
 * 배열 내 미포함 값 쿼리
 *  - 콤마로 구분된 스트링, 배열
 * @param array
 * @returns {{$nin: (Array|*)}}
 */
function notIncludes(array) {
  return {
    $nin: Array.isArray(array) ? array : array.split(','),
  };
}

/**
 * 정규식 쿼리
 * @param text
 * @returns {{$regex: RegExp}}
 */
function regex(text) {
  return {
    $regex: new RegExp(text, 'i'),
  };
}

/**
 * 다중 정규식 쿼리
 * @param texts
 * @returns {{$regex: RegExp}}
 */
function regexArray(texts) {
  return {
    $regex: new RegExp(texts.replace(/,/g, '|')),
  };
}

/**
 * 불리언 변환 쿼리
 * @param {boolean|string} flag
 * @returns {boolean}
 */
function toBoolean(flag) {
  return _.isBoolean(flag) ? flag : flag === 'true';
}

/**
 * 근거리 데이터 호출 쿼리
 *  - GeoJSON 타입 필드 사용
 * @param lat
 * @param lng
 * @param maxDistance
 * @returns {{$near: {$geometry: {type: string, coordinates: *[]}}}}
 */
function near(lat, lng, maxDistance) {
  const query = {
    $near: {
      $geometry: {
        type: 'Point',
        coordinates: [lng, lat],
      },
    },
  };

  if (typeof maxDistance !== 'undefined') {
    query.$near.$maxDistance = maxDistance;
  }
  return query;
}

/**
 * module.exports.*
 */
module.exports.betweenUTC = betweenUTC;
module.exports.betweenKST = betweenKST;
module.exports.beforeThen = beforeThen;
module.exports.afterThen = afterThen;
module.exports.includes = includes;
module.exports.notIncludes = notIncludes;
module.exports.regex = regex;
module.exports.regexArray = regexArray;
module.exports.toBoolean = toBoolean;
module.exports.near = near;
