'use strict';

const assert = require('assert');
const { ImperativeTest } = require('../../metatests');

const Timeout = setTimeout(() => {}).constructor;

const test = new ImperativeTest();
assert(test.timeoutTimer instanceof Timeout, 'imperative test timeout timer');
test.end();
