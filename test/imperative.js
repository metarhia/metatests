'use strict';

const mt = require('..');

mt.test('Imperative example', (test) => {
  test.strictSame(1, 1);
  test.end();
});
