'use strict';

const path = require('node:path');
const assert = require('node:assert');
const cp = require('node:child_process');

const fixturesDir = path.join(__dirname, '..', 'fixtures');

['imperative.test-dependent.js', 'imperative.test-with-runner.js'].forEach(
  (name) => {
    const sp = cp.fork(path.join(fixturesDir, name), {
      stdio: 'ignore',
    });

    sp.on('exit', (code) => {
      assert.equal(code, 0, `must not exit with error: ${name}`);
    });
  },
);
