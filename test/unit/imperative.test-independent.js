'use strict';

const assert = require('assert');
const { ImperativeTest } = require('../..');

const test = new ImperativeTest();
let warned = false;

process.on('warning', warn => {
  if (warn.code === 'METATESTS_TODO_IN_DEPENDENT_TEST') warned = true;
});

test.test('subtest', null, { todo: true });

process.nextTick(() => assert(!warned, 'must not emit warning'));

test.end();
