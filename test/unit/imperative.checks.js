'use strict';

const assert = require('assert');
const { last } = require('@metarhia/common');
const { ImperativeTest } = require('../..');

const test = new ImperativeTest();
const check = (name, expected) => {
  const actual = last(test.results);
  for (const key in expected) {
    assert.deepStrictEqual(actual[key], expected[key], `${key} in ${name}`);
  }
};

test.same(1, '1');
check('same', {
  type: 'equal',
  success: true,
  expected: '1',
  actual: 1,
});

test.equal(1, '1');
check('equal', {
  type: 'equal',
  success: true,
  expected: '1',
  actual: 1,
});

test.notEqual(1, '2');
check('notEqual', {
  type: 'notEqual',
  success: true,
  expected: '2',
  actual: 1,
});

test.strictSame(1, 1);
check('strictSame', {
  type: 'strictSame',
  success: true,
  expected: 1,
  actual: 1,
});

test.strictEqual(1, 1);
check('strictEqual', {
  type: 'strictSame',
  success: true,
  expected: 1,
  actual: 1,
});

test.strictNotSame(1, '1');
check('strictNotSame', {
  type: 'strictNotSame',
  success: true,
  expected: '1',
  actual: 1,
});

test.assert('value');
check('assert', {
  type: 'assert',
  success: true,
  expected: true,
  actual: 'value',
});

test.ok('value');
check('ok', {
  type: 'assert',
  success: true,
  expected: true,
  actual: 'value',
});

test.assertNot('');
check('assertNot', {
  type: 'assertNot',
  success: true,
  expected: false,
  actual: '',
});

test.notOk('');
check('notOk', {
  type: 'assertNot',
  success: true,
  expected: false,
  actual: '',
});

test.fail('fail message');
check('fail', {
  type: 'fail',
  success: false,
  message: 'fail message',
});

test.error(new Error());
check('error', {
  type: 'error',
  success: false,
});

test.error(null);
check('error', {
  type: 'error',
  success: true,
});

test.type('value', 'string');
check('type', {
  type: 'type',
  success: true,
  actual: ['string', 'String'],
  expected: 'string',
});

test.type('value', 'String');
check('type', {
  type: 'type',
  success: true,
  actual: ['string', 'String'],
  expected: 'String',
});

test.type('value', 'Buffer');
check('type', {
  type: 'type',
  success: false,
  actual: ['string', 'String'],
  expected: 'Buffer',
});

test.isError(new Error());
check('isError', {
  type: 'isError',
  success: true,
});

test.throws(() => {
  throw new Error();
}, new Error());
check('throws', {
  type: 'throws',
  success: true,
});

test.doesNotThrow(() => {
  throw new Error();
}, new Error('error with message'));
check('doesNotThrow', {
  type: 'doesNotThrow',
  success: false,
});

let fn = test.mustCall(() => {});
fn();
test.emit('beforeDone');
check('mustCall', {
  type: 'mustCall',
  success: true,
  message:
    "function 'anonymous' was called 1 time(s) " +
    'but was expected to be called 1 time(s)',
});

fn = test.mustCall(() => {});
test.emit('beforeDone');
check('mustCall', {
  type: 'mustCall',
  success: false,
  message:
    "function 'anonymous' was called 0 time(s) " +
    'but was expected to be called 1 time(s)',
});

fn = test.mustNotCall(() => {});
test.emit('beforeDone');
check('mustNotCall', {
  type: 'mustNotCall',
  success: true,
  message:
    "function 'anonymous' was called 0 time(s) " +
    'but was not expected to be called at all',
});

fn = test.mustNotCall(() => {});
fn();
test.emit('beforeDone');
check('mustNotCall', {
  type: 'mustNotCall',
  success: false,
  message:
    "function 'anonymous' was called 1 time(s) " +
    'but was not expected to be called at all',
});

test.contains({ field1: 'value', field2: 'value' }, { field1: 'value' });
check('contains', {
  type: 'contains',
  success: true,
});

test.contains({ field1: 'value' }, { field1: 'value', field3: 'value' });
check('contains', {
  type: 'contains',
  success: false,
});

test.pass();
check('pass', {
  type: 'pass',
  success: true,
});

test.end();
