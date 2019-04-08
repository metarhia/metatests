'use strict';

const { test, ImperativeTest } = require('..');

test('must correctly report plan after timeout', test => {
  const t = new ImperativeTest(
    t => {
      t.plan(1);
    },
    { timeout: 300 }
  );
  t.on('done', () => {
    test.strictSame(t.results, [
      {
        actual: 0,
        expected: 1,
        message: "Expected to pass 'plan' (1) number of asserts",
        success: false,
        type: 'test',
      },
      {
        message: 'Test execution time exceed timeout (300)',
        success: false,
        type: 'timeout',
      },
    ]);
    test.end();
  });
});
