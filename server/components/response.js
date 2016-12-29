'use strict';

const winston = require('winston');
const rootRequire = require('root-require');
const commonMessage = rootRequire('server/constants/common.message');

/**
 * HTTP 응답은 JSON 타입의 데이터를 전달하는 것을 기본으로 한다.
 *
 * 사용되는 HTTP Status
 *  - 200 OK                      : GET 방식의 성공시
 *  - 201 Created                 : POST 와 일부 PUT 방식의 성공시
 *  - 204 No Content              : 일부 PUT 과 DELETE 방식의 성공시
 *  - 401 Unauthorized            : 인증되지 않음
 *  - 403 Forbidden               : 401과 같음
 *  - 404 Not Found               : 데이터 또는 경로가 없음
 *  - 422 Unprocessable Entity    : 전달된 데이터의 형태가 유효하지 않음
 *  - 500 Internal Server Error   : 처리되지 않은 서버 에러
 */

/**
 * JSON 에러 응답
 * @param res
 * @param status
 * @param msg
 * @returns {*}
 */
function respondError(res, status, msg) {
  let message = msg;
  // 코드에 고려되지 않은 에러를 처리하기 위한 안내 문구 추가
  if (status === 500) {
    message = `${commonMessage.DEFAULT_ERROR}(${msg})`;
  }
  return res
    .status(status)
    .json({
      error: { status, message },
    });
}

/**
 * 몽구스 밸리데이션 에러 메세지 응답
 * @param err
 * @param res
 * @returns {*}
 */
function respondMongooseValidationError(err, res) {
  const status = err.status || 422;
  const msg = `${commonMessage.DEFAULT_ERROR} (${err.errors[Object.keys(err.errors)[0]].message})`;
  return respondError(res, status, msg);
}

/**
 * 몽구스 캐스팅 에러 메세지 응답
 * @param err
 * @param res
 * @returns {*}
 */
function respondMongooseCastError(err, res) {
  const status = err.status || 422;
  const castMessage = `\`${err.path}\` 필드는 ${err.kind} 타입이므로, \`${err.value}\`가 담길 수 없습니다.`;
  const msg = `${commonMessage.DEFAULT_ERROR} (${castMessage})`;
  return respondError(res, status, msg);
}

/**
 * JSON 웹 토큰의 인증 에러 메세지 응답
 * @param err
 * @param res
 * @returns {*}
 */
function respondUnauthorizedError(err, res) {
  let msg = '';
  switch (err.code) {
    case 'credentials_required':
      msg = 'Authorization 헤더가 누락됐습니다.';
      break;
    case 'credentials_bad_format':
      msg = 'Authorization 헤더는 `Bearer [인증 토큰]`을 갖는 형태입니다.';
      break;
    case 'invalid_token':
      if (err.message === 'jwt expired') {
        msg = '인증 토큰이 만료되었습니다.';
      } else {
        msg = '유효하지 않은 인증 토큰이 전달되었습니다.';
      }
      break;
    default:
      msg = err.message;
      break;
  }
  return respondError(res, err.status || 401, msg);
}

/**
 * 기본 에러 메세지 응답
 * @param err
 * @param res
 * @param statusCode
 * @returns {*}
 */
function respondDefaultError(err, res, statusCode) {
  const status = err.status || statusCode || 500;
  const msg = err.message || commonMessage.DEFAULT_ERROR;
  return respondError(res, status, msg);
}

module.exports = {
  /**
   * 200 OK 응답 함수
   * @param req
   * @param res
   */
  sendOK(req, res) {
    res.status(200).end('OK');
  },

  /**
   * 404 Not Found 응답 함수
   * @param req
   * @param res
   */
  sendNotFound(req, res) {
    res.status(404).end('Not Found');
  },

  /**
   * 요청한 데이터를 JSON 데이터로 전달
   * @param res
   * @param statusCode
   * @returns {function(*=)}
   */
  respondWithResult(res, statusCode) {
    const status = statusCode || 200;
    return (entity) => {
      if (entity) {
        res.status(status).json(entity);
      }
      return entity;
    };
  },

  /**
   * 성공하였으나 전달할 데이터 없음
   * @param res
   * @returns {function(*)}
   */
  respondWithNoContent(res) {
    return (entity) => {
      res.status(204).end('No Content');
      return entity;
    };
  },

  /**
   * 실패 메세지를 JSON 향테로 응답
   * @param res
   * @param statusCode
   * @returns {function(*=)}
   */
  handleError(res, statusCode) {
    return (err) => {
      winston.error(err);
      winston.error(err.stack);

      switch (err.name) {
        case 'ValidationError':
          return respondMongooseValidationError(err, res);
        case 'CastError':
          return respondMongooseCastError(err, res);
        case 'UnauthorizedError':
          return respondUnauthorizedError(err, res);
        default:
          return respondDefaultError(err, res, statusCode);
      }
    };
  },
};
