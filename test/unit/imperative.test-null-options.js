'use strict';

const assert = require('node:assert');
const { test } = require('../..');

const subtest = test(
  'should not failed when the passed options is null',
  (test) => {
    test.pass();
    test.end();
  },
  null,
);
assert.doesNotThrow(() => subtest);
