'use strict';

const {
  runner: { Runner },
} = require('../../metatests.js');

const runner = new Runner();
runner.removeReporter();
runner.hasFailures = true;
runner.finish();
