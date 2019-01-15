'use strict';

const assert = require('assert');
const { ImperativeTest } = require('../..');

const test = new ImperativeTest('test');
const subtest = new ImperativeTest('subtest');
subtest.end();
test.end();

let testErrored = false;
test.on('error', (test, message) => {
  testErrored = true;
  assert.strictEqual(test.succeeded, false);
  assert.strictEqual(
    message,
    `Subtest ${subtest.id} / subtest failed with: error`
  );
});

test._subtestErrorCallback(subtest, 'error');
assert(testErrored, 'test must be errored');
