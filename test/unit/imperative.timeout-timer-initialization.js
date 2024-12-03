'use strict';

const assert = require('node:assert');
const { ImperativeTest } = require('../../metatests.js');

const Timeout = setTimeout(() => {}).constructor;

const test = new ImperativeTest();
assert(test.timeoutTimer instanceof Timeout, 'imperative test timeout timer');
test.end();
