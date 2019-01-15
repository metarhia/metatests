'use strict';

const assert = require('assert');
const {
  runner: { Runner },
} = require('../..');

const runner = new Runner();
runner.runTodo();
assert.strictEqual(runner.options.runTodo, true);
runner.runTodo(false);
assert.strictEqual(runner.options.runTodo, false);
