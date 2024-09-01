'use strict';

const metatests = require('..');

metatests.test('async test.defer promise resolve', (test) => {
  let calledDefer = false;
  let deferDone = false;
  let calledAfter = false;
  const state = { a: 42 };
  const t = new metatests.ImperativeTest('Resolve defer', (t) => {
    t.afterEach(async () => {
      calledAfter = true;
      test.strictEqual(state.a, 42);
      test.assert(deferDone, 'defer must finish before afterEach');
    });
    t.test(async (subtest) => {
      state.a = 24;
      subtest.defer(async () => {
        calledDefer = true;
        await Promise.resolve().then(() => {
          test.strictEqual(state.a, 24);
          test.assert(!calledAfter, 'defer must be waited before test end');
          state.a = 42;
          deferDone = true;
        });
      });
      subtest.pass();
    });
    t.endAfterSubtests();
  });
  t.on('done', () => {
    test.assert(t.success);
    test.strictEqual(state.a, 42);
    test.assert(calledDefer, 'must call defer fn');
    test.assert(calledAfter, 'must call after fn');
    test.end();
  });
});

metatests.test('async test.defer promise reject', (test) => {
  let calledDefer1 = false;
  let calledDefer2 = false;
  let calledAfter = false;
  const state = { a: 42 };
  const t = new metatests.ImperativeTest('Rejecting defer test', (t) => {
    t.afterEach(async () => {
      calledAfter = true;
      test.strictEqual(state.a, 33);
      test.assert(calledDefer1, 'defer1 must finish before afterEach');
      test.assert(calledDefer2, 'defer2 must finish before afterEach');
    });
    t.test(async (subtest) => {
      state.a = 24;
      subtest.defer(async () => {
        calledDefer1 = true;
        await Promise.reject(new Error('Defer failed'));
      });
      subtest.pass();
      subtest.defer(async () => {
        calledDefer2 = true;
        state.a = 33;
      });
    });
    t.endAfterSubtests();
  });
  t.on('done', () => {
    test.assertNot(t.success);
    test.strictEqual(state.a, 33);
    test.assert(calledDefer1, 'must call defer fn');
    test.assert(calledAfter, 'must call after fn');
    test.contains(t.results[0], {
      type: 'subtest',
      success: false,
    });
    const subtestResults = t.results[0].test.results;
    test.contains(subtestResults[0], {
      type: 'pass',
      success: true,
    });
    test.contains(subtestResults[1], {
      type: 'defer',
      success: false,
      actual: new Error('Defer failed'),
      expected: undefined,
    });

    test.end();
  });
});

metatests.test('async test.defer promise reject ignore', (test) => {
  let calledDefer = false;
  let calledAfter = false;
  const state = { a: 42 };
  const t = new metatests.ImperativeTest('Rejecting defer test', (t) => {
    t.afterEach(async () => {
      calledAfter = true;
      test.strictEqual(state.a, 24);
    });
    t.test(async (subtest) => {
      state.a = 24;
      subtest.defer(
        async () => {
          calledDefer = true;
          await Promise.reject(new Error('Defer failed'));
        },
        { ignoreErrors: true },
      );
      subtest.pass();
    });
    t.endAfterSubtests();
  });
  t.on('done', () => {
    test.assert(t.success);
    test.strictEqual(state.a, 24);
    test.assert(calledDefer, 'must call defer fn');
    test.assert(calledAfter, 'must call after fn');
    test.contains(t.results[0], {
      type: 'subtest',
      success: true,
    });
    test.contains(t.results[0].test.results[0], {
      type: 'pass',
      success: true,
    });
    test.assert(t.results[0].test.output.includes('Defer callback errored'));

    test.end();
  });
});
