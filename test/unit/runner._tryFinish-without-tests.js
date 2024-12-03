'use strict';

const assert = require('node:assert');
const {
  runner: { Runner },
} = require('../..');

const runner = new Runner();
runner.removeReporter();
runner._tryFinish();
setTimeout(() => {
  assert.strictEqual(runner.finished, true);
}, 1000);
