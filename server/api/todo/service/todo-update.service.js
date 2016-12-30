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
  if (todoData.status === 'done' && _.isNil(todoData.doneAt)) {
    todoData.doneAt = Date.now();
  }
  return todoData;
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

    const clonedBody = _.cloneDeep(todoData);
    delete clonedBody._id;

    const updateSet = buildUpdateSet(clonedBody);
    return yield updateTodo(todoId, updateSet);
  });
};
