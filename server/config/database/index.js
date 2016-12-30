'use strict';

const winston = require('winston');
const mongoose = require('mongoose');
mongoose.Promise = Promise;
const config = require('../environment');

// mongoose.connect('mongodb://localhost/node-study');
// const connection = mongoose.connection;
const connection = mongoose.createConnection(config.db.uri, config.db.options);

connection.on('connecting', (arg1, arg2) => {
  winston.info('database connecting');
  winston.info(`arg1 ${arg1}`);
  winston.info(`arg2 ${arg2}`);
});

connection.on('connected', () => {
  winston.info('database connection success');
});

connection.on('error', (err) => {
  winston.error('database connection error');
  winston.error(err);
  winston.info('err.stack');
  winston.error(err.stack);
  connection.db.close();
  process.exit(-1);
});

winston.info('database 설정 로드');

module.exports = connection;
