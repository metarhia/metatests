'use strict';

const assert = require('assert');
const {
  runner: { Runner },
  ImperativeTest,
} = require('../..');

const runner = new Runner();

const st1 = new ImperativeTest('successful subtest');
st1.end();

const st2 = new ImperativeTest('failing subtest');
st2.fail('no problem');
st2.end();

const st3 = new ImperativeTest('subtest ran without reporter');
st3.end();

const st4 = new ImperativeTest('failing subtest with todo', null, {
  todo: true,
});
st4.fail();
st4.end();

runner.testsCount = 4;
// Remove unnecessary subtest output
runner.reporter.parseTestResults = () => {};

const checkFinished = () => assert.strictEqual(runner.finished, true);

runner.on('finish', checkFinished);
setTimeout(checkFinished, 1000);

runner._testDoneCallback(st1);
assert.strictEqual(runner.reporter.successful, 1);
assert.strictEqual(runner.hasFailures, false);
assert.strictEqual(runner.finished, false);
assert.strictEqual(runner.testsCount, 3);

runner._testDoneCallback(st2);
assert.strictEqual(runner.reporter.failed, 1);
assert.strictEqual(runner.hasFailures, true);

runner.removeReporter();
runner._testDoneCallback(st3);

runner.hasFailures = false;
runner._testDoneCallback(st4);
assert.strictEqual(runner.hasFailures, false);
