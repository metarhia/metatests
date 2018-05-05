'use strict';

const not = fn => (...args) => !fn(...args);

function Test(caption) {
  this.caption = caption;
}

Test.prototype.same = function(actual, expected, message) {
  if (actual != expected) { // eslint-disable-line eqeqeq
    console.dir({ actual, expected, message });
  }
};

Test.prototype.equal = Test.prototype.same;

Test.prototype.notEqual = not(Test.prototype.same);

Test.prototype.strictSame = (actual, expected, message) => {
  if (actual !== expected) {
    console.dir({ actual, expected, message });
  }
};

Test.prototype.assert = (value, message) => {
  if (!value) {
    console.dir({ assert: value, message });
  }
};

Test.prototype.ok = Test.prototype.assert;

Test.prototype.assertNot = not(Test.prototype.assert);

Test.prototype.end = function() {
  if (this.planned) {
    if (this.passed.length !== this.planned) {
      console.dir({
        planned: this.planned,
        passed: this.passed.length,
        messages: this.passed
      });
      return;
    }
  }
  console.log(this.caption + ' ok');
};

Test.prototype.throws = function(err) {
  throw err;
};

Test.prototype.plan = function(n) {
  this.planned = n;
  this.passed = [];
};

Test.prototype.pass = function(message) {
  this.passed.push(message);
};

module.exports = (caption, execute) => {
  const test = new Test(caption);
  execute(test);
  return test;
};
