'use strict';

const mt = require('..');

mt.test('strictSame', (test) => {
  test.strictSame(1, 1);
  test.end();
});

mt.test('assert', (test) => {
  test.assert(1);
  test.end();
});

mt.test('assertNot', (test) => {
  test.assertNot(0);
  test.end();
});

mt.test('same', (test) => {
  test.same(1, '1');
  test.end();
});
