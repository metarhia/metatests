'use strict';

const {
  test,
  testSync,
  runner: { Runner },
} = require('..');

test('runner must not account todo as failure', test => {
  const runner = new Runner();
  runner.removeReporter();
  runner.runTodo();
  testSync('failing todo', test => test.fail(), { todo: true }, runner);
  runner.on('finish', hasFailures => {
    test.strictSame(hasFailures, false);
    test.end();
  });
});

test('runner support wait/resume (resume before test end)', test => {
  const runner = new Runner();
  runner.removeReporter();
  let resumeCalled = false;
  runner.on('finish', () => {
    test.strictSame(resumeCalled, true);
    test.end();
  });
  runner.wait();
  testSync('successful', () => {}, {}, runner);
  process.nextTick(() => {
    resumeCalled = true;
    runner.resume();
  });
});

test('runner support wait/resume (resume same tick with test end)', test => {
  const runner = new Runner();
  runner.removeReporter();
  let resumeCalled = false;
  runner.on('finish', () => {
    test.strictSame(resumeCalled, true);
    test.end();
  });
  runner.wait();
  const t = testSync('successful', () => {}, {}, runner);
  t.on('done', () => {
    resumeCalled = true;
    runner.resume();
  });
});

test('runner support wait/resume (resume after test end)', test => {
  const runner = new Runner();
  runner.removeReporter();
  let resumeCalled = false;
  runner.on('finish', () => {
    test.strictSame(resumeCalled, true);
    test.end();
  });
  runner.wait();
  const t = testSync('successful', () => {}, {}, runner);
  t.on('done', () =>
    setImmediate(() => {
      resumeCalled = true;
      runner.resume();
    })
  );
});
