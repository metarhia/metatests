'use strict';

const assert = require('assert');
const { ImperativeTest } = require('../..');

const test = new ImperativeTest('test', null, { dependentSubtests: true });
let warned = false;

process.on('warning', warn => {
  if (warn.code !== 'METATESTS_TODO_IN_DEPENDENT_TEST') return;
  warned = true;
  assert.strictEqual(
    warn.message,
    "Test 'subtest' is marked as TODO and will" +
      ' not be run as Runner.runTodo is false.'
  );
});

const subtest = test.test('subtest', null, { todo: true });
assert.strictEqual(subtest, null);
process.nextTick(() => assert(warned, 'must emit warning'));

test.end();
