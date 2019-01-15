'use strict';

const assert = require('assert');
const { ImperativeTest } = require('../..');

const test = new ImperativeTest();
test.plan(2);

const { stack } = new Error();

test.results.push({
  type: 'pass',
  success: true,
  message: 'pass',
  stack,
});

test._passCheck();
assert.strictEqual(test.results.length, 1);

test.end();
