'use strict';

const assert = require('assert');
const { ImperativeTest } = require('../..');

const test = new ImperativeTest('test');
const st = test.testSync('subtest', t => t.pass());

st.on('done', () => {
  test.test('subtest 2', t => t.pass());
  process.nextTick(() => {
    assert.strictEqual(test.done, false);
    test._end();
  });
});
