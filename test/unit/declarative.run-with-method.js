'use strict';

const assert = require('assert');
const { DeclarativeTest } = require('../..');

class CustomClass {
  // eslint-disable-next-line class-methods-use-this
  bufferify(string) {
    return Buffer.from(string);
  }
}
const namespace = { CustomClass };
const test = new DeclarativeTest('method', namespace, {
  'CustomClass.prototype.bufferify': [
    [
      new CustomClass(),
      '__DATA__',
      result => Buffer.from('__DATA__').equals(result),
    ],
  ],
});
test.on('done', () => {
  const [result] = test.results;
  assert.strictEqual(result.caption, 'method');
  assert.strictEqual(result.type, 'declarative');
  assert.strictEqual(result.success, true);
  assert.strictEqual(result.actual, '__DATA__');
  assert.strictEqual(result.expected, 'function');
  assert.strictEqual(
    result.message,
    'method of CustomClass: {}.bufferify("__DATA__")'
  );
});
