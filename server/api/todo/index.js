'use strict';

const winston = require('winston');
const _ = require('lodash');
const express = require('express');
const response = require('../../components/response');
const todoValidate = require('./todo.validate');
const EntityError = require('../../components/error').EntityError;
const todoMessage = require('../../constants/todo.message');
/**
 * @var {Model|*|Aggregate}
 */
const Todo = require('../../model/todo.model');

const router = express.Router();

/**
 * 할일 리스트 출력
 */
router.get('/', (req, res) => {
  winston.info('todo list');
  const query = req.query;
  winston.info(query);

  Todo
    .find(query)
    .sort('-dueDate -createdAt')
    .then((data) => {
      response.respondWithResult(res)({
        items: data,
      });
    })
    .catch(response.handleError(res));

  // response.respondWithResult(res)('list');
});

/**
 * 할일 아이디 검색
 */
router.get('/:todoId', (req, res) => {
  winston.info('todo get id');
  const todoId = req.params.todoId;

  todoValidate.checkGetTodo(todoId);
  winston.info(todoId);

  Todo
    .findOne({ _id: todoId })
    .then(response.respondWithResult(res))
    .catch(response.handleError(res));
});

/**
 * 할일 등록
 */
router.post('/', (req, res) => {
  winston.info('todo create');
  const body = req.body;

  todoValidate.checkCreateTodo(body);

  Todo.create(body).then((todo) => {
    winston.info('Saved!!');
    response.respondWithResult(res, 201)({
      _id: todo._id,
    });
  }).catch(response.handleError(res));

  // save는 존재하지 않은 경우 추가 하고 존재하는 경우 업데이트 처리 함.
  // const create = new Todo(body);
  // create.save().then((todo) => {
  //   winston.info('Saved!!');
  //   response.respondWithResult(res, 201)({
  //     _id: todo._id,
  //   });
  // }).catch((err) => {
  //   winston.error(err);
  // });
});

/**
 * 할일 수정
 */
router.put('/:todoId', (req, res) => {
  winston.info('todo update');
  const todoId = req.params.todoId;
  const todoData = req.body;

  winston.info(todoId);
  winston.info(todoData);

  todoValidate.checkUpdateTodo(todoId, todoData);

  const updateSet = _.cloneDeep(todoData);
  delete updateSet._id;

  if (updateSet.status === 'done' && _.isNil(updateSet.dueDate)) {
    updateSet.dueDate = Date.now();
  }

  winston.info(todoData);
  winston.info(updateSet);

  Todo
    .findOne({ _id: todoId })
    .then((todo) => {
      if (_.isNil(todo)) {
        throw new EntityError(todoMessage.MISSING_ID);
      }

      Todo
        .findByIdAndUpdate(todoId, { $set: updateSet })
        .then(response.respondWithNoContent(res))
        .catch(response.handleError(res));
    })
    .catch(response.handleError(res));
});

/**
 * 할일 삭제
 */
router.delete('/:todoId', (req, res) => {
  winston.info('delete todo');
  const todoId = req.params.todoId;

  todoValidate.checkRemoveTodo(todoId);

  Todo
    .findById(todoId).then((todo) => {
      if (_.isNil(todo)) {
        throw new EntityError(todoMessage.MISSING_ID);
      }

      Todo
        .remove({ _id: todoId })
        .then(response.respondWithNoContent(res))
        .catch(response.handleError(res));
    })
    .catch(response.handleError(res));
});

module.exports = router;
