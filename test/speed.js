'use strict';

const { fork } = require('child_process');
const path = require('path');
const metatests = require('..');

const fixturesDir = path.join(__dirname, 'fixtures');

metatests.test('Verify that metatests.speed works', test => {
  const cp = fork(path.resolve(fixturesDir, 'speed.js'), { silent: true });
  let data = '';
  cp.stdout.on('data', c => {
    data += c.toString();
  });
  cp.stdout.on('end', () => {
    test.log(data);
    test.regex(/Benchmark example/, data);
    test.ok(/objectCreate\s+\d+ns\s+min\s+[\d.]+\s+ops\/s/.test(data));
    test.end();
  });
  cp.on('exit', code => {
    test.strictSame(code, 0);
  });
});
