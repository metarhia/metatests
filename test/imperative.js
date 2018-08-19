'use strict';

const metatests = require('..');

metatests.testSync('strictSame', (test) => {
  test.strictSame(1, 1);
});

metatests.testSync('assert', (test) => {
  test.assert(1);
});

metatests.testSync('assertNot', (test) => {
  test.assertNot(0);
});

metatests.testSync('same', (test) => {
  test.same(1, '1');
});

metatests.testSync('error', (test) => {
  test.error({}, 'that\'s ok');
});

metatests.testSync('type', (test) => {
  test.type(new Date(), 'Date');
  test.type(new Date(), 'object');
});

metatests.testAsync('sequential tests 1', (test) => {
  setTimeout(() => {
    test.ok(true);
    test.end();
  }, 1000);
});

metatests.testSync('sequential, must be possible to call end', (test) => {
  test.end();
});

metatests.test('test plan', (test) => {
  test.plan(2);
  test.type(new Date(), 'Date');
  test.type(new Date(), 'object');
});

metatests.test('test must be async', (test) => {
  // this will throw if test is sync as it will end it on nextTick
  setTimeout(() => test.end(), 100);
});

metatests.testSync('test sync explicit', (test) => {
  let i = 0;
  test.strictSame(++i, 1);
  test.testSync('nested sync explicit', (test) => {
    test.strictSame(++i, 2);
  });
});

metatests.test('nested test', (t1) => {
  t1.strictSame(123, 123);
  t1.endAfterSubtests();
  t1.test('Delayed subtest', (t2) => {
    process.nextTick(() => {
      t2.strictSame(123, 123);
      t2.end();
    });
  });
});

metatests.testAsync('nested test that ends after each subtest', (t1) => {
  let i = 0;
  t1.strictSame(++i, 1);
  t1.testSync('sequential subtest', (t2) => {
    t2.strictSame(++i, 2);
  });
  setTimeout(() => {
    t1.strictSame(++i, 3);
    t1.endAfterSubtests();
  }, 2);
  t1.testAsync('delayed subtest', (t3) => {
    setTimeout(() => {
      t3.strictSame(++i, 4);
      t3.end();
    }, 100);
  });
});

metatests.testSync('todo must not fail', (test) => {
  test.strictSame(13, 42);
}, { todo: true });

metatests.testSync('test nested parallel', (test) => {
  let i = 0;
  test.strictSame(++i, 1);
  test.testSync('nested parallel 1', test => test.strictSame(++i, 2));
  test.testSync('nested parallel 2', test => test.strictSame(++i, 3));
  test.testSync('nested parallel 3', test => test.strictSame(++i, 4));
  setTimeout(() => {
    if (!test.done) test.fail('Parallel subtests must run in parallel');
  }, 1);
}, { parallelSubtests: true });

metatests.testSync('beforeEach', (test) => {
  let i = 0;
  test.beforeEach((t, callback) => {
    i = 42;
    callback();
  });
  test.testSync(t => t.strictSame(i, 42));
});

metatests.testSync('passes options context', (test) => {
  const context = { a: 'a', b: 'b', c: 'c' };
  test.testSync('check passed args',
    (t, args) => t.strictSame(args, context),
    { context });
});

metatests.testSync('beforeEach parameters', (test) => {
  const context = { a: 'a', b: 'b', c: 'c' };
  test.beforeEach((t, callback) => callback(context));
  test.testSync((t, args) => t.strictSame(args, context));
});

metatests.test('afterEach', (test) => {
  test.plan(3);
  let i = 0;
  test.afterEach((t, callback) => {
    test.pass('must call afterEach');
    i = 42;
    callback();
  });
  test.testSync(() => {
    test.pass('must call test');
    i = 13;
  });
  setTimeout(() => {
    test.strictSame(i, 42);
  }, 1);
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

metatests.testSync('throw with empty error', (test) => {
  test.throws(() => { throw new Error(); });
});

metatests.testSync('throw with message error', (test) => {
  const message = 'message';
  test.throws(() => { throw new Error(message); }, new Error(message));
});

metatests.testSync('throw with type error (compare to Error)', (test) => {
  const message = 'message';
  test.throws(() => { throw new TypeError(message); }, new Error(message));
});

metatests.testSync('isError no error provided', (test) => {
  const actual = new Error();
  test.isError(actual);
});

metatests.testSync('isError with error provided', (test) => {
  const actual = new TypeError();
  test.isError(actual, new TypeError());
});
