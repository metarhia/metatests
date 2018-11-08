'use strict';

const { test, testSync, runner: { Runner } } = require('..');

test('runner must not account todo as failure', test => {
  const runner = new Runner();
  runner.removeReporter();
  runner.runTodo();
  testSync(
    'failing todo',
    test => test.fail(),
    { todo: true },
    runner
  );
  runner.on('finish', hasFailures => {
    test.strictSame(hasFailures, false);
    test.end();
  });
});
