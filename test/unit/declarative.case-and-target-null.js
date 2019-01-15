'use strict';

const assert = require('assert');
const { case: checkCase } = require('../..');

class CustomClass {}
const namespace = { CustomClass };
const runner = { addTest: () => {} };
const test = checkCase(
  'test case',
  namespace,
  {
    'CustomClass.prototype.someMethod': [[null, () => true]],
  },
  runner
);
test.on('done', () => {
  const [result] = test.results;
  assert.strictEqual(result.actual, 'null');
  assert.strictEqual(result.message, 'method of CustomClass: .someMethod()');
});
