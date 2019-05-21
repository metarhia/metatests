'use strict';

const { EventEmitter } = require('events');
const { TapReporter } = require('./report');

class Runner extends EventEmitter {
  constructor(options) {
    super();
    this.options = { runTodo: false, ...options };
    this.reporter = new TapReporter();
    this.finished = false;
    this.hasFailures = false;
    this.testsCount = 0;
    this.waiting = 0;
    this._testDoneCallback = test => {
      if (!test.todo && !test.success) this.hasFailures = true;
      if (this.reporter) this.reporter.record(test);
      this.testsCount--;
      this._tryFinish();
    };
    this._testErrorCallback = (test, failMessage) => {
      if (!test.todo) this.hasFailures = true;
      if (this.reporter) this.reporter.error(test, failMessage);
    };
  }

  // #private
  _tryFinish() {
    if (this.testsCount !== 0) return;
    process.nextTick(() => {
      if (this.finished) return;
      if (this.waiting === 0 && this.testsCount === 0) this.finish();
    });
  }

  wait() {
    this.waiting++;
  }

  resume() {
    if (this.waiting > 0) this.waiting--;
    this._tryFinish();
  }

  setReporter(reporter) {
    this.reporter = reporter;
  }

  addTest(test) {
    this.testsCount++;
    test.on('error', this._testErrorCallback);
    if (test.done) this._testDoneCallback(test);
    else test.on('done', this._testDoneCallback);
  }

  removeReporter() {
    this.reporter = null;
  }

  runTodo(active = true) {
    this.options.runTodo = active;
  }

  finish() {
    this.finished = true;
    if (this.reporter) this.reporter.finish();
    // TODO(lundibundi): 'finish' event should only be emitted after all of the
    // tests have finished (including test 'error' event).
    // Now we can have more events after this 'finish' event due to limitations
    // of imperative/declarative test implementaion (no proper test boxing).
    if (!this.emit('finish', this.hasFailures)) {
      if (this.hasFailures) process.exit(1);
    }
  }
}

module.exports = {
  Runner,
  instance: new Runner(),
};
