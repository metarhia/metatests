'use strict';

const metatests = require('..');

metatests.test('async test.reject test', test => {
  const err = new Error('error');
  const t = new metatests.ImperativeTest('Rejecting test', async () => {
    const e1 = await t.rejects(Promise.reject(err), err);
    t.strictSame(e1, err);
    const e2 = await t.isRejected(Promise.reject(err), err);
    t.strictSame(e2, err);
  });
  t.on('done', () => {
    test.assert(t.success);
    const results = [
      {
        type: 'rejects',
        message: 'must reject',
        actual: err,
        success: true,
      },
      {
        type: 'isError',
        actual: err,
        expected: err,
        success: true,
      },
      {
        type: 'strictSame',
        actual: err,
        expected: err,
        success: true,
      },
    ];
    t.results.forEach((r, i) => {
      test.contains(r, results[i % results.length]);
    });
    test.end();
  });
});

metatests.test('test.reject test must throw resolve', test => {
  const res = 42;
  const t = new metatests.ImperativeTest('Rejecting test', async () => {
    try {
      await t.rejects(Promise.resolve(res), new Error());
      t.fail('must throw on resolve');
    } catch (e) {
      t.strictSame(e, res);
    }
  });
  t.on('done', () => {
    test.assertNot(t.success);
    test.contains(t.results[0], {
      type: 'rejects',
      actual: res,
      message: 'expected to be rejected, but was resolved',
      success: false,
    });
    test.contains(t.results[1], {
      type: 'strictSame',
      actual: res,
      expected: res,
      success: true,
    });
    test.end();
  });
});

metatests.test('test.reject subtest function', test => {
  const err = new Error('error');
  const t = new metatests.ImperativeTest('Rejecting test', () =>
    t.rejects(() => Promise.reject(err), err)
  );
  t.on('done', () => {
    test.assert(t.success);
    test.contains(t.results[0], {
      type: 'rejects',
      message: 'must reject',
      actual: err,
      success: true,
    });
    test.contains(t.results[1], {
      type: 'isError',
      actual: err,
      expected: err,
      success: true,
    });
    test.end();
  });
});

metatests.test('test.rejects no err', test => {
  const err = new Error();
  const t = new metatests.ImperativeTest('Rejecting test', () =>
    t.rejects(Promise.reject(err))
  );
  t.on('done', () => {
    test.assert(t.success);
    test.contains(t.results[0], {
      type: 'rejects',
      message: 'must reject',
      actual: err,
      success: true,
    });
    test.contains(t.results[1], {
      type: 'isError',
      actual: err,
      success: true,
    });
    test.end();
  });
});

metatests.test('test.rejected no err failed', test => {
  const t = new metatests.ImperativeTest('Rejecting test', () =>
    t.rejects(Promise.resolve(42))
  );
  t.on('done', () => {
    test.assertNot(t.success);
    test.contains(t.results[0], {
      type: 'rejects',
      actual: 42,
      message: 'expected to be rejected, but was resolved',
      success: false,
    });
    test.end();
  });
});
