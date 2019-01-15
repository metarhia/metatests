'use strict';

const assert = require('assert');
const Test = require('../../lib/test.js');
const { emptiness } = require('@metarhia/common');

const test = new Test();
test.on('error', emptiness);

test.end();
assert.strictEqual(test.results.pop(), undefined);

test.end();
assert.deepStrictEqual(test.results.pop(), {
  success: false,
  type: 'test',
  message: 'test.end() called after test has finished',
});
