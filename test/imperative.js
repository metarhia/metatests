'use strict';

const metatests = require('..');
const vm = require('vm');

metatests.testSync('strictSame', test => {
  test.strictSame(1, 1);
});

metatests.testSync('assert', test => {
  test.assert(1);
});

metatests.testSync('assertNot', test => {
  test.assertNot(0);
});

metatests.testSync('same', test => {
  test.same(1, '1');
});

metatests.testSync('error', test => {
  test.error({}, "that's ok");
});

metatests.testSync('type', test => {
  test.type(new Date(), 'Date');
  test.type(new Date(), 'object');
});

metatests.testSync('test.type with no constructor', test => {
  test.type(null, 'object');
  test.type(undefined, 'undefined');
  test.type(Object.create(null), 'object');
});

metatests.testAsync('sequential tests 1', test => {
  setTimeout(() => {
    test.ok(true);
    test.end();
  }, 1000);
});

metatests.testSync('sequential, must be possible to call end', test => {
  test.end();
});

metatests.testSync('sequential tests must be ordered and sequential', test => {
  let i = 0;
  test.testSync('Seq1', () => test.strictSame(i++, 0));
  test.testSync('Seq2', () => test.strictSame(i++, 1));
  test.testSync('Seq3', () => test.strictSame(i++, 2));
  process.nextTick(() =>
    process.nextTick(() =>
      process.nextTick(() => {
        if (test.done) {
          test.bailout('must not end before each subtest finishes (in order)');
        }
      })
    )
  );
});

metatests.test('test plan', test => {
  test.plan(2);
  test.type(new Date(), 'Date');
  test.type(new Date(), 'object');
});

metatests.test('test must be async', test => {
  // this will throw if test is sync as it will end it on nextTick
  setTimeout(() => test.end(), 100);
});

metatests.testSync('test sync explicit', test => {
  let i = 0;
  test.strictSame(++i, 1);
  test.testSync('nested sync explicit', test => {
    test.strictSame(++i, 2);
  });
});

metatests.test('nested test', t1 => {
  t1.strictSame(123, 123);
  t1.endAfterSubtests();
  t1.test('Delayed subtest', t2 => {
    process.nextTick(() => {
      t2.strictSame(123, 123);
      t2.end();
    });
  });
});

metatests.testAsync('nested test that ends after each subtest', test => {
  let i = 0;
  test.strictSame(++i, 1);
  test.testSync('sequential subtest', t2 => {
    t2.strictSame(++i, 2);
    test.endAfterSubtests();
  });
  test.testAsync('delayed subtest', t3 => {
    setTimeout(() => {
      t3.strictSame(++i, 3);
      t3.end();
    }, 100);
  });
});

metatests.testSync(
  'todo must not fail',
  test => {
    test.strictSame(13, 42);
  },
  { todo: true }
);

metatests.testSync('must not be todo by default', test => {
  const t = new metatests.ImperativeTest();
  test.assertNot(t.todo);
  t.end();
});

metatests.testSync(
  'test nested parallel',
  test => {
    test.endAfterSubtests();

    let i = 0;
    test.test('nested parallel 1', test => {
      test.strictSame(i, 0);
      test.on('done', () => process.nextTick(() => (i = 1)));
      test.end();
    });
    test.test('nested parallel 2', test => {
      test.strictSame(i, 0);
      test.on('done', () => process.nextTick(() => (i = 1)));
      test.end();
    });
    test.test('nested parallel 3', test => {
      test.strictSame(i, 0);
      test.on('done', () => process.nextTick(() => (i = 1)));
      test.end();
    });
    test.on('beforeDone', () => {
      test.strictSame(i, 1);
    });
  },
  { parallelSubtests: true }
);

metatests.testSync('beforeEach', test => {
  let i = 0;
  test.beforeEach((t, callback) => {
    i = 42;
    callback();
  });
  test.testSync(t => t.strictSame(i, 42));
});

metatests.testSync('passes options context', test => {
  const context = { a: 'a', b: 'b', c: 'c' };
  test.testSync('check passed args', (t, args) => t.strictSame(args, context), {
    context,
  });
});

metatests.testSync('beforeEach parameters', test => {
  const context = { a: 'a', b: 'b', c: 'c' };
  test.beforeEach((t, callback) => callback(context));
  test.testSync((t, args) => t.strictSame(args, context));
});

metatests.test('afterEach', test => {
  test.endAfterSubtests();

  let i = 0;
  test.afterEach((t, callback) => {
    test.strictSame(i, 13);
    i = 42;
    callback();
  });
  test.testSync(() => {
    test.strictSame(i, 0);
    i = 13;
  });
  test.on('beforeDone', () => test.strictSame(i, 42));
});

metatests.testSync('test must fail if assertion failed', test => {
  const targetTest = new metatests.ImperativeTest('Failing test');
  targetTest.equal(1, 2);
  targetTest.end();
  test.assertNot(targetTest.success);
  test.end();
});

metatests.testSync('test must not fail if no assertion failed', test => {
  const targetTest = new metatests.ImperativeTest('Passing test');
  targetTest.equal(1, 1);
  targetTest.end();
  test.assert(targetTest.success);
  test.end();
});

metatests.testSync('throw with empty error', test => {
  test.throws(() => {
    throw new Error();
  });
});

metatests.testSync('throw with message error', test => {
  const message = 'message';
  test.throws(() => {
    throw new Error(message);
  }, new Error(message));
});

metatests.testSync('throw with type error (compare to Error)', test => {
  const message = 'message';
  test.throws(() => {
    throw new TypeError(message);
  }, new Error(message));
});

metatests.testSync('doesNotThrow failure', test => {
  const t = new metatests.ImperativeTest();
  t.doesNotThrow(() => {
    throw new Error();
  }, 'message');
  t.end();
  test.assertNot(t.success);
  test.strictSame(t.results[0].type, 'doesNotThrow');
  test.strictSame(t.results[0].message, 'message');
});

metatests.testSync('doesNotThrow success', test => {
  const t = new metatests.ImperativeTest();
  t.doesNotThrow(() => {}, 'message');
  t.end();
  test.assert(t.success);
});

metatests.testSync('isError no error provided', test => {
  const actual = new Error();
  test.isError(actual);
});

metatests.testSync('isError with error provided', test => {
  const actual = new TypeError();
  test.isError(actual, new TypeError());
});

metatests.testSync('testSync must return a test', test => {
  const t = metatests.testSync();
  test.ok(t);
  t.end();
});

metatests.testSync('testAsync must return a test', test => {
  const t = metatests.testAsync();
  test.ok(t);
  t.end();
});

metatests.test('test.testAsync must be async', test => {
  const t = new metatests.ImperativeTest('Sync test', undefined, {
    async: false,
  });
  let endCalled = false;
  t.testAsync('async test', () =>
    setTimeout(() => {
      t.end();
      endCalled = true;
    }, 10)
  );
  process.nextTick(() =>
    process.nextTick(() =>
      process.nextTick(() => {
        if (t.done && !endCalled) {
          test.bailout('must not finish before t.end() call');
        }
      })
    )
  );
  t.on('done', () => test.end());
});

metatests.test('must call done listener after test end', test => {
  const t = new metatests.ImperativeTest('Ended test');
  t.end();
  t.on('done', () => test.pass('must be called'));
  test.end();
});

metatests.test('must support timeout', test => {
  const t = new metatests.ImperativeTest('Timing out test', () => {}, {
    timeout: 1,
  });
  t.on('done', () => {
    test.strictSame(t.results[0].type, 'timeout');
    test.assertNot(t.results[0].success);
    test.assertNot(t.success);
    test.end();
  });
});

metatests.test("'pass' result must not contain actual/expected", test => {
  const t = new metatests.ImperativeTest('Pass test', t => {
    t.pass('msg');
    t.end();
  });
  t.on('done', () => {
    test.strictSame(t.results[0].type, 'pass');
    test.strictSame(t.results[0].message, 'msg');
    test.assertNot(
      Object.prototype.hasOwnProperty.call(t.results[0], 'actual')
    );
    test.assertNot(
      Object.prototype.hasOwnProperty.call(t.results[0], 'expected')
    );
    test.end();
  });
});

metatests.test('must support test.plan', test => {
  const t = new metatests.ImperativeTest('plan test', t => {
    t.plan(1);
    t.strictSame(2 + 2, 4);
  });
  t.on('done', () => {
    test.end();
  });
});

metatests.test('must support test.plan (async)', test => {
  const t = new metatests.ImperativeTest('plan test', t => {
    t.plan(2);
    t.strictSame(2 + 2, 4);
    process.nextTick(() => t.pass('pass'));
  });
  t.on('done', () => {
    test.end();
  });
});

metatests.test('must support mustCall', test => {
  const t = new metatests.ImperativeTest('mustCall test', t => {
    const fn = t.mustCall(() => {}, 1);
    fn();
    t.end();
  });
  t.on('done', () => {
    test.assert(t.results[0].success);
    test.strictSame(t.results[0].type, 'mustCall');
    test.strictSame(t.results[0].actual, 1);
    test.strictSame(t.results[0].expected, 1);
    test.end();
  });
});

metatests.test('must support empty mustCall', test => {
  const t = new metatests.ImperativeTest('mustCall test', t => {
    const fn = t.mustCall();
    fn();
    t.end();
  });
  t.on('done', () => {
    test.assert(t.results[0].success);
    test.strictSame(t.results[0].type, 'mustCall');
    test.strictSame(t.results[0].actual, 1);
    test.strictSame(t.results[0].expected, 1);
    test.end();
  });
});

metatests.test('must support mustCall (async)', test => {
  const t = new metatests.ImperativeTest('mustCall test', t => {
    const fn = t.mustCall(() => {}, 1);
    process.nextTick(() => fn());
    process.nextTick(() => process.nextTick(() => t.end()));
  });
  t.on('done', () => {
    test.assert(t.results[0].success);
    test.strictSame(t.results[0].type, 'mustCall');
    test.strictSame(t.results[0].actual, 1);
    test.strictSame(t.results[0].expected, 1);
    test.end();
  });
});

metatests.test('must support mustCall (many)', test => {
  const t = new metatests.ImperativeTest('mustCall test', t => {
    const fn = t.mustCall(() => {}, 3);
    fn();
    fn();
    fn();
    t.end();
  });
  t.on('done', () => {
    test.assert(t.results[0].success);
    test.strictSame(t.results[0].type, 'mustCall');
    test.strictSame(t.results[0].actual, 3);
    test.strictSame(t.results[0].expected, 3);
    test.end();
  });
});

metatests.test('must support mustCall (fail)', test => {
  const t = new metatests.ImperativeTest('mustCall test', t => {
    t.mustCall(() => {}, 1, 'name');
    t.end();
  });
  t.on('done', () => {
    test.assertNot(t.results[0].success);
    test.strictSame(t.results[0].type, 'mustCall');
    test.strictSame(
      t.results[0].message,
      "function 'name' was called 0 time(s) but " +
        'was expected to be called 1 time(s)'
    );
    test.strictSame(t.results[0].actual, 0);
    test.strictSame(t.results[0].expected, 1);
    test.end();
  });
});

metatests.test('must support mustNotCall', test => {
  const t = new metatests.ImperativeTest('mustNotCall test', t => {
    t.mustNotCall(() => {});
    t.end();
  });
  t.on('done', () => {
    test.assert(t.results[0].success);
    test.strictSame(t.results[0].type, 'mustNotCall');
    test.strictSame(t.results[0].actual, 0);
    test.strictSame(t.results[0].expected, 0);
    test.end();
  });
});

metatests.test('must support empty mustNotCall', test => {
  const t = new metatests.ImperativeTest('mustNotCall test', t => {
    t.mustNotCall();
    t.end();
  });
  t.on('done', () => {
    test.assert(t.results[0].success);
    test.strictSame(t.results[0].type, 'mustNotCall');
    test.strictSame(t.results[0].actual, 0);
    test.strictSame(t.results[0].expected, 0);
    test.end();
  });
});

metatests.test('must support mustNotCall (fail)', test => {
  const t = new metatests.ImperativeTest('mustNotCall test', t => {
    const fn = t.mustNotCall(() => {}, 'name');
    fn();
    t.end();
  });
  t.on('done', () => {
    test.assertNot(t.results[0].success);
    test.strictSame(t.results[0].type, 'mustNotCall');
    test.strictSame(
      t.results[0].message,
      "function 'name' was called 1 time(s) but " +
        'was not expected to be called at all'
    );
    test.strictSame(t.results[0].actual, 1);
    test.strictSame(t.results[0].expected, 0);
    test.end();
  });
});

metatests.testSync('mustCall wrapper must return same value', test => {
  const wrapped = test.mustCall(() => 42);
  test.strictSame(wrapped(), 42);
});

metatests.test('mustNotCall wrapper must return same value', test => {
  new metatests.ImperativeTest(
    'mustNotCall test',
    t => {
      const wrapped = t.mustNotCall(() => 42);
      test.strictSame(wrapped(), 42);
      test.end();
    },
    { async: false }
  );
});

metatests.test('failed todo subtest must not fail parent', test => {
  const t = new metatests.ImperativeTest(
    'parent',
    test => {
      test.testSync('failed todo subtest', t => t.fail(), { todo: true });
    },
    { async: false }
  );
  t.on('done', () => {
    test.strictSame(t.success, true);
    test.end();
  });
});

metatests.test('must support Error from another context', test => {
  const t = new metatests.ImperativeTest('mustNotCall test', t => {
    let err = null;
    try {
      vm.runInNewContext('throw new Error()');
    } catch (e) {
      err = e;
    }
    t.error(err);
    t.end();
  });
  t.on('done', () => {
    test.strictSame(t.success, false);
    test.end();
  });
});

metatests.test('must not run TODO subtests by default', test => {
  let todoSubtestCalled = false;
  const t = new metatests.ImperativeTest('parent test', t => {
    t.endAfterSubtests();
    t.testSync(
      'todo subtest',
      () => {
        todoSubtestCalled = true;
      },
      { todo: true }
    );
  });
  t.on('done', () => {
    test.strictSame(t.success, true);
    test.strictSame(todoSubtestCalled, false);
    test.end();
  });
});

metatests.testSync('must support simple contains', test => {
  test.contains({ a: 42, b: 13 }, { a: 42 });
});

metatests.testSync('must support contains comparator', test => {
  test.contains(
    { a: 42, b: 13 },
    { a: 123 },
    '',
    false,
    actual => actual === 42
  );
});

metatests.testSync('must support contains of errors', test => {
  test.contains(new Error('hello'), { name: 'Error', message: 'hello' });
});

metatests.test(
  'must not call subtest function after test.end in beforeEach',
  test => {
    test.endAfterSubtests();
    test.beforeEach((t, cb) => {
      t.end();
      cb();
    });
    test.test('subtest', test.mustNotCall());
  }
);

if (__filename) {
  metatests.testSync('test must contain `filepath` in metadata', test => {
    test.strictSame(test.metadata.filepath, __filename);
  });

  metatests.testSync('test must contain `filepath` in metadata', test => {
    const t = new metatests.ImperativeTest();
    test.strictSame(t.metadata.filepath, __filename);
    t.end();
  });
}

metatests.testSync('must support simple Map comparison', test => {
  test.strictEqual(
    new Map([
      [1, 'a'],
      [2, 'b'],
    ]),
    new Map([
      [1, 'a'],
      [2, 'b'],
    ])
  );
});

metatests.test('must support simple Map comparison failure', test => {
  const t = new metatests.ImperativeTest('mustCall test', t => {
    t.strictEqual(
      new Map([[1, 'a']]),
      new Map([
        [2, 'b'],
        [1, 'a'],
      ])
    );
    t.end();
  });
  t.on('done', () => {
    test.strictSame(t.success, false);
    test.end();
  });
});

metatests.testSync('must support simple Set comparison', test => {
  test.strictEqual(new Set([1, 2]), new Set([1, 2]));
});

metatests.test('must support simple Set comparison failure', test => {
  const t = new metatests.ImperativeTest('mustCall test', t => {
    t.strictEqual(new Set([1]), new Set([1, 2]));
    t.end();
  });
  t.on('done', () => {
    test.strictSame(t.success, false);
    test.end();
  });
});
