'use strict';

const assert = require('assert');
const { DeclarativeTest } = require('../..');

const test = new DeclarativeTest();
assert.strictEqual(test.options.run, true, 'default run');
