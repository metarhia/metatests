'use strict';

const assert = require('assert');
const { ImperativeTest } = require('../..');

const syncTest = new ImperativeTest('run sync', t => t.pass(), {
  async: false,
  run: false,
});

let onDoneCalled = false;
const onDone = () => {
  onDoneCalled = true;
};

syncTest.run();

process.nextTick(() => {
  assert.strictEqual(syncTest.waitingSubtests, true);
  syncTest.test('subtest', t => t.pass());
  syncTest.on('done', onDone);
  process.nextTick(() => {
    assert(!onDoneCalled, 'must not call onDone');
    syncTest.end();
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
