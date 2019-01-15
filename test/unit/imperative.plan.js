'use strict';

const assert = require('assert');
const { ImperativeTest } = require('../..');

const test = new ImperativeTest();
test.plan(123);
assert.strictEqual(test.planned, 123);
test.end();
