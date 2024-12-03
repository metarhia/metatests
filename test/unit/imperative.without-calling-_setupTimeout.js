'use strict';

const assert = require('node:assert');
const { ImperativeTest } = require('../../metatests.js');

const test = new ImperativeTest('', null, { timeout: 0 });
assert.strictEqual(test.timeoutTimer, undefined);
test.end();
