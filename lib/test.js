'use strict';

module.exports = (metatests) => {

  function Test(caption, execute) {
    this.success = true;
    this.caption = caption;
    this.subtests = 0;
    this.execute = execute;
    this.events = { done: null };
  }

  Test.prototype.same = function(actual, expected, message) {
    this.subtests++;
    if (!metatests.equal(actual, expected)) {
      this.success = false;
      metatests.fail({
        caption: this.caption,
        type: 'equal',
        subtests: this.subtests,
        expected, actual, message,
        stack: new Error().stack
      });
    }
  };

  Test.prototype.equal = Test.prototype.same;

  Test.prototype.notEqual = function(actual, expected, message) {
    this.subtests++;
    if (metatests.equal(actual, expected)) {
      this.success = false;
      metatests.fail({
        caption: this.caption,
        type: 'notEqual',
        subtests: this.subtests,
        expected, actual, message,
        stack: new Error().stack
      });
    }
  };

  Test.prototype.strictSame = function(actual, expected, message) {
    this.subtests++;
    if (!metatests.strictEqual(actual, expected)) {
      this.success = false;
      metatests.fail({
        caption: this.caption,
        type: 'strictSame',
        subtests: this.subtests,
        expected, actual, message,
        stack: new Error().stack
      });
    }
  };

  Test.prototype.assert = function(value, message) {
    this.subtests++;
    if (!value) {
      this.success = false;
      metatests.fail({
        caption: this.caption,
        type: 'assert',
        subtests: this.subtests,
        expected: true, actual: !!value, message,
        stack: new Error().stack
      });
    }
  };

  Test.prototype.ok = Test.prototype.assert;

  Test.prototype.assertNot = function(value, message) {
    this.subtests++;
    if (value) {
      this.success = false;
      metatests.fail({
        caption: this.caption,
        type: 'assertNot',
        subtests: this.subtests,
        expected: false, actual: !!value, message,
        stack: new Error().stack
      });
    }
  };

  Test.prototype.notOk = function(message) {
    this.success = false;
    metatests.fail({
      caption: this.caption,
      type: 'notOk', message,
      subtests: this.subtests,
      stack: new Error().stack
    });
  };

  Test.prototype.error = function(err, message) {
    if (err instanceof Error) {
      this.success = false;
      metatests.fail({
        caption: this.caption,
        type: 'error', message,
        subtests: this.subtests,
        stack: err.stack
      });
    }
  };

  Test.prototype.type = function(obj, type, message) {
    const domain = typeof(obj);
    if (domain === type) return;
    const category = obj.constructor && obj.constructor.name;
    if (category === type) return;
    this.success = false;
    metatests.fail({
      caption: this.caption,
      type: 'type', message,
      subtests: this.subtests,
      expected: type,
      actual: category || domain,
      stack: new Error().stack
    });
  };

  Test.prototype.end = function(message) {
    if (this.planned) {
      if (this.passed.length !== this.planned) {
        this.success = false;
        metatests.fail({
          caption: this.caption,
          type: 'plan/pass',
          subtests: this.subtests,
          expected: this.planned,
          actual: this.passed.length,
          passed: this.passed.join('\n  '),
          message,
          stack: new Error().stack
        });
      }
    }
    this.done = true;
    if (this.events.done) this.events.done();
    this.events.done = null;
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
      metatests.fail({
        caption: this.caption,
        type: 'throws',
        subtests: this.subtests,
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
      metatests.fail({
        caption: this.caption,
        type: 'doesNotThrow',
        subtests: this.subtests,
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
    this.subtests++;
    this.passed.push(message);
    if (this.passed.length === this.planned) this.end();
  };

  Test.prototype.on = function(name, listener) {
    if (this.done) {
      listener();
      return;
    }
    if (name === 'done') this.events.done = listener;
  };

  metatests.tests = [];
  metatests.current = null;

  metatests.test = (caption, execute) => {
    const test = new Test(caption, execute);
    metatests.tests.push(test);
  };

  const next = () => {
    const test = metatests.tests.shift();
    if (!test) {
      const done = metatests.done;
      if (done) done();
      return;
    }
    metatests.current = test;

    test.on('done', () => {
      if (!test.success) metatests.results.errors++;
      metatests.results.targets++;
      metatests.results.tests += test.subtests;
      next();
    });
    test.execute(test);
  };

  metatests.run = (callback) => {
    metatests.done = callback;
    next();
  };

};
