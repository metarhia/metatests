'use strict';

const assert = require('assert');
const { ImperativeTest } = require('../..');

const test = new ImperativeTest('test');
const subtest = new ImperativeTest('subtest');
subtest.end();
test.end();

const error = new Error('error');
let testErrored = false;
test.on('error', (test, actualError) => {
  testErrored = true;
  assert.strictEqual(test.succeeded, false);
  assert.strictEqual(actualError, error);
});

test._subtestErrorCallback(subtest, error);
assert(testErrored, 'test must be errored');
