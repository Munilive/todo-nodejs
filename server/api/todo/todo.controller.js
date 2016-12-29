'use strict';

const winston = require('winston');
const service = require('./service');
const response = require('../../components/response');

module.exports = {
  list(req, res) {
    winston.info('todo list');
    const query = req.query;
    winston.info(query);

    service.list(query)
      .then(response.respondWithResult(res))
      .catch(response.handleError(res));
  },

  /**
   * 할일 가져오기
   * @param req
   * @param res
   */
  get(req, res) {
    winston.info('todo get id');
    const todoId = req.params.todoId;

    service.get(todoId)
      .then(response.respondWithResult(res))
      .catch(response.handleError(res));
  },

  /**
   * 할일 생성
   * @param req
   * @param res
   */
  create(req, res) {
    winston.info('todo create');
    const body = req.body;

    service.create(body)
      .then(response.respondWithResult(res, 201))
      .catch(response.handleError(res));
  },

  /**
   * 할일 수정
   * @param req
   * @param res
   */
  update(req, res) {
    winston.info('todo update');
    const todoId = req.params.todoId;
    const todoData = req.body;

    service.update(todoId, todoData)
      .then(response.respondWithNoContent(res))
      .catch(response.handleError(res));
  },

  /**
   * 할일 삭제
  * @param req
   * @param res
   */
  remove(req, res) {
    winston.info('delete todo');
    const todoId = req.params.todoId;

    service.remove(todoId)
      .then(response.respondWithNoContent(res))
      .catch(response.handleError(res));
  },
};
