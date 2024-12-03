'use strict';

const assert = require('node:assert');
const { ImperativeTest } = require('../../metatests.js');

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
