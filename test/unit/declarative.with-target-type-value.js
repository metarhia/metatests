'use strict';

const assert = require('assert');
const { DeclarativeTest } = require('../..');

const namespace = {
  string: '__STRING__',
  regexp: new RegExp('regexp'),
};
const test = new DeclarativeTest(
  "target type 'value'",
  { namespace },
  {
    'namespace.string': [['__STRING__']],
    'namespace.regexp': [[new RegExp('regexp')]],
  }
);
test.on('done', () => {
  const [stringTargetResult, regexpTargetResult] = test.results;
  assert.strictEqual(regexpTargetResult.actual, '"regexp"');
  assert.strictEqual(stringTargetResult.actual, '"__STRING__"');
  assert.strictEqual(stringTargetResult.message, 'value namespace.string');
});
