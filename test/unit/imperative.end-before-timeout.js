'use strict';

const assert = require('node:assert');
const { ImperativeTest } = require('../../metatests.js');

const test = new ImperativeTest('', null, { timeout: 1000 });
test.on('done', () => {
  assert.deepStrictEqual(test.results, []);
});
setTimeout(() => test.end());
