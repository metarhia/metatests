'use strict';

const assert = require('node:assert');
const Test = require('../../lib/test.js');

const firstTest = new Test('test', { id: 1 });
assert.strictEqual(firstTest.id, 1);
assert.deepStrictEqual(firstTest.metadata.filepath, callerFilepath());
assert.deepStrictEqual(firstTest.options, { id: 1, todo: false, runner: null });
