'use strict';

const assert = require('assert');
const { ImperativeTest } = require('../..');

const test = new ImperativeTest();

const error = new Error('error message');
try {
  test.bailout(error);
} catch {
  const [result] = test.results;
  assert.strictEqual(result.message, 'Error: error message');
}

test.end();
