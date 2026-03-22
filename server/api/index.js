'use strict';

const winston = require('winston');
const ENV = require('./config/environment.constants').ENV;

const DEVELOPMENT = ENV.DEVELOPMENT;

process.env.NODE_ENV = process.env.NODE_ENV || DEVELOPMENT;

require('./app.js');
