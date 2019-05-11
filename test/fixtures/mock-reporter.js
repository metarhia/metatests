'use strict';

const {
  reporters: { Reporter },
} = require('../..');

module.exports = class MockReporter extends Reporter {
  record() {}

  error() {}

  finish() {}

  log() {}
};
