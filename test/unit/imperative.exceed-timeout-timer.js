'use strict';

const assert = require('assert');
const { ImperativeTest } = require('../../metatests');

const test = new ImperativeTest('', null, { timeout: 1 });
setTimeout(() => {
  assert.deepStrictEqual(test.results, [
    {
      type: 'timeout',
      message: 'Test execution time exceed timeout (1)',
      success: false,
      stack: null,
    },
  ]);
}, 1000);
