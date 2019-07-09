'use strict';

const assert = require('assert');
const { ImperativeTest } = require('../../metatests');

const test = new ImperativeTest('test', null, { dependentSubtests: true });

test.testSync('successful subtest', t => t.pass());
const st2 = test.testSync('failing subtest', t => t.fail());
const st3 = test.testSync('successful subtest', t => t.pass());

let bailoutCalled = false;

test.bailout = msg => {
  bailoutCalled = true;
  assert.strictEqual(msg, `Dependent subtest failure: ${st2.id}/${st2.title}`);
  st3._end();
  test._end();
};

process.on('exit', () => {
  assert(bailoutCalled, 'bailout must be called');
});
