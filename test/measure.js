'use strict';

const { iter } = require('@metarhia/common');
const metatests = require('..');

const objectCreate = p => {
  const obj = {};
  obj.hello = 'world';
  obj.custom = p;
  return obj;
};

const eq = metatests.strictEqual;

metatests.testSync('Verify that metatests.measure works', test => {
  const cases = [
    { fn: objectCreate, argCases: [['a'], ['b']], n: 1e3 },
    { fn: objectCreate, name: 'hello' },
  ];
  const actualFromListener = {
    preflight: [],
    run: [],
    cycle: [],
    done: [],
    finish: [],
  };
  const putToArr = name => (...args) => actualFromListener[name].push(args);
  const listener = {
    preflight: test.mustCall(putToArr('preflight'), 3),
    run: test.mustCall(putToArr('run'), 3),
    cycle: test.mustCall(putToArr('cycle'), 3),
    done: test.mustCall(putToArr('done'), 3),
    finish: test.mustCall(putToArr('finish')),
  };

  const expectedResults = [
    {
      result: {
        hello: 'world',
        custom: 'a',
      },
      args: ['a'],
      count: 1e3,
      name: 'objectCreate',
    },
    {
      result: {
        hello: 'world',
        custom: 'b',
      },
      args: ['b'],
      count: 1e3,
      name: 'objectCreate',
    },
    {
      result: {
        hello: 'world',
        custom: undefined,
      },
      args: [],
      count: 1e2,
      name: 'hello',
    },
  ];

  const actual = metatests.measure(cases, {
    defaultCount: 1e2,
    preflight: 1,
    runs: 1,
    listener,
  });

  test.contains(actualFromListener, {
    preflight: [
      ['objectCreate', 1e4, ['a']],
      ['objectCreate', 1e4, ['b']],
      ['hello', 1e4, undefined],
    ],
    run: [
      ['objectCreate', 1e3, ['a']],
      ['objectCreate', 1e3, ['b']],
      ['hello', 1e2, undefined],
    ],
  });

  iter(expectedResults)
    .zip(actual)
    .forEach(([expected, actual]) => {
      test.contains(actual, expected);
    });
  iter(expectedResults)
    .zip(actualFromListener.finish[0][0])
    .forEach(([expected, actual]) => {
      test.contains(actual, expected);
    });

  iter(expectedResults)
    .zip(iter(actualFromListener.cycle.map(r => r[1])))
    .forEach(([expected, actual]) => {
      test.contains(actual, expected);
    });

  iter([
    { name: 'objectCreate', args: ['a'] },
    { name: 'objectCreate', args: ['b'] },
    { name: 'hello', args: undefined },
  ]).forEach(target => {
    const expected = expectedResults.filter(
      r => r.name === target.name && eq(r.args, target.args)
    );
    const actual = actualFromListener.done.find(
      a => a[0] === target.name && eq(a[1], target.args)
    )[2];
    iter(expected)
      .zip(actual)
      .forEach(([expected, actual]) => {
        test.contains(actual, expected);
      });
  });
});
