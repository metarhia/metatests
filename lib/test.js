'use strict';

const { equal, strictEqual } = require('./compare');

function Test(caption) {
  this.success = true;
  this.caption = caption;
  this.counter = 0;
}

const renderStack = stack => {
  const lines = stack.split('\n');
  lines.splice(1, 1);
  const result = lines.map(
    (line, i) => ' '.repeat(i ? 12 : 0) + line.trim().replace(/at /g, '')
  );
  return result.join('\n');
};

Test.prototype.show = function(fail) {
  let message = 'Test failed: ' + this.caption;
  message += '\n   Subtests: ' + this.counter + ' passed';
  message += '\n       Type: ' + fail.type;
  message += '\n     Actual: ' + fail.actual;
  message += '\n   Expected: ' + fail.expected;
  if (fail.message) message += '\n    Message: ' + fail.message;
  if (fail.stack)   message += '\n      Stack: ' + renderStack(fail.stack);
  console.log(message + '\n');
};

Test.prototype.same = function(actual, expected, message) {
  this.counter++;
  if (!equal(actual, expected)) {
    this.success = false;
    this.show({
      type: 'equal',
      actual, expected, message,
      stack: new Error().stack
    });
  }
};

Test.prototype.equal = Test.prototype.same;

Test.prototype.notEqual = function(actual, expected, message) {
  this.counter++;
  if (equal(actual, expected)) {
    this.success = false;
    this.show({
      type: 'notEqual',
      actual, expected, message,
      stack: new Error().stack
    });
  }
};

Test.prototype.strictSame = function(actual, expected, message) {
  this.counter++;
  if (!strictEqual(actual, expected)) {
    this.success = false;
    this.show({
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

Test.prototype.throws = function(err) {
  throw err;
};

Test.prototype.plan = function(n) {
  this.planned = n;
  this.passed = [];
};

Test.prototype.pass = function(message) {
  this.counter++;
  this.passed.push(message);
};

module.exports = (caption, execute) => {
  const test = new Test(caption);
  execute(test);
  return test;
};
