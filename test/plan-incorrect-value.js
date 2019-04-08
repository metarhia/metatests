'use strict';

const metatests = require('..');

metatests.test('must end on test.plan(0)', test => {
  test.plan(0);
  // no checks needed, this will finish with timeout on error
});

metatests.test('must end on test.plan(<0)', test => {
  test.plan(-1);
  // no checks needed, this will finish with timeout on error
});
