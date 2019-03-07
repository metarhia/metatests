'use strict';

const metatests = require('..');

metatests.test('must support promise reject', test => {
  const err = new Error();
  const t = new metatests.ImperativeTest('Rejecting test', () =>
    Promise.reject(err)
  );
  t.on('done', () => {
    test.assertNot(t.success);
    test.strictSame(t.results[0].type, 'error');
    test.strictSame(t.results[0].actual, err);
    test.strictSame(t.results[1].type, 'fail');
    test.strictSame(t.results[1].message, 'Promise rejection');
    test.end();
  });
});
