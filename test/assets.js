'use strict';

const { ImperativeTest } = require('..');

const test = new ImperativeTest('Slave test');
test.pass('Passing test');
test.end();
