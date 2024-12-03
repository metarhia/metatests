'use strict';

const assert = require('node:assert');
const { DeclarativeTest } = require('../..');

const test = new DeclarativeTest();
assert.strictEqual(test.options.run, true, 'default run');
