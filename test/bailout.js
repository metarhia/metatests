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
    test.end();
  });
});
