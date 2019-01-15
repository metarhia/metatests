'use strict';

const assert = require('assert');
const { ImperativeTest } = require('../../metatests');

const test = new ImperativeTest();
let afterEachFuncCalled = false;
test.afterEach((test, cb) => {
  afterEachFuncCalled = true;
  cb();
});
assert(test.afterEachFunc, 'must set afterEachFunc');
test.testSync('successful subtest', t => t.pass());
test.on('done', () =>
  assert(afterEachFuncCalled, 'must call afterEachFunc after test end')
);
