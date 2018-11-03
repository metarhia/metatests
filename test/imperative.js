'use strict';

const metatests = require('..');

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
  test.error({}, 'that\'s ok');
});

metatests.testSync('type', test => {
  test.type(new Date(), 'Date');
  test.type(new Date(), 'object');
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
  process.nextTick(() => process.nextTick(() => process.nextTick(() => {
    if (test.done) {
      test.fail('must not end before each subtest finishes (in order)');
    }
  })));
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

metatests.testAsync('nested test that ends after each subtest', t1 => {
  let i = 0;
  t1.strictSame(++i, 1);
  t1.testSync('sequential subtest', t2 => {
    t2.strictSame(++i, 2);
  });
  process.nextTick(() => process.nextTick(() => {
    t1.strictSame(++i, 3);
    t1.endAfterSubtests();
  }));
  t1.testAsync('delayed subtest', t3 => {
    setTimeout(() => {
      t3.strictSame(++i, 4);
      t3.end();
    }, 100);
  });
});

metatests.testSync('todo must not fail', test => {
  test.strictSame(13, 42);
}, { todo: true });

metatests.testSync('must not be todo by default', test => {
  const t = new metatests.ImperativeTest();
  test.assertNot(t.todo);
  t.end();
});

metatests.testSync('test nested parallel', test => {
  let i = 0;
  test.strictSame(++i, 1);
  test.testSync('nested parallel 1', test => test.strictSame(++i, 2));
  test.testSync('nested parallel 2', test => test.strictSame(++i, 3));
  test.testSync('nested parallel 3', test => test.strictSame(++i, 4));
  // first nextTick to run, second to end, therefore check on third
  process.nextTick(() => process.nextTick(() => process.nextTick(() => {
    if (!test.done) test.fail('Parallel subtests must run in parallel');
  })));
}, { parallelSubtests: true });

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
  test.testSync('check passed args',
    (t, args) => t.strictSame(args, context),
    { context });
});

metatests.testSync('beforeEach parameters', test => {
  const context = { a: 'a', b: 'b', c: 'c' };
  test.beforeEach((t, callback) => callback(context));
  test.testSync((t, args) => t.strictSame(args, context));
});

metatests.test('afterEach', test => {
  test.plan(3);
  let i = 0;
  test.afterEach((t, callback) => {
    test.pass('must call afterEach');
    i = 42;
    callback();
  });
  const t = test.testSync(() => {
    test.pass('must call test');
    i = 13;
  });
  t.on('done', () => test.strictSame(i, 42));
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
  test.throws(() => { throw new Error(); });
});

metatests.testSync('throw with message error', test => {
  const message = 'message';
  test.throws(() => { throw new Error(message); }, new Error(message));
});

metatests.testSync('throw with type error (compare to Error)', test => {
  const message = 'message';
  test.throws(() => { throw new TypeError(message); }, new Error(message));
});

metatests.testSync('doesNotThrow failure', test => {
  const t = new metatests.ImperativeTest();
  t.doesNotThrow(() => { throw new Error(); }, 'message');
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

metatests.test('must catch unhandledExeptions', test => {
  const error = new Error('Error');
  const t = new metatests.ImperativeTest('Throwing test', () => {
    throw error;
  }, { async: false });

  setTimeout(() => {
    test.assert(t.done, 'must finish');
    test.assertNot(t.success, 'must be failed');
    const res = t.results[0];
    test.strictSame(res.type, 'unhandledExeption');
    test.assertNot(res.success);
    test.strictSame(res.message, error.message);
    test.strictSame(res.stack, error.stack);
    test.end();
  }, 1);
});

metatests.test('test.testAsync must be async', test => {
  const t = new metatests.ImperativeTest(
    'Sync test',
    undefined,
    { async: false });
  t.testAsync('async test', () => setTimeout(() => t.end(), 10));
  process.nextTick(() => process.nextTick(() => process.nextTick(() => {
    if (t.done) {
      test.fail('must not finish before t.end() call');
    }
  })));
  t.on('done', () => test.end());
});

metatests.test('must call done listener after test end', test => {
  const t = new metatests.ImperativeTest('Ended test');
  t.end();
  t.on('done', () => test.pass('must be called'));
  test.end();
});

metatests.test('must support timeout', test => {
  const t = new metatests.ImperativeTest('Timing out test',
    () => {},
    { timeout: 1 }
  );
  t.on('done', () => {
    test.strictSame(t.results[0].type, 'timeout');
    test.assertNot(t.results[0].success);
    test.assertNot(t.success);
    test.end();
  });
});

metatests.test('\'fail\' result must not contain actual/expected', test => {
  const t = new metatests.ImperativeTest('Failing test', t => t.fail('msg'));
  t.on('done', () => {
    test.strictSame(t.results[0].type, 'fail');
    test.strictSame(t.results[0].message, 'msg');
    test.assertNot(t.results[0].hasOwnProperty('actual'));
    test.assertNot(t.results[0].hasOwnProperty('expected'));
    test.end();
  });
});

metatests.test('\'pass\' result must not contain actual/expected', test => {
  const t = new metatests.ImperativeTest('Pass test', t => {
    t.pass('msg');
    t.end();
  });
  t.on('done', () => {
    test.strictSame(t.results[0].type, 'pass');
    test.strictSame(t.results[0].message, 'msg');
    test.assertNot(t.results[0].hasOwnProperty('actual'));
    test.assertNot(t.results[0].hasOwnProperty('expected'));
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
    test.strictSame(t.results[0].message,
      'function \'name\' was called 0 time(s) but ' +
      'was expected to be called 1 time(s)');
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

metatests.test('must support mustNotCall (fail)', test => {
  const t = new metatests.ImperativeTest('mustNotCall test', t => {
    const fn = t.mustNotCall(() => {}, 'name');
    fn();
    t.end();
  });
  t.on('done', () => {
    test.assertNot(t.results[0].success);
    test.strictSame(t.results[0].type, 'mustNotCall');
    test.strictSame(t.results[0].message,
      'function \'name\' was called 1 time(s) but ' +
      'was not expected to be called at all');
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
  new metatests.ImperativeTest('mustNotCall test', t => {
    const wrapped = t.mustNotCall(() => 42);
    test.strictSame(wrapped(), 42);
    test.end();
  }, { async: false });
});
