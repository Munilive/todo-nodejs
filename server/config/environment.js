'use strict';

const winston = require('winston');
const path = require('path');

const serverEnv = {
  // 기준 환경
  env: process.env.NODE_ENV,

  // 서버 루트 경로
  root: path.normalize(`${__dirname}/../..`),

  // 서버 IP 주소
  ip: process.env.IP || undefined,

  // 서버 포트
  port: process.env.PORT || 3000,

  // 헬스체크 경로 로그밸런서에서 헬스 체크를 위해 사용하는 것으로 판단됨
  healthCheck: process.env.HEALTH_CHECK_URL || '/health',

  // 기준 시간대
  timezone: process.env.TZ || 'Asia/Seoul',

  // 똑닥 서비스 데이터베이스(MongoDB) 접속정보
  ddocdocDb: {
    uri: process.env.DDOCDOC_DB_URI,
    options: {
      db: {
        safe: true,
      },
      server: {
        poolSize: process.env.DDOCDOC_DB_POOL_SIZE || 5,
      },
    },
  },
};

winston.info('서버 환경 설정');
winston.info(serverEnv);
console.log(serverEnv);

/**
 * object 환경 변수
 * @type {{}}
 */
module.exports = serverEnv;
