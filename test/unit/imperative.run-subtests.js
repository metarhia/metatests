'use strict';

const assert = require('assert');
const { ImperativeTest } = require('../../metatests');

const test = new ImperativeTest('', null);
const st1 = test.testSync('successful subtest', t => t.pass());
const st2 = test.testSync('failing subtest', t => t.fail());
test.on('done', () => {
  const subtest1res = {
    type: 'subtest',
    test: st1,
    message: 'successful subtest',
  };
  Object.defineProperty(subtest1res, 'success', {
    get: () => st1.success,
  });
  const subtest2res = {
    type: 'subtest',
    test: st2,
    message: 'failing subtest',
  };
  Object.defineProperty(subtest2res, 'success', {
    get: () => st2.success,
  });
  assert.deepStrictEqual(test.results, [subtest1res, subtest2res]);
});

const error = new Error('hello');
const erroringTest = new ImperativeTest('erroring test', null);
const st3 = erroringTest.testSync('throwing test', () => {
  throw error;
});
st3.once('error', (test, err) => {
  assert.deepStrictEqual(err, error);
});
st3.end();
st3.run(); // forcefully run test to get 'error'
erroringTest.on('done', () => {
  const res1 = {
    type: 'subtest',
    test: st3,
    message: 'throwing test',
  };
  Object.defineProperty(res1, 'success', {
    get: () => st3.success,
  });
  assert.deepStrictEqual(erroringTest.results, [
    res1,
    {
      test: st3,
      message: `Error in subtest '${st3.caption}': ${error}`,
      stack: error.stack,
      type: 'subtest',
      success: false,
    },
  ]);
});
