'use strict';

const assert = require('assert');
const { ImperativeTest } = require('../..');

const test = new ImperativeTest();
test.plan(1);

const { stack } = new Error();

test.results.push({
  type: 'pass',
  success: true,
  message: 'pass',
  stack,
});

test._passCheck();

assert.strictEqual(test.planned, undefined);

let called = false;
test.on('done', () => {
  called = true;
  assert.deepStrictEqual(test.results.pop(), {
    success: true,
    type: 'test',
    expected: 1,
    actual: 1,
    message: "Expected to pass 'plan' (1) number of asserts",
    stack: null,
  });
});

process.on('exit', () => {
  assert(called, 'must call on done');
});
