'use strict';

const express = require('express');
const controller = require('./todo.controller');

const router = express.Router();

/**
 * 할일 리스트 출력
 */
router.get('/', controller.list);

/**
 * 할일 가져오기
 */
router.get('/:todoId', controller.get);

/**
 * 할일 등록
 */
router.post('/', controller.create);

/**
 * 할일 수정
 */
router.put('/:todoId', controller.update);

/**
 * 할일 삭제
 */
router.delete('/:todoId', controller.remove);

module.exports = router;
