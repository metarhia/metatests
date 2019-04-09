'use strict';

if (process.version.slice(1).split('.')[0] < 11) {
  return;
}

const metatests = require('..');
// eslint-disable-next-line import/no-unresolved
const { Worker, isMainThread } = require('worker_threads');

if (isMainThread) {
  metatests.test('must support tests in worker_threads', test => {
    // stdout: true to avoid unnecessary output
    const w = new Worker(__filename, { stdout: true });
    w.on('exit', () => {
      test.end();
    });
  });
} else {
  metatests.test('in worker test', test => {
    test.strictSame(1, 1);
    test.end();
  });
}
