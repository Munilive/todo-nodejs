'use strict';

const _ = require('lodash');
const rootRequire = require('root-require');
const BaseProvider = require('../base.provider');
const Todo = rootRequire('server/model/todo.model');

const DEFAULT_SELECT = '-__v';

/**
 * 할일 데이터 프로바이더
 * @type {TodoProvider}
 */
module.exports = class TodoProvider extends BaseProvider {
  constructor(fields) {
    super(Todo, fields || DEFAULT_SELECT);
  }

  /**
   * 할일 ID 지정
   * @param {ObjectId|String} todoId - 할일 ID
   * @returns {TodoProvider}
   */
  todoId(todoId) {
    if (_.isNil(todoId) === false) {
      this.conditions._id = todoId;
    }
    return this;
  }
};
