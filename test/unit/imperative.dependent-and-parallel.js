'use strict';

const assert = require('assert');
const { ImperativeTest } = require('../../metatests');

// A stub to support assert.throws in Node v6
const checkError = expected => actual => {
  try {
    assert(actual instanceof expected.constructor);
    assert.strictEqual(actual.message, expected.message);
    return true;
  } catch (e) {
    return false;
  }
};

assert.throws(
  () =>
    new ImperativeTest('', null, {
      parallelSubtests: true,
      dependentSubtests: true,
    }),
  checkError(
    new Error('parallelSubtests and dependentSubtests are contradictory')
  )
);

assert.doesNotThrow(() => {
  const test = new ImperativeTest('', null, { parallelSubtests: true });
  test.end();
}, checkError(new Error('parallelSubtests and dependentSubtests are contradictory')));
