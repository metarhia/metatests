'use strict';

const assert = require('assert');
const { ImperativeTest } = require('../..');

const bailoutingTest = new ImperativeTest(
  'throwing bailout error',
  t => {
    t.bailout();
  },
  { run: false }
);

bailoutingTest.on('done', () => {
  assert.strictEqual(bailoutingTest.results.pop().type, 'bailout');
});

const erroringTest = new ImperativeTest(
  'throwing unhandled exception',
  () => {
    throw new Error();
  },
  { run: false }
);

erroringTest.on('done', () => {
  assert.strictEqual(erroringTest.results.pop().type, 'unhandledException');
});

process.nextTick(() => bailoutingTest.run());
process.nextTick(() => erroringTest.run());
