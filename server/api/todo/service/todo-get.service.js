'use strict';

const winston = require('winston');
const _ = require('lodash');
const co = require('co');
const rootRequire = require('root-require');
const todoValidate = require('../todo.validate');
const todoMessage = rootRequire('server/constants/todo.message');
const NotFoundError = rootRequire('server/components/error').NotFoundError;
const TodoProvider = rootRequire('server/provider/todo/todo.provider');

/**
 * 할일 가져오기
 * @param {ObjectId|String} todoId
 * @returns {*}
 */
function getTodo(todoId) {
  return new TodoProvider()
    .todoId(todoId)
    .select('title status context dueDate createdAt doneAt') // 이거 넣어도 없는 필드는 안나옴
    .singleResult(true)
    .lean()
    .exec();
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
