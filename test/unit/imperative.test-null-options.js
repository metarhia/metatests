'use strict';

const assert = require('assert');
const { test } = require('../..');

const subtest = test(
  'should not failed when the passed options is null',
  t => {
    t.pass();
    t.end();
  },
  null
);
assert.doesNotThrow(() => subtest);
