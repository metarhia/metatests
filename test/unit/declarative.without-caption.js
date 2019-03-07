'use strict';

const assert = require('assert');
const { DeclarativeTest } = require('../..');

const namespace = {
  inc: a => ++a,
  dec: a => --a,
};
const test = new DeclarativeTest(
  '',
  { namespace },
  {
    'namespace.inc': [[1, 2]],
    'namespace.dec': [[1, 0]],
  }
);
test.on('done', () => {
  const [incResult, decResult] = test.results;
  assert.strictEqual(incResult.caption, 'case test failed');
  assert.strictEqual(incResult.actual, '2');
  assert.strictEqual(incResult.expected, '2');
  assert.strictEqual(incResult.message, 'function namespace.inc(1)');
  assert.strictEqual(decResult.actual, '0');
  assert.strictEqual(decResult.expected, '0');
  assert.strictEqual(decResult.message, 'function namespace.dec(1)');
});
