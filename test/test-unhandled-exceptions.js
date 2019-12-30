'use strict';

const { test, ImperativeTest } = require('../metatests');

test('must catch unhandledExceptions', test => {
  const error = new Error('Error');
  const t = new ImperativeTest(
    'Throwing test',
    () => {
      throw error;
    },
    { async: false }
  );

  t.on('done', () => {
    test.assertNot(t.success, 'must be failed');
    const res = t.results[0];
    test.strictSame(res.type, 'unhandledException');
    test.assertNot(res.success);
    test.strictSame(res.message, error.message);
    test.strictSame(res.stack, error.stack);
    test.end();
  });
});
