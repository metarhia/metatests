'use strict';

const assert = require('assert');
const {
  ImperativeTest,
  runner: { Runner },
} = require('../..');

const test = new ImperativeTest('test', null, { runner: new Runner() });
test.options.runner.runTodo();
const subtest = test.test(
  'subtest',
  t => {
    t.pass();
    t.end();
  },
  { todo: true }
);
subtest.on('done', () => test.end());
assert.strictEqual(test.subtestId, 1);
