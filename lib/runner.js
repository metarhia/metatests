'use strict';

const { EventEmitter } = require('events');
const { ConciseReporter } = require('./report');

class Runner extends EventEmitter {

  constructor(options) {
    super();
    this.options = Object.assign({ runTodo: false }, options);
    this.reporter = new ConciseReporter();
    this.hasFailures = false;
    this.testsCount = 0;
    this._testDoneCallback = (test) => {
      if (!test.success) this.hasFailures = true;
      this.reporter.record(test);
      if (--this.testsCount === 0) {
        process.nextTick(() => {
          if (this.testsCount === 0) this.finish();
        });
      }
    };
    this._testErrorCallback = (test, failMessage) => {
      this.hasFailures = true;
      this.reporter.error(test, failMessage);
    };
  }

  addTest(test) {
    test.on('error', this._testErrorCallback);
    if (test.done) {
      this.reporter.error(test, new Error('Added finished test'));
    } else {
      this.testsCount++;
      test.on('done', this._testDoneCallback);
    }
  }

  finish() {
    this.reporter.finish();
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
