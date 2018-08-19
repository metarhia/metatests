'use strict';

const { ImperativeTest } = require('..');
const test = new ImperativeTest('Slave test');

const fail = process.argv[2] === 'f';

if (fail) {
  test.fail('Failing test');
} else {
  test.pass('Passing test');
}

test.end();
