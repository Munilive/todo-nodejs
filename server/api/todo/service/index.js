'use strict';

const listService = require('./todo-list.service');
const getService = require('./todo-get.service');
const createService = require('./todo-create.service');
const updateService = require('./todo-update.service');
const removeService = require('./todo-remove.service');

module.exports = {
  list: listService.exec,
  get: getService.exec,
  create: createService.exec,
  update: updateService.exec,
  remove: removeService.exec,
};
