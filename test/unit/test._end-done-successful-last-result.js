'use strict';

const assert = require('assert');
const Test = require('../../lib/test.js');

const test = new Test();
test._end();

test.once('error', (test, error) => {
  assert.throws(
    () => {
      throw error;
    },
    {
      name: 'Error',
      message: 'test._end() called after test has finished',
    }
  );
});

test.results.push({ success: true });
test._end();
