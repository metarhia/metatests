'use strict';

const assert = require('assert');
const {
  runner: { Runner },
  ImperativeTest,
} = require('../..');

const runner = new Runner();
runner.removeReporter();
let testErrorCallbackCalled = false;
runner._testErrorCallback = () => {
  testErrorCallbackCalled = true;
};

const st = new ImperativeTest();
runner.addTest(st);
st.emit('error');
st.end();

assert(testErrorCallbackCalled, 'must call _testErrorCallback');
