'use strict';

const metatests = require('..');

metatests.test('async test.afterEach promise resolve', test => {
  let called = false;
  test.afterEach(async () => {
    called = true;
  });
  test.testSync(t => t.assertNot(called));
  test.testSync(t => t.assert(called));
  test.endAfterSubtests();
});

metatests.test('async test.afterEach promise reject must fail test', test => {
  const t = new metatests.ImperativeTest('Rejecting afterEach test', () => {
    t.afterEach(async () => {
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
    test.strictSame(res.message, 'afterEach error');
    test.end();
  });
});

metatests.test('test.afterEach promise reject must fail test', test => {
  const t = new metatests.ImperativeTest('Rejecting afterEach test', () => {
    t.afterEach(() => Promise.reject(42));
    t.testSync(() => {});
    t.endAfterSubtests();
  });
  t.on('done', () => {
    test.assertNot(t.success);
    const res = t.results[0].test.results[0];
    test.strictSame(res.type, 'fail');
    test.strictSame(res.actual, 42);
    test.strictSame(res.message, 'afterEach error');
    test.end();
  });
});
