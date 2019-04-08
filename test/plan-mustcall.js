'use strict';

const { test } = require('../');

test('must support test.plan + test.mustCall', test => {
  test.plan(4);

  test.strictSame(1, 1);
  setImmediate(() => {
    test.pass('one');
  });

  setImmediate(
    test.mustCall(() => {
      test.pass('two');
    })
  );
});

test('must support test.plan + test.mustNotCall', test => {
  test.plan(4);

  test.strictSame(1, 1);
  test.mustNotCall(() => {
    test.pass('none');
  });

  setImmediate(
    test.mustCall(() => {
      test.pass('one');
    })
  );
});
