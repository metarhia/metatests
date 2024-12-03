'use strict';

const declarativeTest = require('./lib/declarative-test.js');
const { equal, strictEqual } = require('./lib/compare.js');
const reporters = require('./lib/report.js');
const runner = require('./lib/runner.js');
const { speed, measure, convertToCsv } = require('./lib/speed.js');
const {
  ImperativeTest,
  test,
  testSync,
  testAsync,
} = require('./lib/imperative-test.js');

const metatests = {
  case: declarativeTest.case,
  DeclarativeTest: declarativeTest.DeclarativeTest,
  equal,
  strictEqual,
  reporters,
  runner,
  speed,
  measure,
  convertToCsv,
  ImperativeTest,
  test,
  testSync,
  testAsync,
};

module.exports = metatests;
