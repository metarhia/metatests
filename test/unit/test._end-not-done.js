'use strict';

const assert = require('node:assert');
const Test = require('../../lib/test.js');

const test = new Test();

let onDoneCalled = false;
test.on('done', () => {
  onDoneCalled = true;
});

test._end();
assert(onDoneCalled, 'onDone must be called');
