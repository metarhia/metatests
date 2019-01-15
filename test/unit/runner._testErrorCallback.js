'use strict';

const assert = require('assert');
const {
  runner: { Runner },
  ImperativeTest,
} = require('../..');

const runner = new Runner();

const st1 = new ImperativeTest('erroring subtest');
st1.end();

const st2 = new ImperativeTest('todo erroring subtest', null, { todo: true });
st2.end();

let reporterErrorCalled = false;
// Replace repoter error method to check it was called correctly
runner.reporter.error = (test, errorMessage) => {
  reporterErrorCalled = true;
  assert.strictEqual(test, st1);
  assert.strictEqual(errorMessage, 'error message');
};
runner._testErrorCallback(st1, 'error message');
assert(reporterErrorCalled, 'must call reporter.error');
assert.strictEqual(runner.hasFailures, true);

runner.hasFailures = false;
runner.removeReporter();
runner._testErrorCallback(st2);
assert.strictEqual(runner.hasFailures, false);
