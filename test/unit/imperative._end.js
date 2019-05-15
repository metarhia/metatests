'use strict';

const assert = require('assert');
const { ImperativeTest } = require('../..');

const test = new ImperativeTest();
let beforeDoneEmitted = false;
let afterEachCalled = false;

test.afterEach(() => {
  afterEachCalled = true;
});
test.on('beforeDone', () => {
  beforeDoneEmitted = true;
});

const subtest = test.testSync('subtest', t => t.pass());
test._end();

test.on('done', () => {
  assert(beforeDoneEmitted, "test must emit 'beforeDone'");
  assert(!afterEachCalled, 'afterEach must not be called');
  const expectedResults = {
    type: 'subtest',
    test: subtest,
    message: 'subtest',
  };
  Object.defineProperty(expectedResults, 'success', {
    get: () => subtest.success,
  });
  delete test.results[0].stack;
  assert.deepStrictEqual(test.results[0], expectedResults);
});
