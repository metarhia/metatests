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

if (process.browser) {
  metatests.runner.instance.on('finish', () => {
    console.log('Tests finished. Waiting for unfinished tests after end...\n');
    setTimeout(() => {
      /* eslint-disable no-undef */
      __karma__.info({ total: 1 });
      __karma__.result({ success: !metatests.runner.hasFailures });
      __karma__.complete();
      /* eslint-enable */
    }, 5000);
  });
}

module.exports = metatests;
