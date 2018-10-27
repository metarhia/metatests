'use strict';

const metatests = require('../');
const { spawn } = require('child_process');

const test = metatests.test('must not fail when reporter is null');

if (process.argv[2] === 'child-success') {
  metatests.runner.instance.removeReporter();
  test.strictSame(1 + 1, 2);
  test.end();
} else if (process.argv[2] === 'child-failure') {
  metatests.runner.instance.removeReporter();
  test.strictSame(1 + 1, 2);
  test.end();
  // intentional end-after-end to test runner for this case
  test.end();
  metatests.runner.instance.on('finish', hasFailures => {
    // this test must succeed if test has 'error' - the above end-after-end
    process.exit(!hasFailures);
  });
} else {
  test.plan(2);
  ['child-success', 'child-failure'].forEach(name => {
    const child = spawn(process.execPath, [__filename, name], {
      stdio: 'inherit',
    });
    child.on('exit', code => {
      test.strictSame(code, 0, `must not fail for ${name}`);
    });
  });
}
