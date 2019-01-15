'use strict';

const assert = require('assert');
const Test = require('../../lib/test.js');

const test = new Test();

let onDoneCalled = false;
test.on('done', () => {
  onDoneCalled = true;
});

test._end();
assert(onDoneCalled, 'onDone must be called');
