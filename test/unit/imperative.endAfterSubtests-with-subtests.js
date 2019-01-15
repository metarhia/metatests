'use strict';

const assert = require('assert');
const { ImperativeTest } = require('../../metatests');

const test = new ImperativeTest();
let ended = false;

test.endAfterSubtests();
test.testSync('subtest', t => t.pass());
test.on('done', () => {
  ended = true;
});

process.nextTick(() => {
  assert(!ended, 'must not end');
});
