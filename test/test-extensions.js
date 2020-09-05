'use strict';

const { fork } = require('child_process');
const path = require('path');

const { test } = require('../metatests');

const cliFile = path.join(__dirname, '..', 'bin', 'cli.js');
const fixturesDir = path.join(__dirname, 'fixtures');

test('must support cjs extension files', test => {
  test.plan(2);
  const cjsFile = path.join(fixturesDir, 'test-extension.cjs');
  const cp = fork(cliFile, [cjsFile], { stdio: 'pipe' });
  let data = '';
  cp.stdout.on('data', chunk => {
    data += chunk.toString();
  });
  let errData = '';
  cp.stderr.on('data', chunk => {
    errData += chunk.toString();
  });
  cp.stdout.on('end', () => {
    test.log(errData);
    test.regex(/must support CJS extension/, data);
  });
  cp.on('close', code => {
    test.strictSame(code, 0);
  });
});

const [semverMajor, semverMinor] = process.version
  .slice(1)
  .split('.')
  .map(Number);
const supportsESM =
  (semverMajor === 12 && semverMinor >= 17) ||
  (semverMajor === 13 && semverMinor >= 2) ||
  semverMajor >= 14;

if (supportsESM) {
  test('must support mjs extension files', test => {
    test.plan(2);
    const mjsFile = path.join(fixturesDir, 'test-extension.mjs');
    const cp = fork(cliFile, [mjsFile], { stdio: 'pipe' });
    let data = '';
    cp.stdout.on('data', chunk => {
      data += chunk.toString();
    });
    let errData = '';
    cp.stderr.on('data', chunk => {
      errData += chunk.toString();
    });
    cp.stdout.on('end', () => {
      test.log(errData);
      test.regex(/must support MJS extension/, data);
    });
    cp.on('exit', code => {
      test.strictSame(code, 0);
    });
  });
}
