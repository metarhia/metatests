'use strict';

const assert = require('assert');
const { ImperativeTest } = require('../..');

const test = new ImperativeTest();
let onDoneCalled = false;
let onEventCalled = false;

test.end();

test.on('done', () => {
  onDoneCalled = true;
});

test.on('event', () => {
  onEventCalled = true;
});

assert(onDoneCalled, 'onDone must be called');
assert(!onEventCalled, 'onEvent must not be called');
