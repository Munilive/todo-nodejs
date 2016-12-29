'use strict';

/**
 * 조합에 요소 추가
 * @param sources
 * @param element
 * @param r
 * @returns {Array}
 * @private
 */
function addElement(sources, element, r) {
  const elements = [];
  const size = sources.length;

  for (let i = 0; i < size; i++) {
    if (sources[i].length < r) {
      const nextElement = JSON.parse(JSON.stringify(sources[i]));
      nextElement.push(element);

      elements.push(nextElement);
    }
  }

  return elements;
}

/**
 * 배열의 조합
 * @param array
 * @param limit
 * @returns {*[]}
 */
function getCombinations(array, limit) {
  const combinations = [[]];
  const r = limit ? Math.abs(limit) : array.length;

  while (array.length) {
    const elements = addElement(combinations, array.shift(), r);
    const size = elements.length;
    for (let i = 0; i < size; i++) {
      combinations.push(elements[i]);
    }
  }

  return combinations;
}

/**
 * 정해진 순서로 배열의 엘리먼트 정렬
 * @param array
 * @param indexes
 * @returns {*}
 */
function sortByIndexes(array, indexes) {
  const sortKey = Object.keys(indexes)[0];
  const sortValue = String(indexes[sortKey]);
  return array.sort((a, b) => (
    sortValue.indexOf(String(a[sortKey])) - sortValue.indexOf(String(b[sortKey]))
  ));
}

/**
 * module.exports.*
 */
module.exports.getCombinations = getCombinations;
module.exports.sortByIndexes = sortByIndexes;
