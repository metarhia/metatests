'use strict';

const assert = require('assert');
const { ImperativeTest } = require('../../metatests');

const test = new ImperativeTest('', null, { timeout: 1000 });
test.on('done', () => {
  assert.deepStrictEqual(test.results, []);
});
setTimeout(() => test.end());
