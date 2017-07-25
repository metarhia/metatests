'use strict';

const maojian = require('..');

maojian.test('Imperative example', (test) => {
  test.strictSame(1, 1);
  test.end();
});
