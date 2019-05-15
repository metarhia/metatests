'use strict';

const assert = require('assert');
const { ImperativeTest } = require('../..');

const test = new ImperativeTest('test', null, { parallelSubtests: true });
test.testSync('subtest', t => t.pass());
test.end();

const result = test.results[0];
delete result.stack;
assert.deepStrictEqual(result, {
  success: false,
  type: 'test',
  message: 'End called before subtests finished',
});

const queuedTest = new ImperativeTest();
queuedTest.afterEach((t, cb) => process.nextTick(cb));
const subtest = queuedTest.testSync('subtest', t => t.pass());
subtest.on('done', () => {
  queuedTest.end();
  const result = queuedTest.results.pop();
  delete result.stack;
  assert.deepStrictEqual(result, {
    success: false,
    type: 'test',
    message: 'End called before subtests finished',
  });
});
queuedTest.on('error', (test, e) => {
  throw e;
});
