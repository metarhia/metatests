'use strict';

const assert = require('assert');
const { ImperativeTest } = require('../../metatests');

const test = new ImperativeTest('', null, { timeout: 0 });
assert.strictEqual(test.timeoutTimer, undefined);
test.end();
