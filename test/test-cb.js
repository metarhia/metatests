'use strict';

const { test, ImperativeTest } = require('..');

test('test.cb with message', test => {
  const message = 'hello';
  const t = new ImperativeTest('cb test', t => {
    const cb = t.cb(message);
    cb(null);
    t.end();
  });
  t.on('done', () => {
    test.assert(t.success);
    test.end();
  });
});

test('test.cb with message and callback', test => {
  const message = 'hello';
  const t = new ImperativeTest('cb test', t => {
    const cb = t.cb(message, test.mustCall());
    cb(null);
    t.end();
  });
  t.on('done', () => {
    test.assert(t.success);
    test.end();
  });
});

test('test.cb must assert mustCall', test => {
  const t = new ImperativeTest('cb test', t => {
    t.cb();
    t.end();
  });
  t.on('done', () => {
    const res = t.results[0];
    test.assertNot(t.success);
    test.strictSame(res.type, 'mustCall');
    test.strictSame(res.expected, 1);
    test.strictSame(res.actual, 0);
    test.end();
  });
});

test('test.cb must forward error', test => {
  const message = 'hello';
  const t = new ImperativeTest('cb test', t => {
    const error = new Error('err');
    const cb = t.cb(
      message,
      test.mustCall(err => {
        test.isError(err, error);
        t.end();
      })
    );
    cb(error);
  });
  t.on('done', () => {
    test.assertNot(t.success);
    test.end();
  });
});

test('test.cb must forward results', test => {
  const t = new ImperativeTest('cb test', t => {
    const data = [1, 2, 3];
    const cb = t.cb(
      test.mustCall((err, ...res) => {
        test.error(err);
        test.strictSame(res, data);
        t.end();
      })
    );
    cb(null, ...data);
  });
  t.on('done', () => {
    test.assert(t.success);
    test.end();
  });
});

test('test.cbFail must support message', test => {
  const fail = 'hello';
  const err = new Error();
  const t = new ImperativeTest('cbFail test', t => {
    const cb = t.cbFail(fail, test.mustNotCall());
    cb(err);
  });
  t.on('done', () => {
    test.assertNot(t.success);
    test.strictSame(t.results[0].type, 'fail');
    test.strictSame(t.results[0].message, fail);
    test.strictSame(t.results[0].actual, err);
    test.end();
  });
});

test('test.cbFail must assert mustCall', test => {
  const t = new ImperativeTest('cbFail test', t => {
    t.cbFail();
    t.end();
  });
  t.on('done', () => {
    const res = t.results[0];
    test.assertNot(t.success);
    test.strictSame(res.type, 'mustCall');
    test.strictSame(res.expected, 1);
    test.strictSame(res.actual, 0);
    test.end();
  });
});

test('test.cbFail must forward results', test => {
  const data = [1, 2, 3];
  const t = new ImperativeTest('cbFail test', t => {
    const cb = t.cbFail(
      test.mustCall((...res) => {
        test.strictSame(res, data);
        t.end();
      })
    );
    cb(null, ...data);
  });
  t.on('done', () => {
    test.assert(t.success);
    test.end();
  });
});

test('test.cbFail must call afterAllCb on success', test => {
  const t = new ImperativeTest('cbFail test', t => {
    const cb = t.cbFail(test.mustCall(), err => {
      test.error(err);
      t.end();
    });
    cb(null);
  });
  t.on('done', () => {
    test.assert(t.success);
    test.end();
  });
});

test('test.cbFail must call afterAllCb on error', test => {
  const error = new Error('hello');
  new ImperativeTest('cbFail test', t => {
    const cb = t.cbFail(
      test.mustNotCall(),
      test.mustCall(err => {
        test.strictSame(err, error);
        test.assert(t.done);
        test.assertNot(t.success);
        test.end();
      })
    );
    cb(error);
  });
});
