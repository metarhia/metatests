'use strict';

const metatest = require('..');

metatest.test('Imperative example', (test) => {
  test.strictSame(1, 1);
  test.end();
});
