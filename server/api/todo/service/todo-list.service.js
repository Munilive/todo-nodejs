'use strict';

const _ = require('lodash');
const co = require('co');
const rootRequire = require('root-require');
const Todo = rootRequire('server/model/todo.model');

/**
 * 할일 목록을 출력
 * @param query
 * @returns {Array.<T>|Aggregate|*|Query}
 */
function getList(query) {
  return Todo.find(query).sort('dueDate -createdAt');
}

/**
 * 검색 조건 빌드
 * @param {Object} query
 * @returns {{skip: number, limit: number, sort: string}}
 */
function buildConditions(query) {
  return {
    skip: query.skip || 0,
    limit: query.limit || 10,
    sort: query.sort || 'dueDate -createdAt',
  };
}

/**
 * 할일 목록 조회 서비스
 * @param query
 * @returns {*}
 */
module.exports.exec = (query) => {
  return co(function* () {
    const todoQuery = buildConditions(query);

    return yield {
      items: getList(todoQuery),
    };
  });
};
