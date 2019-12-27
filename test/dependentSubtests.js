'use strict';

const metatests = require('..');

metatests.test('dependentSubtests and parallelSubtests are exclusive', test => {
  test.throws(() => {
    new metatests.ImperativeTest('throwing', () => {}, {
      parallelSubtests: true,
      dependentSubtests: true,
    });
  }, new Error('parallelSubtests and dependentSubtests are contradictory'));
  test.end();
});

metatests.test('must support dependentSubtests', test => {
  const t = new metatests.ImperativeTest(
    'mustNotCall test',
    t => {
      t.testSync(
        'successful subtest',
        test.mustCall(t => t.pass())
      );
      t.testSync(
        'failing subtest',
        test.mustCall(t => t.fail())
      );
      t.testSync(
        'successful subtest',
        test.mustNotCall(t => t.pass())
      );
    },
    { async: false, dependentSubtests: true }
  );
  t.on('done', () => {
    test.strictSame(t.success, false);
    test.end();
  });
});

metatests.test('must not crash on exception in dependentSubtests', test => {
  const t = new metatests.ImperativeTest(
    'parent test',
    t => {
      t.endAfterSubtests();
      t.test(
        'throwing subtest',
        test.mustCall(() => {
          setImmediate(() => {
            throw new Error();
          });
        })
      );
      t.testSync('successful subtest', test.mustNotCall());
    },
    { dependentSubtests: true }
  );
  t.on('done', () => {
    test.strictSame(t.success, false);
    test.end();
  });
});
