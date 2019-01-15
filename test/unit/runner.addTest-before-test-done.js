'use strict';

const assert = require('assert');
const {
  runner: { Runner },
  ImperativeTest,
} = require('../..');

const runner = new Runner();
runner.removeReporter();
let testDoneCallbackCalled = false;
runner._testDoneCallback = () => {
  testDoneCallbackCalled = true;
};

const st = new ImperativeTest();
runner.addTest(st);
st.end();

assert(testDoneCallbackCalled, 'must call _testDoneCallback');
