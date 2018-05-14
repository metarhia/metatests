'use strict';

module.exports = (metatests) => {

  function Test(caption) {
    this.success = true;
    this.caption = caption;
    this.counter = 0;
  }

  Test.prototype.same = function(actual, expected, message) {
    this.counter++;
    if (!metatests.equal(actual, expected)) {
      this.success = false;
      this.show({
        caption: this.caption,
        counter: this.counter,
        type: 'equal',
        actual, expected, message,
        stack: new Error().stack
      });
    }
  };

  Test.prototype.equal = Test.prototype.same;

  Test.prototype.notEqual = function(actual, expected, message) {
    this.counter++;
    if (metatests.equal(actual, expected)) {
      this.success = false;
      this.show({
        caption: this.caption,
        counter: this.counter,
        type: 'notEqual',
        actual, expected, message,
        stack: new Error().stack
      });
    }
  };

  Test.prototype.strictSame = function(actual, expected, message) {
    this.counter++;
    if (!metatests.strictEqual(actual, expected)) {
      this.success = false;
      this.show({
        caption: this.caption,
        counter: this.counter,
        type: 'strictSame',
        actual, expected, message,
        stack: new Error().stack
      });
    }
  };

  Test.prototype.assert = function(value, message) {
    this.counter++;
    if (!value) {
      this.success = false;
      this.show({
        caption: this.caption,
        counter: this.counter,
        type: 'assert',
        actual: !!value, expected: true, message,
        stack: new Error().stack
      });
    }
  };

  Test.prototype.ok = Test.prototype.assert;

  Test.prototype.assertNot = function(value, message) {
    this.counter++;
    if (value) {
      this.success = false;
      this.show({
        caption: this.caption,
        counter: this.counter,
        type: 'assertNot',
        actual: !!value, expected: false, message,
        stack: new Error().stack
      });
    }
  };

  Test.prototype.end = function() {
    if (this.planned) {
      if (this.passed.length !== this.planned) {
        this.success = false;
        console.log('Passed steps: \n  ' + this.passed.join('\n  '));
        console.dir({
          planned: this.planned,
          passed: this.passed.length
        });
        return;
      }
    }
  };

  Test.prototype.throws = function(fn, err, message) {
    let errored = false;
    let msg = '';
    try {
      fn();
    } catch (e) {
      msg = e.message;
      errored = err.message === msg;
    }
    if (!errored) {
      this.success = false;
      this.show({
        caption: this.caption,
        counter: this.counter,
        type: 'throws',
        actual: msg, expected: err.message, message,
        stack: new Error().stack
      });
    }
  };

  Test.prototype.doesNotThrow = function(fn, message) {
    try {
      fn();
    } catch (e) {
      this.success = false;
      this.show({
        caption: this.caption,
        counter: this.counter,
        type: 'doesNotThrow',
        actual: e.message, expected: undefined, message,
        stack: new Error().stack
      });
    }
  };

  Test.prototype.plan = function(n) {
    this.planned = n;
    this.passed = [];
  };

  Test.prototype.pass = function(message) {
    this.counter++;
    this.passed.push(message);
  };

  metatests.test = (caption, execute) => {
    const test = new Test(caption);
    execute(test);
    metatests.results.tests += test.counter;
  };

};
