'use strict';

const winston = require('winston');
require('./config/database');
const express = require('./config/express');
const config = require('./config/environment');

const app = express();

require('./routes')(app);

app.listen(3000);

winston.info('load app.js');
module.exports = app;
