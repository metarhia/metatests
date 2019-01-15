'use strict';

const assert = require('assert');
const cp = require('child_process');
const path = require('path');
const {
  runner: { Runner },
} = require('../..');

const fixturesDir = path.join(__dirname, '..', 'fixtures');

const runner = new Runner();
runner.removeReporter();

const st1 = cp.fork(path.join(fixturesDir, 'runner.exit-code-0.js'));
st1.on('exit', code => assert.strictEqual(code, 0));

const st2 = cp.fork(path.join(fixturesDir, 'runner.exit-code-1.js'));
st2.on('exit', code => assert.strictEqual(code, 1));
