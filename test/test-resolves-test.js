'use strict';

const metatests = require('..');

metatests.test('async test.resolve subtest', test => {
  const res = 42;
  const t = new metatests.ImperativeTest('Resolving test', async () => {
    const res1 = await t.resolves(Promise.resolve(res), res);
    t.strictSame(res1, res);
    const res2 = await t.isResolved(Promise.resolve(res), res);
    t.strictSame(res2, res);
  });
  t.on('done', () => {
    test.assert(t.success);
    const results = [
      {
        type: 'resolves',
        message: 'must resolve',
        actual: res,
      },
      {
        type: 'strictSame',
        actual: res,
        expected: res,
      },
      {
        type: 'strictSame',
        actual: res,
        expected: res,
      },
    ];
    t.results.forEach((r, i) => {
      test.contains(r, results[i % results.length]);
    });
    test.end();
  });
});

metatests.test('test.resolve must throw on reject', test => {
  const err = new Error('error');
  const t = new metatests.ImperativeTest('Resolving test', async () => {
    try {
      await t.resolves(Promise.reject(err), 42);
      t.fail('must throw on reject');
    } catch (e) {
      t.strictSame(e, err);
    }
  });
  t.on('done', () => {
    test.assertNot(t.success);
    test.contains(t.results[0], {
      type: 'resolves',
      actual: err,
      message: 'expected to be resolved, but was rejected',
      success: false,
    });
    test.contains(t.results[1], {
      type: 'strictSame',
      actual: err,
      expected: err,
      success: true,
    });
    test.end();
  });
});

metatests.test('test.resolve subtest function', test => {
  const res = 42;
  const t = new metatests.ImperativeTest('Resolving test', () =>
    t.resolves(() => Promise.resolve(res), res)
  );
  t.on('done', () => {
    test.assert(t.success);
    test.contains(t.results[0], {
      type: 'resolves',
      message: 'must resolve',
      actual: res,
    });
    test.contains(t.results[1], {
      type: 'strictSame',
      actual: res,
      expected: res,
    });
    test.end();
  });
});

metatests.test('test.resolves no expected', test => {
  const t = new metatests.ImperativeTest('Resolving test', () =>
    t.resolves(Promise.resolve(42))
  );
  t.on('done', () => {
    test.assert(t.success);
    test.contains(t.results[0], {
      type: 'resolves',
      message: 'must resolve',
      actual: 42,
      success: true,
    });
    test.end();
  });
});

metatests.test('test.resolve expected undefined', test => {
  const t = new metatests.ImperativeTest('Resolving test', () =>
    t.resolves(Promise.resolve(), undefined)
  );
  t.on('done', () => {
    test.assert(t.success);
    test.contains(t.results[0], {
      type: 'resolves',
      message: 'must resolve',
      actual: undefined,
      success: true,
    });
    test.contains(t.results[1], {
      type: 'strictSame',
      actual: undefined,
      expected: undefined,
      success: true,
    });
    test.end();
  });
});

metatests.test('test.resolve expected undefined failed', test => {
  const t = new metatests.ImperativeTest('Resolving test', () =>
    t.resolves(Promise.resolve(42), undefined)
  );
  t.on('done', () => {
    test.assertNot(t.success);
    test.contains(t.results[0], {
      type: 'resolves',
      message: 'must resolve',
      actual: 42,
      success: true,
    });
    test.contains(t.results[1], {
      type: 'strictSame',
      actual: 42,
      expected: undefined,
      success: false,
    });
    test.end();
  });
});

metatests.test('test.resolves no expected failed', test => {
  const t = new metatests.ImperativeTest('Resolving test', () =>
    t.resolves(Promise.reject(42))
  );
  t.on('done', () => {
    test.assertNot(t.success);
    test.contains(t.results[0], {
      type: 'resolves',
      actual: 42,
      message: 'expected to be resolved, but was rejected',
      success: false,
    });
    test.end();
  });
});
