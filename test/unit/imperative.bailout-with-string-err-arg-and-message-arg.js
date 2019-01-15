'use strict';

const assert = require('assert');
const { ImperativeTest } = require('../..');

const test = new ImperativeTest();

try {
  test.bailout('error message', 'just message');
} catch (e) {
  const [result] = test.results;
  assert.strictEqual(result.message, 'error message');
}

test.end();
