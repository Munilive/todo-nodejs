'use strict';

const co = require('co');
const _ = require('lodash');
const validate = require('../todo.validate');
const rootRequire = require('root-require');
const Todo = rootRequire('server/model/todo.model');

/**
 * 할일 생성
 * @param {Object} doc
 * @returns {*|Query}
 */
function createTodo(doc) {
  return Todo.create(doc);
}

/**
 * create 데이터 가공
 * @param body
 * @returns {{title: (*|string|String|TodoSchema.title|{type, required}|string), status, content, dueDate: (*|Date)}}
 */
function buildDoc(body) {
  const clonedBody = _.cloneDeep(body);
  const fields = ['title', 'status', 'context', 'dueDate'];
  const createSet = {};

  fields.forEach((field) => {
    createSet[field] = clonedBody[field];
  });
  return createSet;
}

module.exports.exec = (body) => {
  validate.checkCreateTodo(body);

  return co(function* () {
    const doc = buildDoc(body);

    const todo = yield createTodo(doc);

    return {
      _id: todo._id,
    };
  });
};
