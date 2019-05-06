'use strict';

const metatests = require('..');

metatests.test('must support promise reject', test => {
  const err = new Error();
  const t = new metatests.ImperativeTest('Rejecting test', () =>
    Promise.reject(err)
  );
  t.on('done', () => {
    test.assertNot(t.success);
    test.strictSame(t.results[0].type, 'fail');
    test.strictSame(t.results[0].actual, err);
    test.strictSame(t.results[0].message, 'Promise rejection');
    test.end();
  });
});

metatests.test('must end on promise resolve', test => {
  const t = new metatests.ImperativeTest('Resolve test', async () => {});
  t.on('done', () => {
    test.assert(t.success);
    test.strictSame(t.results.length, 0);
    test.end();
  });
});

metatests.test('must not end on plan tests with promise', test => {
  const t = new metatests.ImperativeTest('Resolve test', () => {
    t.plan(1);
    setTimeout(() => {
      t.pass();
    }, 100);
    return Promise.resolve();
  });
  t.on('done', () => {
    test.assert(t.success);
    test.end();
  });
});

metatests.test('must endAfterSubtests on promise resolve', test => {
  let subtest;
  const t = new metatests.ImperativeTest('Resolve test', async () => {
    subtest = t.test('Waiting subtest', t => {
      setTimeout(() => t.end(), 100);
    });
  });
  t.on('done', () => {
    test.assert(t.success);
    test.assert(subtest.done);
    test.assert(subtest.success);
    test.contains(t.results[0], {
      type: 'subtest',
      test: subtest,
      message: subtest.caption,
    });
    test.strictSame(t.results[0].success, subtest.success);
    test.end();
  });
});
