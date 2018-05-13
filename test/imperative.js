'use strict';

const metatests = require('..');

metatests.test('strictSame', (test) => {
  test.strictSame(1, 1);
  test.end();
});

metatests.test('assert', (test) => {
  test.assert(1);
  test.end();
});

metatests.test('assertNot', (test) => {
  test.assertNot(0);
  test.end();
});

metatests.test('same', (test) => {
  test.same(1, '1');
  test.end();
});
