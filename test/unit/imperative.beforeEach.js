'use strict';

const assert = require('assert');
const { ImperativeTest } = require('../../metatests');

const test = new ImperativeTest();
let beforeEachFuncCalled = false;
test.beforeEach((test, cb) => {
  beforeEachFuncCalled = true;
  cb({ field: 'value' });
});
const st = test.testSync('successful subtest', t => t.pass());
assert(test.beforeEachFunc, 'must set beforeEachFunc');
test.on('done', () => {
  assert.deepStrictEqual(st.context, { field: 'value' });
  assert(beforeEachFuncCalled, 'must call beforeEachFunc before test run');
});
