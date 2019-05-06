'use strict';

const metatests = require('..');

metatests.test('async test.beforeEach promise resolve', test => {
  let called = false;
  test.beforeEach(async t => {
    t.assert(42);
    called = true;
  });
  test.testSync(t => {
    t.assert(called);
  });
  test.endAfterSubtests();
});

metatests.test('async test.beforeEach promise reject must fail test', test => {
  const t = new metatests.ImperativeTest('Rejecting beforeEach test', () => {
    t.beforeEach(async () => {
      throw 42;
    });
    t.testSync(() => {});
    t.endAfterSubtests();
  });
  t.on('done', () => {
    test.assertNot(t.success);
    const res = t.results[0].test.results[0];
    test.strictSame(res.type, 'fail');
    test.strictSame(res.actual, 42);
    test.strictSame(res.message, 'beforeEach error');
    test.end();
  });
});

metatests.test('test.beforeEach promise reject must fail test', test => {
  const t = new metatests.ImperativeTest('Rejecting beforeEach test', () => {
    t.beforeEach(() => Promise.reject(42));
    t.testSync(() => {});
    t.endAfterSubtests();
  });
  t.on('done', () => {
    test.assertNot(t.success);
    const res = t.results[0].test.results[0];
    test.strictSame(res.type, 'fail');
    test.strictSame(res.actual, 42);
    test.strictSame(res.message, 'beforeEach error');
    test.end();
  });
});
