'use strict';

const assert = require('node:assert');
const { ImperativeTest } = require('../../metatests.js');

const test = new ImperativeTest();
let afterEachFuncCalled = false;
test.afterEach((test, cb) => {
  afterEachFuncCalled = true;
  cb();
});
assert(test.afterEachFunc, 'must set afterEachFunc');
test.testSync('successful subtest', (t) => t.pass());
test.on('done', () =>
  assert(afterEachFuncCalled, 'must call afterEachFunc after test end'),
);
