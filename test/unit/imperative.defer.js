'use strict';

const assert = require('node:assert');
const { ImperativeTest } = require('../../metatests.js');

const test = new ImperativeTest();
let afterEachFuncCalled = false;
let deferFuncCalled = false;
let deferFuncDone = false;
test.afterEach((test, cb) => {
  afterEachFuncCalled = true;
  assert(deferFuncDone, 'defer must finish before afterEach');
  cb();
});
assert(test.afterEachFunc, 'must set afterEachFunc');
const state = { a: 42 };
test.test('successful subtest', async (t) => {
  state.a = 24;
  t.defer(async () => {
    deferFuncCalled = true;
    assert(!afterEachFuncCalled, 'defer must be called before afterEach');
    await Promise.resolve().then(() => {
      assert(!afterEachFuncCalled, 'defer must be waited before test end');
      state.a = 42;
      deferFuncDone = true;
    });
  });
  t.pass();
});
test.on('done', () => {
  assert(test.success, 'test must succeed');
  assert(state.a === 42, 'defer must apply');
  assert(deferFuncCalled, 'must call defer function');
  assert(deferFuncDone, 'defer must finish');
  assert(afterEachFuncCalled, 'must call afterEachFunc after test end');
});
