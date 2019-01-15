'use strict';

const assert = require('assert');
const { ImperativeTest } = require('../../metatests');

const test = new ImperativeTest();
assert.strictEqual(test.waitingSubtests, true);
test.end();
