'use strict';

const assert = require('node:assert');
const {
  runner: { Runner },
} = require('../..');

const runner = new Runner();
runner.finished = true;
runner.finish = () => {
  assert(false, 'must not call runner.finish');
};
runner._tryFinish();
