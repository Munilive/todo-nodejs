'use strict';

const mongoose = require('mongoose');
mongoose.Promise = Promise;
const database = require('../config/database');
const todoMessage = require('../constants/todo.message');

const Schema = mongoose.Schema;

const TodoSchema = new Schema({
  title: {
    type: String,
    required: todoMessage.MISSING_TITLE,
  },
  status: {
    type: String,
    required: true,
    lowercase: true,
    default: 'todo',
    enum: ['todo', 'in_progress', 'done'],
  },
  context: {
    type: String,
    required: true,
    lowercase: true,
    default: 'none',
    enum: ['none', 'work', 'home'],
  },
  dueDate: Date,
  createdAt: {
    type: Date,
    required: true,
    default: Date.now,
  },
  doneAt: Date,
});

module.exports = database.model('Todo', TodoSchema);
