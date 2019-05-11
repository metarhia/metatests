'use strict';

const assert = require('assert');
const { ImperativeTest } = require('../../metatests');

const test = new ImperativeTest();

assert.strictEqual(test.options.run, true, 'default run');
assert.strictEqual(test.options.async, true, 'default async');
assert.strictEqual(test.options.timeout, 30000, 'default timeout');
assert.deepStrictEqual(test.context, {}, 'default context');
assert.strictEqual(
  test.options.parallelSubtests,
  false,
  'default parallelSubtests'
);
assert.strictEqual(
  test.options.dependentSubtests,
  false,
  'default dependentSubtests'
);

test.end();
