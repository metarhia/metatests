'use strict';

const {
  runner: { Runner },
} = require('../../metatests');

const runner = new Runner();
runner.removeReporter();
runner.hasFailures = true;
runner.on('finish', () => {});
runner.finish();
