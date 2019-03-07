'use strict';

const assert = require('assert');
const { DeclarativeTest } = require('../..');

const namespace = {
  throwingFn: () => {
    throw new Error('throw from throwingFn');
  },
};
const test = new DeclarativeTest(
  'throwing',
  { namespace },
  { 'namespace.throwingFn': [[]] }
);
let testDone = false;
test.on('done', () => {
  testDone = true;
  const [result] = test.results;
  assert.strictEqual(result.type, 'unhandledException');
  assert.strictEqual(result.success, false);
  assert.strictEqual(result.message, 'throw from throwingFn');
});
setTimeout(() => assert(testDone, 'test must be done'), 1000);
