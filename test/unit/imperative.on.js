'use strict';

const assert = require('assert');
const { ImperativeTest } = require('../..');

const test = new ImperativeTest();
let onDoneCalled = false;

test.on('done', () => {
  onDoneCalled = true;
});

assert(!onDoneCalled, 'must not call on done');

test.end();

assert(onDoneCalled, 'onDone must be called');
