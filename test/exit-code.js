'use strict';

const cp = require('child_process');
const path = require('path');

const metatests = require('..');

metatests.test('exit code of a passing test must be 0', test => {
  const subtest = cp.fork(path.join(__dirname, 'assets'), [], {
    stdio: 'ignore',
  });

  subtest.on('exit', code => {
    test.equal(code, 0);
    test.end();
  });

  subtest.on('error', error => {
    test.bailout(error.toString());
  });
});
