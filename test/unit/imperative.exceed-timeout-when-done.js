'use strict';

const assert = require('node:assert');
const { ImperativeTest } = require('../../metatests.js');

const test = new ImperativeTest('', null);
test.end();
test._setupTimeout(1);
setTimeout(() => assert.strictEqual(test.results.length, 0), 1);
