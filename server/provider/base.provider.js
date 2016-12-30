'use strict';

const _ = require('lodash');
const lang = require('../components/utils/lang');

/**
 * 밸리데이션
 *  - selectedField 는 필수
 * @private
 */
function validate() {
  if (_.isNil(this.selectedField)) {
    throw new Error('`selectedField`가 지정되지 않았습니다.');
  }
}

/**
 * 기본 프로바이더
 * @type {BaseProvider}
 */
module.exports = class BaseProvider {
  constructor(schema, selectedField) {
    this.schema = schema;
    this.conditions = {};

    this.sortField = null;
    this.skipCnt = 0;
    this.limitCnt = 10;

    this.selectedField = selectedField;
    this.populates = [];
    this.isLean = false;
    this.isSingleResult = false;
  }

  /**
   * 정렬
   * @param {string} fields - 정렬할 필드명
   * @returns {BaseProvider}
   */
  sort(fields) {
    if (_.isNil(fields) === false) {
      this.sortField = fields;
    }
    return this;
  }

  /**
   * 스킵
   * @param {number|string} skip - 건너뛸 수 (스트링의 경우 변환 후 숫자형이 되어야 함)
   * @returns {BaseProvider}
   */
  skip(skip) {
    if (lang.isNumber(skip)) {
      this.skipCnt = parseInt(skip, 10);
    }
    return this;
  }

  /**
   * 리밋
   * @param {number|string} limit - 출력할 수 (스트링의 경우 변환 후 숫자형이 되어야 함)
   * @returns {BaseProvider}
   */
  limit(limit) {
    if (lang.isNumber(limit)) {
      this.limitCnt = parseInt(limit, 10);
    }
    return this;
  }

  /**
   * 필드 선택
   *  - 띄어쓰기로 구분된 스트링
   * @param {string} fields - 출력 또는 제외할 필드명
   * @returns {BaseProvider}
   */
  select(fields) {
    if (!_.isNil(fields)) {
      this.selectedField = fields;
    }
    return this;
  }

  /**
   * 파퓰레이션
   * @param {Array|object} populates - 파퓰레이팅 조건 배열 또는 객체
   * @returns {BaseProvider}
   */
  populate(populates) {
    if (_.isArray(populates)) {
      this.populates = this.populates.concat(populates);
    } else if (_.isObject(populates)) {
      this.populates.push(populates);
    }
    return this;
  }

  /**
   * lean 이 전달된 경우 몽구스 모델에서 일반 모델로 변경
   *  - 성능이 더 나음.
   * @returns {BaseProvider}
   */
  lean() {
    this.isLean = true;
    return this;
  }

  /**
   * 단일 객체 응답 설정
   * @param singleResult
   * @returns {BaseProvider}
   */
  singleResult(singleResult) {
    this.isSingleResult = singleResult;
    return this;
  }

  /**
   * 쿼리 빌드
   * @returns {BaseProvider|*}
   */
  query() {
    validate.apply(this);

    let promise = null;

    if (this.isSingleResult) {
      promise = this.schema
        .findOne(this.conditions);
    } else {
      promise = this.schema
        .find(this.conditions);
    }

    this.populates.forEach((populate) => {
      promise = promise.populate(populate);
    });

    if (this.isLean) {
      promise.lean();
    }

    if (_.isNil(this.sortField)) {
      promise.sort(this.sortField);
    }

    return promise
      .select(this.selectedField)
      .skip(this.skipCnt)
      .limit(this.limitCnt);
  }

  /**
   * 카운트 리턴
   * @returns {*|Query}
   */
  count() {
    return this.schema.count(this.conditions);
  }

  /**
   * 쿼리 실행
   * @returns {*}
   */
  exec() {
    return this.query().exec();
  }
};
