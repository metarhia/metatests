'use strict';

const assert = require('assert');
const { ImperativeTest } = require('../..');

let runningTestRan = false;
const runningTest = new ImperativeTest('must run', () => {
  runningTestRan = true;
});

process.nextTick(() => {
  assert(runningTestRan, 'running test must be ran');
  runningTest.end();
});

let notRunningTestRan = false;
const notRunningTest = new ImperativeTest('must not run', () => {
  notRunningTestRan = true;
});

process.nextTick(() => {
  assert(notRunningTestRan, 'not running test must not be ran');
  notRunningTest.end();
});
