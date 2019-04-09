'use strict';

if (process.version.slice(1).split('.')[0] < 11) {
  return;
}

const metatests = require('..');
// eslint-disable-next-line import/no-unresolved
const { Worker, isMainThread } = require('worker_threads');

if (isMainThread) {
  metatests.test('must not fail on require in worker_threads', test => {
    const w = new Worker(__filename);
    w.on('exit', () => {
      test.end();
    });
  });
}
