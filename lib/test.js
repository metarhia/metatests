'use strict';

const { EventEmitter } = require('events');
const { callerFilepath } = require('@metarhia/common');

const { format, packageRegex } = require('./utils');

let nextTestId = 0;

module.exports = class Test extends EventEmitter {
  constructor(caption, options) {
    super();
    this.caption = caption || '';
    this.results = [];
    this.done = false;
    this.succeeded = undefined;
    this.options = { todo: false, runner: null, ...options };
    this.id = this.options.id || nextTestId++;
    this.todo = this.options.todo;
    this.output = '';
    this.context = this.options.context || {};

    let filepath = null;
    let depth = 1;
    do {
      filepath = callerFilepath(depth++);
    } while (filepath && filepath.match(packageRegex));
    this.metadata = { filepath };
  }

  log(...args) {
    this.output += format(...args) + '\n';
  }

  get success() {
    if (this.done && this.succeeded !== undefined) return this.succeeded;
    const failed =
      !this.todo &&
      this.results.some(r => (!r.test || !r.test.todo) && !r.success);
    if (this.done) this.succeeded = !failed;
    return !failed;
  }

  erroer(type, error) {
    this.succeeded = false;
    this.results.push({
      type,
      success: false,
      stack: error && error.stack,
      message: error && error.message,
    });
    if (!this.done) this._end();
    else this.emit('error', this, error);
  }

  end() {
    if (this.done) {
      this.succeeded = false;
      this.results.push({
        success: false,
        type: 'test',
        message: 'test.end() called after test has finished',
      });
    }
    this._end();
  }

  _end(error) {
    if (!this.done && !error) {
      this.done = true;
      this.emit('done', this);
    } else {
      this.done = true;
      this.succeeded = false;
      if (!error) {
        const lastResult = this.results[this.results.length - 1];
        if (lastResult && !lastResult.success) {
          error = new Error(lastResult.message);
        } else {
          error = new Error('test._end() called after test has finished');
        }
      }
      this.emit('error', this, error);
    }
  }
};
