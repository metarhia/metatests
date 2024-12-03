'use strict';

const assert = require('node:assert');
const { ImperativeTest } = require('../../metatests.js');

const test = new ImperativeTest();
assert.strictEqual(test.waitingSubtests, true);
test.end();
