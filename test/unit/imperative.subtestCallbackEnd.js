'use strict';

const assert = require('assert');
const { ImperativeTest } = require('../..');

const test = new ImperativeTest('test', () => {}, { async: true });
const st = test.testSync('subtest', t => t.pass());

st.on('done', () => {
  process.nextTick(() => {
    assert.strictEqual(test.done, false);
    test._end();
  });
});
