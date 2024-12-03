'use strict';

const assert = require('node:assert');
const { ImperativeTest } = require('../..');

const test = new ImperativeTest();

try {
  test.bailout('error message');
} catch {
  const [result] = test.results;
  assert.strictEqual(result.message, 'error message');
}

test.end();
