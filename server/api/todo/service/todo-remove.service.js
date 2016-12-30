'use strict';

const winston = require('winston');
const co = require('co');
const _ = require('lodash');
const todoValidate = require('../todo.validate');
const rootRequire = require('root-require');
const todoMessage = rootRequire('server/constants/todo.message');
const NotFoundError = rootRequire('server/components/error').NotFoundError;
const Todo = rootRequire('server/model/todo.model');
const TodoProvider = rootRequire('server/provider/todo/todo.provider');

/**
 * 할일 검색
 * @param {ObjectId|String} todoId - 할일 ID
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
 * 할일 삭제
 * @param {ObjectId|String} todoId - 할일 ID
 * @returns {*}
 */
function removeTodo(todoId) {
  return Todo.remove({ _id: todoId });
}

module.exports.exec = (todoId) => {
  winston.info(todoId);

  todoValidate.checkRemoveTodo(todoId);

  return co(function* () {
    const todo = yield getTodo(todoId);

    if (_.isNil(todo)) {
      throw new NotFoundError(todoMessage.NOT_FOUND_TODO);
    }

    return removeTodo(todoId);
  });
};
