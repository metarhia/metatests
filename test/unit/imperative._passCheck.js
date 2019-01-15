'use strict';

const assert = require('assert');
const { ImperativeTest } = require('../..');

const test = new ImperativeTest();
test.plan(1);

const { stack } = new Error();

test.results.push({
  type: 'pass',
  success: true,
  message: 'pass 1',
  stack,
});

test.results.push({
  type: 'pass',
  success: true,
  message: 'pass 2',
  stack,
});

test._passCheck();

assert.strictEqual(test.planned, undefined);
assert.deepStrictEqual(test.results.pop(), {
  success: false,
  type: 'test',
  expected: 1,
  actual: 2,
  message: "Expected to pass 'plan' (1) number of asserts",
});
