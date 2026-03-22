'use strict';

const winston = require('winston');
require('./config/database');
const express = require('./config/express');
const config = require('./config/environment');

const app = express();

require('./routes')(app);

app.listen(config.port);

winston.info(`Start Express Server listening on ${config.port}, in ${app.get('env')} mode`);
module.exports = app;
