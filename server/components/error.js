'use strict';

const MESSAGE = {
  UNAUTHORIZED: 'Unauthorized',
  NOT_FOUND: 'Not Found',
  UNPROCESSABLE_ENTITY: 'Unprocessable Entity',
};

/**
 * 데이터 형태 에러 메세지 조합
 * - 몽구스의 ValidationError 포매팅 참조
 * @param message
 * @param fieldName
 * @returns {string|*|void|XML}
 */
function formatEntityMessage(message, fieldName) {
  return message.replace(/\{PATH}/g, fieldName);
}

/**
 * 인증 에러
 */
class UnauthorizedError extends Error {
  constructor(message, fieldName, fileName, fileNumber) {
    const msg = message
      ? formatEntityMessage(message, fieldName)
      : MESSAGE.UNAUTHORIZED;

    super(msg, fileName, fileNumber);

    this.name = 'UnauthorizedError';
    this.status = 401;
  }
}

/**
 * 데이터를 찾을 수 없을 경우의 에러
 */
class NotFoundError extends Error {
  constructor(message, fieldName, fileName, fileNumber) {
    const msg = message
      ? formatEntityMessage(message, fieldName)
      : MESSAGE.NOT_FOUND;

    super(msg, fileName, fileNumber);

    this.name = 'NotFoundError';
    this.status = 404;
  }
}

/**
 * 전달된 데이터 형태의 에러
 */
class EntityError extends Error {
  constructor(message, fieldName, fileName, fileNumber) {
    const msg = message
      ? formatEntityMessage(message, fieldName)
      : MESSAGE.UNPROCESSABLE_ENTITY;

    super(msg, fileName, fileNumber);

    this.name = 'EntityError';
    this.status = 422;
  }
}

module.exports = {
  UnauthorizedError,
  NotFoundError,
  EntityError,
};
