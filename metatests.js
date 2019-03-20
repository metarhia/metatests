'use strict';

const declarativeTest = require('./lib/declarative-test');
const { equal, strictEqual } = require('./lib/compare');
const reporters = require('./lib/report');
const runner = require('./lib/runner');
const { speed } = require('./lib/speed.js');
const {
  ImperativeTest,
  test,
  testSync,
  testAsync,
} = require('./lib/imperative-test');

const metatests = {
  case: declarativeTest.case,
  DeclarativeTest: declarativeTest.DeclarativeTest,
  equal,
  strictEqual,
  reporters,
  runner,
  speed,
  ImperativeTest,
  test,
  testSync,
  testAsync,
};

module.exports = metatests;
