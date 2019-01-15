'use strict';

const assert = require('assert');
const { ImperativeTest } = require('../..');

const testWithParallelSubtests = new ImperativeTest(
  'test with parallel subtests',
  null,
  { parallelSubtests: true }
);
let beforeEachCalled = 0;
testWithParallelSubtests.beforeEach((context, cb) => {
  ++beforeEachCalled;
  cb();
});

testWithParallelSubtests.test('subtest #1', t => {
  t.pass();
  t.end();
});
testWithParallelSubtests.test('subtest #2', t => {
  t.pass();
  t.end();
});

assert.strictEqual(beforeEachCalled, 2, 'must call beforeEach 2 times');
