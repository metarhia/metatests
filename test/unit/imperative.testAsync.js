'use strict';

const assert = require('assert');
const { ImperativeTest } = require('../..');

const test = new ImperativeTest();
const subtest = test.testAsync('subtest async', t => {
  t.pass();
  t.end();
});
subtest.on('done', () => test.end());
assert.strictEqual(subtest.options.async, true);
