'use strict';

const _ = require('lodash');
const co = require('co');
const rootRequire = require('root-require');
const TodoProvider = rootRequire('server/provider/todo/todo.provider');
const validate = require('../todo.validate');

/**
 * 할일 목록을 출력
 * @param conditions
 * @returns {Array.<T>|Aggregate|*|Query}
 */
function getTodos(conditions) {
  return new TodoProvider()
    .todoSearch(conditions.field)
    .skip(conditions.skip)
    .limit(conditions.limit)
    .sort(conditions.sort)
    .lean();
}

/**
 * 할일 카운트 리턴
 * @param conditions
 * @returns {*|Query}
 */
function getTodoCount(conditions) {
  return new TodoProvider().todoSearch(conditions).count();
}
/**
 * 검색 조건 빌드
 * @param {Object} query
 * @returns {{skip: number, limit: number, sort: string}}
 */
function buildConditions(query) {
  const clonedQuery = _.cloneDeep(query) || {};
  return {
    field: {
      title: clonedQuery.title,
      status: clonedQuery.status,
      context: clonedQuery.context,
      startDueDate: clonedQuery.startDueDate,
      endDueDate: clonedQuery.endDueDate,
      startDoneAt: clonedQuery.startDoneAt,
      endDoneAt: clonedQuery.endDoneAt,
      startCreatedAt: clonedQuery.startCreatedAt,
      endCreatedAt: clonedQuery.endCreatedAt,
    },
    skip: clonedQuery.skip || 0,
    limit: clonedQuery.limit || 10,
    sort: clonedQuery.sort || '-createdAt',
  };
}

/**
 * 페이지 단위의 할일 목록 호출
 * @param {Object} conditions
 * @returns {*}
 */
function getTodoPage(conditions) {
  return co(function* () {
    const todoQuery = getTodos(conditions);

    return yield {
      items: todoQuery.exec(),
      totalCount: getTodoCount(conditions.field),
      skip: todoQuery.skipCnt,
      limit: todoQuery.limitCnt,
      sort: todoQuery.sortField,
    };
  });
}

/**
 * 할일 목록 조회 서비스
 * @param query
 * @returns {*}
 */
module.exports.exec = (query) => {
  validate.checkListTodo(query);

  return getTodoPage(buildConditions(query));
};
