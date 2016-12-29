'use strict';

module.exports = {
  NOT_FOUND_TODO: '할일(`Todo`)이 존재하지 않습니다.',
  MISSING_ID: '할일 ID(`{PATH}`)가 누락됐습니다.',
  WRONG_TYPEOF_ID: '할일 ID(`{PATH}`)의 데이터 타입은 몽고 DB의 `ObjectId`입니다.',
  MISSING_TITLE: '할일의 제목(`{PATH}`)이 누락됐습니다.',
  WRONG_TYPEOF_STATUS: '`status`는 `todo, in_progress, done` 만 지정 할 수 있습니다.',
  WRONG_TYPEOF_CONTEXT: '`context`는 `none, work, home` 만 지정 할 수 있습니다.',
};
