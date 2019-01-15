'use strict';

const assert = require('assert');
const Test = require('../../lib/test.js');

const test = new Test();
assert.strictEqual(test.success, true);
assert.strictEqual(test.succeeded, undefined);

const checkSuccess = (result, expectedSuccessValue) => {
  test.results.push(result);
  assert.strictEqual(test.success, expectedSuccessValue);
  test.results = [];
};

checkSuccess({ success: true }, true);
checkSuccess({ success: false }, false);

checkSuccess({ test: { todo: true }, success: false }, true);
checkSuccess({ test: { todo: false }, success: false }, false);

test.end();
assert.strictEqual(test.success, true);
assert.strictEqual(test.succeeded, true);

test.succeeded = false;
assert.strictEqual(test.success, false);
