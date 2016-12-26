'use strict';

/**
 * Created by munilive on 16. 12. 26.
 */

const express = require('express');
const mongoose = require('mongoose');

const app = express();

app.route('/api', function () {
  console.log('api 요청');
});

app.get('/', (req, res) => {
  console.log('Hello Node');
  res.send('Hello Node');
});

app.all('*', (req, res) => {
  console.log('all request');
  // console.log('All Request', req);
  // console.log('All Response', res);
  res.sendStatus(404);
});

module.exports = app;
