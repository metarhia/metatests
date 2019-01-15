'use strict';

const assert = require('assert');
const Test = require('../../lib/test.js');

const test = new Test();
test.erroer('exception type', new Error('exception message'));

const [result] = test.results;
assert.strictEqual(result.type, 'exception type');
assert.strictEqual(result.success, false);
assert.strictEqual(result.message, 'exception message');
