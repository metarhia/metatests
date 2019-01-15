'use strict';

const assert = require('assert');
const { ImperativeTest } = require('../..');

const test = new ImperativeTest();

try {
  test.bailout();
  assert(false, 'must throw an error');
} catch (e) {
  const [result] = test.results;
  assert.strictEqual(result.type, 'bailout');
  assert.strictEqual(result.success, false);
  assert.strictEqual(result.message, undefined);
}

test.end();
