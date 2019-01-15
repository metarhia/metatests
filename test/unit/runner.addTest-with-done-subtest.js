'use strict';

const assert = require('assert');
const {
  runner: { Runner },
  DeclarativeTest,
} = require('../..');

const runner = new Runner();
runner.removeReporter();
let testDoneCallbackCalled = false;
runner._testDoneCallback = () => {
  testDoneCallbackCalled = true;
};

const st = new DeclarativeTest();
st.end();

runner.addTest(st);
assert.strictEqual(runner.testsCount, 1);
assert(testDoneCallbackCalled, 'must call _testDoneCallback');
