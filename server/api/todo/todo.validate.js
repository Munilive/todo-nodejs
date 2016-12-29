'use strict';

const _ = require('lodash');
const todoMessage = require('../../constants/todo.message');
const commonMessage = require('../../constants/common.message');
const commonValidate = require('../../components/common.validate');
const lang = require('../../components/utils/lang');
const EntityError = require('../../components/error').EntityError;

/**
 * 할일 ID 유효성 검사
 * @param {ObjectId|String} todoId
 */
function checkId(todoId) {
  // 전달되지 않았거나, 빈 경우 에러 처리
  if (_.isNil(todoId) || _.isEmpty(todoId)) {
    throw new EntityError(todoMessage.MISSING_ID, 'todoId');
  }
  // ObjectId로 변환할 수 없는 데이터인 경우 에러 처리
  if (lang.isObjectId(todoId) === false) {
    throw new EntityError(todoMessage.WRONG_TYPEOF_ID, 'todoId');
  }
}

/**
 * 할일 제목 유효성 검사
 * @param {String} title
 */
function checkTitle(title) {
  // 전달되지 않았거나, 빈 경우 에러 처리
  if (_.isNil(title) || _.isEmpty(title)) {
    throw new EntityError(todoMessage.MISSING_TITLE, 'title');
  }
}

/**
 * 할 일 상태 값을 검사
 * @param {String} status
 */
function checkStatus(status) {
  // 항목이 존재 하고 유효한 타입이 아닌 경우 에러 처리
  if (!_.isNil(status)
    && ['todo', 'in_progress', 'done'].indexOf(status.toLowerCase()) === -1) {
    throw new EntityError(todoMessage.WRONG_TYPEOF_STATUS);
  }
}

/**
 * 할 일 컨텍스트 값을 검사
 * @param {String} context
 */
function checkContext(context) {
  // 항목이 존재 하고 유효한 타입이 아닌 경우 에러 처리
  if (!_.isNil(context)
    && ['none', 'work', 'home'].indexOf(context.toLowerCase()) === -1) {
    throw new EntityError(todoMessage.WRONG_TYPEOF_CONTEXT);
  }
}

/**
 * 날짜 데이터 타입 유효성 체크
 * @param {Date} date - 날짜
 * @param {string} fieldName - 필드명
 */
function checkDateType(date, fieldName) {
  if (!_.isNil(date)) {
    if (!lang.isDateString(date) && !lang.isDatetimeString(date)) {
      throw new EntityError(commonMessage.WRONG_DATA_TYPE, fieldName);
    }
  }
}

module.exports = {
  /**
   * 할일 목록 조회 유효성 검사
   * @param {Object} query
   */
  checkListTodo(query) {
    commonValidate.checkSkip(query.skip);
    commonValidate.checkLimit(query.limit);
  },

  /**
   * 할일 상세 조회 유효성 검사
   * @param {ObjectId|String} todoId
   */
  checkGetTodo(todoId) {
    checkId(todoId);
  },

  /**
   * 할일 생성 유효성 검사
   * @param {Object} todoData
   * @param {string} todoData.title
   * @param {string} todoData.status
   * @param {string} todoData.context
   * @param {Date} todoData.dueDate
   */
  checkCreateTodo(todoData) {
    checkTitle(todoData.title);
    checkStatus(todoData.status);
    checkContext(todoData.context);
    checkDateType(todoData.dueDate, 'dueDate');
  },

  /**
   * 할일 수정 유효성 검사
   * @param {ObjectId|String} todoId
   * @param {Object} todoData
   * @param {string} todoData.status
   * @param {string} todoData.context
   * @param {Date} todoData.dueDate
   */
  checkUpdateTodo(todoId, todoData) {
    checkId(todoId);
    checkStatus(todoData.status);
    checkContext(todoData.context);
    checkDateType(todoData.dueDate, 'dueDate');
  },

  /**
   * 할일 제거 유효성 검사
   * @param {ObjectId|String} todoId
   */
  checkRemoveTodo(todoId) {
    checkId(todoId);
  },
};
