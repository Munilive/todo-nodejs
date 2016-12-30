'use strict';

const winston = require('winston');
const _ = require('lodash');
const co = require('co');
const rootRequire = require('root-require');
const todoValidate = require('../todo.validate');
const Todo = rootRequire('server/model/todo.model');
const NotFoundError = rootRequire('server/components/error').NotFoundError;
const todoMessage = rootRequire('server/constants/todo.message');
const TodoProvider = rootRequire('server/provider/todo/todo.provider');

/**
 * 할일 검색
 * @param {ObjectId|String} todoId
 * @returns {*}
 */
function getTodo(todoId) {
  return new TodoProvider()
    .todoId(todoId)
    .singleResult(true)
    .lean()
    .exec();
}

/**
 * 업데이트 데이터 가공
 * @param {Object} todoData
 * @returns {Object}
 */
function buildUpdateSet(todoData) {
  const clonedBody = _.cloneDeep(todoData);
  const updateSet = {};

  if (_.isNil(clonedBody.title) === false) {
    updateSet.title = clonedBody.title;
  }

  if (_.isNil(clonedBody.context) === false) {
    updateSet.context = clonedBody.context;
  }

  if (_.isNil(clonedBody.status) === false) {
    updateSet.status = clonedBody.status;
  }

  if (_.isNil(clonedBody.dueDate) === false) {
    updateSet.dueDate = clonedBody.dueDate;
  }

  if (clonedBody.status === 'done' && _.isNil(clonedBody.doneAt)) {
    updateSet.doneAt = Date.now();
  }
  return updateSet;
}

/**
 * 할일 업데이트 처리
 * @param {ObjectId|String} todoId - 할일 ID
 * @param {Object} updateSet
 * @returns {*}
 */
function updateTodo(todoId, updateSet) {
  return Todo.findByIdAndUpdate(todoId, { $set: updateSet });
}

/**
 * 할일 업데이트 서비스
 * @param {ObjectId|String} todoId
 * @param {Object} todoData
 * @returns {*}
 */
module.exports.exec = (todoId, todoData) => {
  winston.info(todoId);
  winston.info(todoData);

  todoValidate.checkUpdateTodo(todoId, todoData);

  return co(function* () {
    const todo = yield getTodo(todoId);

    if (_.isNil(todo)) {
      throw new NotFoundError(todoMessage.NOT_FOUND_TODO);
    }

    const updateSet = buildUpdateSet(todoData);
    return yield updateTodo(todoId, updateSet);
  });
};
