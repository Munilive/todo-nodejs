'use strict';

/**
 * 도큐먼트 저장 방식은 크게 save, update 두가지로 나뉜다.
 *  - save 는 도큐먼트 최초생성 및 주요 데이터 변경시 사용된다.
 *  - update 는 플래그값, 카운팅값, 날짜값 등의 직접적이지 않은 변경사항 저장시 사용된다.
 *
 * 도큐먼트 삭제 방식 역시 두가지로 나뉘며 각각 아래와 같다.
 *  - DB 에서 데이터를 완전히 제거할 때 remove 를 사용한다.
 *  - 단순히 노출을 막기 위해서는 active 필드 값을 false 로 설정한다.
 */
const _ = require('lodash');

/**
 * 문서 저장
 * @param doc
 * @returns {Promise|*}
 */
function save(doc) {
  return doc.save();
}

/**
 * 다중 문서 저장
 * @param docs
 * @returns {Promise}
 */
function multiSave(docs) {
  return new Promise((resolve, reject) => {
    const savingDocs = [];
    let fin = docs.length;

    docs.forEach(doc => {
      doc.save((err, saved) => {
        if (err) {
          reject(err);
        } else {
          savingDocs.push(saved);
          if (!--fin) {
            resolve(savingDocs);
          }
        }
      });
    });
  });
}

/**
 * 문서와 변경사항 머지
 * @param updates
 * @returns {Function}
 */
function merge(updates) {
  delete updates._id;
  delete updates.createdAt;
  delete updates.__v;

  return (doc) => {
    return _.assignIn(doc, updates);
  };
}

/**
 * 변경사항 머지 후 저장
 * @param updates
 * @returns {Function}
 */
function saveUpdates(updates) {
  delete updates._id;
  delete updates.createdAt;
  delete updates.__v;

  return (doc) => {
    const updated = _.assignIn(doc, updates);
    return updated.save();
  };
}

/**
 * 일부 데이터 업데이트
 * @param updates
 * @returns {Function}
 */
function updateSets(updates) {
  return function updateDocument(doc) {
    if (typeof updates === 'object') {
      doc.update({ $set: updates }).exec();
    }
    return doc;
  };
}

/**
 * 노출 수 증가
 * @param doc
 * @returns {*}
 */
function plusViewCount(doc) {
  if (_.isObject(doc)) {
    if (!_.isUndefined(doc.viewCount)) {
      doc.update({ $inc: { viewCount: 1 } }).exec();
      doc.viewCount++;
    } else {
      doc.update({ $set: { viewCount: 1 } }).exec();
      doc.viewCount = 1;
    }
  }
  return doc;
}

/**
 * 도큐먼트 삭제
 * @param doc
 * @returns {*}
 */
function remove(doc) {
  doc.remove();
  return doc;
}

/**
 * 도큐먼트 비활성화
 * @param doc
 * @returns {*}
 */
function deactivate(doc) {
  if (doc.active) {
    doc.update({ $set: { active: false } }).exec();
  }
  return doc;
}


/**
 * module.exports.*
 */
module.exports.save = save;
module.exports.multiSave = multiSave;
module.exports.merge = merge;
module.exports.saveUpdates = saveUpdates;
module.exports.updateSets = updateSets;
module.exports.plusViewCount = plusViewCount;
module.exports.remove = remove;
module.exports.deactivate = deactivate;
