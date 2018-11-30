'use strict';

const { EventEmitter } = require('events');

let nextTestId = 0;

module.exports = class Test extends EventEmitter {
  constructor(caption, options) {
    super();
    this.caption = caption;
    this.results = [];
    this.done = false;
    this.succeeded = undefined;
    this.options = Object.assign({ todo: false }, options);
    this.id = this.options.id || nextTestId++;
    this.todo = this.options.todo;
    this.metadata = {};
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
    this.results.push({
      type,
      success: false,
      stack: error.stack,
      message: error.message,
    });
    this._end();
  }

  end() {
    if (this.done) {
      this.results.push({
        success: false,
        type: 'test',
        message: 'test.end() called after test has finished',
      });
    }
    this._end();
  }

  _end(error) {
    this.done = true;
    if (!this.done && !error) {
      this.succeeded = false;
      if (error) {
        this.results.push({
          type: 'unhandledExeption',
          success: false,
          stack: error.stack,
          message: error.message,
        });
      }
    }
    this.emit('done', this);
  }
};
