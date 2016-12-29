'use strict';

const chosung = ['ㄱ', 'ㄲ', 'ㄴ', 'ㄷ', 'ㄸ', 'ㄹ', 'ㅁ', 'ㅂ', 'ㅃ', 'ㅅ', 'ㅆ', 'ㅇ', 'ㅈ',
  'ㅉ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ'];

const jungsung = ['ㅏ', 'ㅐ', 'ㅑ', 'ㅒ', 'ㅓ', 'ㅔ', 'ㅕ', 'ㅖ', 'ㅗ', 'ㅘ', 'ㅙ', 'ㅚ', 'ㅛ',
  'ㅜ', 'ㅝ', 'ㅞ', 'ㅟ', 'ㅠ', 'ㅡ', 'ㅢ', 'ㅣ'];

const jongsung = ['', 'ㄱ', 'ㄲ', 'ㄳ', 'ㄴ', 'ㄵ', 'ㄶ', 'ㄷ', 'ㄹ', 'ㄺ', 'ㄻ', 'ㄼ', 'ㄽ',
  'ㄾ', 'ㄿ', 'ㅀ', 'ㅁ', 'ㅂ', 'ㅄ', 'ㅅ', 'ㅆ', 'ㅇ', 'ㅈ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ'];

module.exports = {
  /**
   * 한글 자소분리
   * @param str
   * @returns {string}
   */
  phonemeSegmentation(str) {
    let charCode;
    let cho;
    let jung;
    let jong;

    let result = '';

    for (let i = 0, len = str.length; i < len; i++) {
      charCode = str.charCodeAt(i);

      if (charCode === 32) {
        continue;
      }

      if (charCode < 0xAC00 || charCode > 0xD7A3) {
        result += ` ${str.charAt(i)}`;
        continue;
      }

      charCode = charCode - 0xAC00;

      jong = charCode % 28;
      jung = ((charCode - jong) / 28) % 21;
      cho = (((charCode - jong) / 28) - jung) / 21;

      result += ` ${chosung[cho]}${jungsung[jung]}${jongsung[jong]}`;
    }

    return result.toLowerCase();
  },

  /**
   * 문자열 바이트 수 출력
   * @param str
   * @returns {Number|number}
   */
  getBytes(str) {
    return Buffer.byteLength(str, 'utf8');
  },
};
