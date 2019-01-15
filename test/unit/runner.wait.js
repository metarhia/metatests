'use strict';

const assert = require('assert');
const {
  runner: { Runner },
} = require('../..');

const runner = new Runner();
runner.wait();
assert.strictEqual(runner.waiting, 1);
