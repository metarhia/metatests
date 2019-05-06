'use strict';

const assert = require('assert');
const Test = require('../../lib/test.js');

const test = new Test();

let onErrorCalled = false;
test.on('error', (test, error) => {
  assert.strictEqual(error, 'error');
  onErrorCalled = true;
});

test._end('error');
assert(onErrorCalled, 'onError must not be called');

assert.strictEqual(test.done, true);
assert.strictEqual(test.succeeded, false);
