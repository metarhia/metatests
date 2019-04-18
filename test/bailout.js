'use strict';

const metatests = require('..');

metatests.test('must support bailout', test => {
  const t = new metatests.ImperativeTest('bailout test', t => {
    t.bailout();
    test.fail('must not be called');
    test.end();
  });
  t.on('done', () => {
    test.strictSame(t.success, false);
    test.strictSame(t.results.length, 1);
    test.end();
  });
});

metatests.test('must support bailout message', test => {
  const message = 'message';
  const t = new metatests.ImperativeTest('bailout test', t => {
    t.bailout(message);
  });
  t.on('done', () => {
    test.strictSame(t.success, false);
    test.strictSame(t.results[0].type, 'bailout');
    test.strictSame(t.results[0].message, 'message');
    test.end();
  });
});

metatests.test('must correctly define error message', test => {
  const message = 'error';
  const t = new metatests.ImperativeTest(
    "test.bailout must treat 'err' as message if 'string' is passed",
    t => t.bailout(message)
  );
  t.on('done', () => {
    test.strictSame(t.success, false);
    test.strictSame(t.results[0].type, 'bailout');
    test.strictSame(t.results[0].message, 'error');
    test.end();
  });
});

metatests.test('must support bailout error', test => {
  const error = new Error('err');
  const t = new metatests.ImperativeTest('bailout test', t => {
    t.bailout(error);
  });
  t.on('done', () => {
    test.strictSame(t.success, false);
    test.strictSame(t.results[0].type, 'bailout');
    test.strictSame(t.results[0].message, error.toString());
    test.strictSame(t.results[0].stack, error.stack);
    test.end();
  });
});

metatests.test('must support bailout message and error', test => {
  const message = 'message';
  const error = new Error('err');
  const t = new metatests.ImperativeTest('bailout test', t => {
    t.bailout(error, message);
  });
  t.on('done', () => {
    const expectedMessage = `${message}\n${error.toString()}`;
    test.strictSame(t.success, false);
    test.strictSame(t.results[0].type, 'bailout');
    test.strictSame(t.results[0].message, expectedMessage);
    test.strictSame(t.results[0].stack, error.stack);
    test.end();
  });
});
