'use strict';

const assert = require('assert');
const { ImperativeTest } = require('../..');

const syncTest = new ImperativeTest('run sync', t => t.pass(), {
  async: false,
  run: false,
});

let onDoneCalled = false;
syncTest.on('done', () => {
  onDoneCalled = true;
});
syncTest.on('error', (test, e) => {
  throw e;
});

syncTest.run();

process.nextTick(() => {
  assert.strictEqual(syncTest.waitingSubtests, true);
  syncTest.test('subtest', t => t.pass());
  process.nextTick(() => {
    assert(!onDoneCalled, 'must not call onDone');
    syncTest.end(); // this will also end the above subtest
  });
});

const asyncTest = new ImperativeTest('run async', t => t.pass(), {
  run: false,
});

asyncTest.run();
process.nextTick(() => {
  assert.strictEqual(asyncTest.waitingSubtests, false);
  asyncTest.end();
});
