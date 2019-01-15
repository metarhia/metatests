'use strict';

const assert = require('assert');
const {
  runner: { Runner },
} = require('../..');

const runner = new Runner();
runner.removeReporter();
runner.wait();
runner.resume();
assert.strictEqual(runner.waiting, 0);
