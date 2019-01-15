'use strict';

const assert = require('assert');
const imperative = require('../../lib/imperative-test');
const {
  runner: { Runner },
} = require('../..');

const runnerInstance = new Runner();
runnerInstance.removeReporter();

const asyncTest = imperative.testAsync('async', null, {}, runnerInstance);
assert.strictEqual(asyncTest.options.async, true);
asyncTest.end();

const syncTest = imperative.testSync('sync', null, {}, runnerInstance);
assert.strictEqual(syncTest.options.async, false);
syncTest.end();

runnerInstance.runTodo(false);
const todoTest = imperative.test(
  'todo test',
  null,
  { todo: true },
  runnerInstance
);
assert.strictEqual(todoTest, null);

const notTodoTest = imperative.test('not todo test', null, {}, runnerInstance);
assert(notTodoTest, 'must not be null');
notTodoTest.end();
