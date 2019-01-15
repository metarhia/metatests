'use strict';

const assert = require('assert');
const {
  runner: { Runner },
} = require('../..');

const runner = new Runner();
runner.testsCount = 1;
runner.finish = () => {
  assert(false, 'must not call runner.finish');
};
runner._tryFinish();
runner.testsCount = 0;
