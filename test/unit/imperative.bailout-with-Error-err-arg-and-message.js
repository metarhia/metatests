'use strict';

const assert = require('node:assert');
const { ImperativeTest } = require('../..');

const test = new ImperativeTest();

const error = new Error('error message');
try {
  test.bailout(error, 'just message');
} catch {
  const [result] = test.results;
  assert.strictEqual(result.message, 'just message\nError: error message');
  assert.strictEqual(result.stack, error.stack);
}

test.end();
