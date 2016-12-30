'use strict';

const _ = require('lodash');
const rootRequire = require('root-require');
const BaseProvider = require('../base.provider');
const Todo = rootRequire('server/model/todo.model');

const DEFAULT_SELECT = '-__v';

function getStartDate(date) {
  return new Date(`${date} 00:00:00`);
}

function getEndDate(date) {
  return new Date(`${date} 23:59:59`);
}

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

  /**
   * 할일 검색
   * @param {Object} fields
   * @param {string} fields.title - 제목
   * @param {string} fields.status - 할 일 상태 todo, in_progress, done
   * @param {string} fields.context - 할 일 컨텍스트 none, work, home
   * @param {string} fields.startDueDate - 예상 마감일 조회 시작일
   * @param {string} fields.endDueDate - 예상 마감일 조회 종료일
   * @param {string} fields.startDoneAt - 완료일 조회 시작일
   * @param {string} fields.endDoneAt - 완료일 조회 종료일
   * @param {string} fields.startCreatedAt - 생성일 조회 시작일
   * @param {string} fields.endCreatedAt - 생성일 조회 종료일
   * @returns {TodoProvider}
   */
  todoSearch(fields) {
    const andQuery = [];

    if (_.isNil(fields.title) === false) {
      andQuery.push({ title: new RegExp(fields.title, 'i') });
      // this.conditions.title = new RegExp(fields.title, 'i');
    }
    if (_.isNil(fields.status) === false) {
      andQuery.push({ status: fields.status });
      // this.conditions.status = fields.status;
    }
    if (_.isNil(fields.context) === false) {
      andQuery.push({ context: fields.context });
      // this.conditions.context = fields.context;
    }

    if (_.isNil(fields.startDueDate) === false && _.isNil(fields.endDueDate) === false) {
      andQuery.push({ dueDate: {
        $gte: getStartDate(fields.startDueDate),
        $lte: getEndDate(fields.endDueDate),
      },
      });
      // this.conditions.dueDate = {
      //   $gte: getStartDate(fields.startDueDate),
      //   $lte: getEndDate(fields.endDueDate),
      // };
    }

    if (_.isNil(fields.startDoneAt) === false && _.isNil(fields.endDueDate) === false) {
      andQuery.push({ doneAt: {
        $gte: getStartDate(fields.startDoneAt),
        $lte: getEndDate(fields.endDoneAt),
      },
      });
      // this.conditions.doneAt = {
      //   $gte: getStartDate(fields.startDoneAt),
      //   $lte: getEndDate(fields.endDoneAt),
      // };
    }

    if (_.isNil(fields.startCreatedAt) === false && _.isNil(fields.endCreatedAt) === false) {
      andQuery.push({ createdAt: {
        $gte: getStartDate(fields.startCreatedAt),
        $lte: getEndDate(fields.endCreatedAt),
      },
      });
      // this.conditions.createdAt = {
      //   $gte: getStartDate(fields.startCreatedAt),
      //   $lte: getEndDate(fields.endCreatedAt),
      // };
    }

    if (andQuery.length > 0) {
      this.conditions = { $and: andQuery };
    }
    return this;
  }

};
