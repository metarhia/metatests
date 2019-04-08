'use strict';

const metatests = require('..');

metatests.test('must correctly report plan after timeout', test => {
  const t = metatests.test('async test immediate end');

  t.on('done', () => {
    test.assert(t.metadata.time < 100);
    test.end();
  });

  t.strictSame(1, 1);
  t.end();
});
