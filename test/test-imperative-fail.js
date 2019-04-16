'use strict';

const metatests = require('..');

metatests.test('must support test.fail()', test => {
  const t = new metatests.ImperativeTest('Failing test', t => {
    t.fail('msg');
    t.end();
  });
  t.on('done', () => {
    test.strictSame(t.results[0].type, 'fail');
    test.strictSame(t.results[0].message, 'msg');
    test.strictSame(t.results[0].actual, undefined);
    test.strictSame(t.results[0].expected, undefined);
    test.end();
  });
});

metatests.test('must support test.fail(msg, err)', test => {
  const err = new Error('error');
  const t = new metatests.ImperativeTest('Failing test', t => {
    t.fail('msg', err);
    t.end();
  });
  t.on('done', () => {
    test.strictSame(t.results[0].type, 'fail');
    test.strictSame(t.results[0].message, 'msg');
    test.strictSame(t.results[0].actual, err);
    test.strictSame(t.results[0].expected, undefined);
    test.end();
  });
});

metatests.test('must support test.fail(err)', test => {
  const err = new Error('error');
  const t = new metatests.ImperativeTest('Failing test', t => {
    t.fail(err);
    t.end();
  });
  t.on('done', () => {
    test.strictSame(t.results[0].type, 'fail');
    test.strictSame(t.results[0].actual, err);
    test.strictSame(t.results[0].message, undefined);
    test.strictSame(t.results[0].expected, undefined);
    test.end();
  });
});
