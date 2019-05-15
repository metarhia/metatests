'use strict';

const assert = require('assert');
const { ImperativeTest } = require('../../metatests');

const test = new ImperativeTest();
test.waitingSubtests = false;
test.plan(1);
test.endAfterSubtests();
assert.strictEqual(test.waitingSubtests, true);

process.nextTick(() => {
  const result = test.results[0];
  delete result.stack;
  assert.deepStrictEqual(result, {
    success: false,
    type: 'test',
    message: "End called in a 'plan' test",
  });
});
