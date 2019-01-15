'use strict';

const assert = require('assert');
const Test = require('../../lib/test.js');

const test = new Test();
test._end();

test.on('error', (test, error) => {
  assert.strictEqual(error, undefined);
});

test.results.push({ success: true });
test._end();
