'use strict';

const assert = require('assert');
const {
  runner: { Runner },
} = require('../..');

const runner = new Runner();
assert.strictEqual(runner.options.runTodo, false);
assert.strictEqual(runner.hasFailures, false);
assert.strictEqual(runner.finished, false);
