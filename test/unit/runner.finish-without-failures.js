'use strict';

const assert = require('assert');
const {
  runner: { Runner },
} = require('../..');

const runner = new Runner();
let reporterFinishCalled = false;
runner.reporter.finish = () => {
  reporterFinishCalled = true;
};
runner.finish();
assert(reporterFinishCalled, 'must call reporter.finish');
