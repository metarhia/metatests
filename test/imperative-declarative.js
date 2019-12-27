'use strict';

const { test, ImperativeTest } = require('..');

const f1 = x => x * 2;

const namespace = { f1 };

test('nested successful case', test => {
  let nestedDeclarative = null;
  const t = new ImperativeTest('parent', test => {
    t.endAfterSubtests();
    nestedDeclarative = test.case('declarative', namespace, {
      f1: [
        [1, 2],
        [2, 4],
        [3, 6],
      ],
    });
  });
  t.on('done', () => {
    test.assert(t.success);
    test.assert(t.results[0].success);
    test.strictSame(t.results[0].type, 'subtest');
    test.type(t.results[0].test, 'DeclarativeTest');
    test.strictSame(t.results[0].test, nestedDeclarative);
    test.end();
  });
});

test('nested failing case', test => {
  let nestedDeclarative = null;
  const t = new ImperativeTest('parent', test => {
    t.endAfterSubtests();
    nestedDeclarative = test.case('declarative', namespace, {
      f1: [[1, 1]],
    });
  });
  t.on('done', () => {
    test.assertNot(t.success);
    test.assertNot(t.results[0].success);
    test.strictSame(t.results[0].type, 'subtest');
    test.type(t.results[0].test, 'DeclarativeTest');
    test.strictSame(t.results[0].test, nestedDeclarative);
    test.end();
  });
});
