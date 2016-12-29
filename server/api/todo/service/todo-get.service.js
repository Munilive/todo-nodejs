'use strict';

const winston = require('winston');
const _ = require('lodash');
const co = require('co');
const rootRequire = require('root-require');
const todoValidate = require('../todo.validate');
const todoMessage = rootRequire('server/constants/todo.message');
const NotFoundError = rootRequire('server/components/error').NotFoundError;
const Todo = rootRequire('server/model/todo.model');

/**
 * 할일 가져오기
 * @param {ObjectId|String} todoId
 * @returns {*}
 */
function getTodo(todoId) {
  return Todo.findOne({ _id: todoId });
}

module.exports.exec = (todoId) => {
  winston.info(todoId);

  todoValidate.checkGetTodo(todoId);

  return co(function* () {
    const todo = yield getTodo(todoId);

    if (_.isNil(todo)) {
      throw new NotFoundError(todoMessage.NOT_FOUND_TODO);
    }

    return todo;
  });
};
