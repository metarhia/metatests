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
  const [result] = test.results;
  assert(beforeDoneEmitted, "test must emit 'beforeDone'");
  assert(!afterEachCalled, 'afterEach must not be called');
  assert.deepStrictEqual(result, {
    type: 'subtest',
    test: subtest,
    message: 'subtest',
    success: true,
  });
});
