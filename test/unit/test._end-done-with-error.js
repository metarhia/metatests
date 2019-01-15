'use strict';

const assert = require('assert');
const Test = require('../../lib/test.js');

const test = new Test();
test._end();

test.on('error', (test, error) => {
  assert.strictEqual(error, 'error');
});

test.results.push({ success: false, message: 'not expected error' });
test._end('error');
