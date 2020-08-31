'use strict';

const { fork } = require('child_process');
const path = require('path');

const { test } = require('../metatests');

const cliFile = path.join(__dirname, '..', 'bin', 'cli.js');
const fixturesDir = path.join(__dirname, 'fixtures');

test('must support cjs extension files', test => {
  const cjsFile = path.join(fixturesDir, 'test-extension.cjs');
  const cp = fork(cliFile, [cjsFile], { stdio: 'pipe' });
  let data = '';
  cp.stdout.on('data', chunk => {
    data += chunk.toString();
  });
  cp.on('close', code => {
    test.log(data);
    test.regex(/must support CJS extension/, data);
    test.strictSame(code, 0);
    test.end();
  });
});

test('must support mjs extension files', test => {
  const mjsFile = path.join(fixturesDir, 'test-extension.mjs');
  const cp = fork(cliFile, [mjsFile], { stdio: 'pipe' });
  let data = '';
  cp.stdout.on('data', chunk => {
    data += chunk.toString();
  });
  cp.on('close', code => {
    test.regex(/must support MJS extension/, data);
    test.strictSame(code, 0);
    test.end();
  });
});
