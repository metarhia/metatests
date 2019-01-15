'use strict';

const assert = require('assert');
const Test = require('../../lib/test.js');

const test = new Test();
test._end();

test.on('error', (test, error) => {
  assert.strictEqual(error.message, 'error message');
});

test.results.push({ success: false, message: 'error message' });
test._end();
