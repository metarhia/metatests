'use strict';

const metatests = require('..');
const { compareValues } = require('../lib/utils');

const test = metatests.testSync('test.contains/containsGreedy', null, {
  parallelSubtests: true,
});

const checkResult = (test, res, type, subObj, actual, success = true) => {
  test.strictSame(res.type, type, 'type');
  test.strictSame(res.expected, subObj, 'expected');
  test.strictSame(res.actual, actual, 'actual');
  test.strictSame(res.success, success, 'success');
};

[
  {
    msg: 'objects',
    subObj: {
      type: 'resolves',
      message: 'must resolve',
      actual: 42,
    },
    actual: base => ({ ...base, success: false }),
  },
  {
    msg: 'objects sort',
    subObj: { a: 1, b: '41', c: true },
    actual: base => ({ d: 41, e: 'a', ...base, z: 42 }),
    sort: false,
  },
  {
    msg: 'objects sort fn',
    subObj: { x: 1, y: '41', z: true },
    actual: base => ({ d: 41, e: 'a', ...base, a: 42 }),
    sort: (a, b) => -compareValues(a, b),
  },
  {
    msg: 'arrays',
    subObj: ['r', 'm r', 42],
    actual: base => [...base, 1, 2],
    expectedRes: { 0: 'r', 1: 'm r', 2: 42 },
    actualRes: { 0: 'r', 1: 'm r', 2: 42, 3: 1, 4: 2 },
  },
  {
    msg: 'arrays sort',
    subObj: [42, 'a', 'b'],
    actual: () => ['x', 'a', 'b', 42, 'z'],
    expectedRes: { 0: 42, 1: 'a', 2: 'b' },
    actualRes: { 0: 42, 1: 'a', 2: 'b', 3: 'x', 4: 'z' },
    sort: true,
  },
  {
    msg: 'arrays sort fn',
    subObj: ['a', 'b', 'x', 42],
    actual: () => ['x', 'a', 'b', 42, 'z'],
    expectedRes: { 0: 'a', 1: 'b', 2: 'x', 3: 42 },
    actualRes: { 0: 'a', 1: 'b', 2: 'x', 3: 42, 4: 'z' },
    sort: (a, b) => compareValues(a, b),
  },
  {
    msg: 'sets',
    subObj: new Set(['r', 'm r', 42]),
    actual: base => new Set([...base, 1, 2]),
    expectedRes: { 0: 'r', 1: 'm r', 2: 42 },
    actualRes: { 0: 'r', 1: 'm r', 2: 42, 3: 1, 4: 2 },
  },
  {
    msg: 'sets-different-order',
    inverse: true,
    sort: true,
    subObj: new Set(['r', 'm r', 42, { a: 42 }]),
    actual: () => new Set(['m r', { a: 42 }, 'r', 42]),
    expectedRes: { 0: 42, 1: { a: 42 }, 2: 'm r', 3: 'r' },
    actualRes: { 0: 42, 1: { a: 42 }, 2: 'm r', 3: 'r' },
  },
  {
    msg: 'sets sort',
    subObj: new Set([42, 'a', 'b']),
    actual: () => new Set(['x', 'a', 'b', 42, 'z']),
    expectedRes: { 0: 42, 1: 'a', 2: 'b' },
    actualRes: { 0: 42, 1: 'a', 2: 'b', 3: 'x', 4: 'z' },
    sort: true,
  },
  {
    msg: 'sets sort fn',
    subObj: new Set(['a', 'b', 'x', 42]),
    actual: () => new Set(['x', 'a', 'b', 42, 'z']),
    expectedRes: { 0: 'a', 1: 'b', 2: 'x', 3: 42 },
    actualRes: { 0: 'a', 1: 'b', 2: 'x', 3: 42, 4: 'z' },
    sort: (a, b) => compareValues(a, b),
  },
  {
    msg: 'map',
    subObj: new Map([
      ['a', 42],
      ['b', 13],
      ['d', 66],
    ]),
    actual: base => new Map([['c', 55], ...base, [1, 2], ['z', 99]]),
    expectedRes: { a: 42, b: 13, d: 66 },
    actualRes: { c: 55, a: 42, b: 13, d: 66, 1: 2, z: 99 },
  },
  {
    msg: 'map-different-order',
    inverse: true,
    subObj: new Map([
      ['a', 42],
      ['b', 13],
      ['d', 66],
    ]),
    actual: () =>
      new Map([
        ['b', 13],
        ['d', 66],
        ['a', 42],
      ]),
    expectedRes: { a: 42, b: 13, d: 66 },
    actualRes: { a: 42, b: 13, d: 66 },
  },
  {
    msg: 'object-map',
    subObj: new Map([
      ['a', 42],
      ['b', 13],
      ['c', 33],
    ]),
    actual: () => ({ a: 42, b: 13, c: 33, d: 66, z: 99 }),
    expectedRes: { a: 42, b: 13, c: 33 },
  },
  {
    msg: 'map-object',
    subObj: { a: 42, b: 13, c: 33 },
    actual: () =>
      new Map([
        ['a', 42],
        ['b', 13],
        ['c', 33],
        ['d', 66],
        ['z', 99],
      ]),
    actualRes: { a: 42, b: 13, c: 33, d: 66, z: 99 },
  },
  {
    msg: 'array-set',
    subObj: new Set([42, 'a', 'b']),
    actual: () => [42, 'a', 'b', 'z'],
    expectedRes: { 0: 42, 1: 'a', 2: 'b' },
    actualRes: { 0: 42, 1: 'a', 2: 'b', 3: 'z' },
  },
  {
    msg: 'set-array',
    subObj: [42, 'a', 'b'],
    actual: base => new Set([...base, 'z']),
    expectedRes: { 0: 42, 1: 'a', 2: 'b' },
    actualRes: { 0: 42, 1: 'a', 2: 'b', 3: 'z' },
  },
].forEach(({ msg, inverse, subObj, actual, sort, expectedRes, actualRes }) => {
  actual = actual(subObj);

  test.testSync('test.contains ' + msg, t => {
    t.contains(actual, subObj, null, sort);
    checkResult(
      t,
      t.results[0],
      'contains',
      expectedRes || subObj,
      actualRes || actual
    );
  });

  test.testSync('test.contains negative ' + msg, t => {
    const sub = new metatests.ImperativeTest();
    sub.contains(subObj, actual, null, sort);
    sub.end();
    t.log(sub.results[0]);
    checkResult(
      t,
      sub.results[0],
      'contains',
      actualRes || actual,
      expectedRes || subObj,
      !!inverse
    );
  });

  test.testSync('test.containsGreedy ' + msg, t => {
    t.containsGreedy(actual, subObj);
    checkResult(t, t.results[0], 'containsGreedy', subObj, actual);
  });

  test.testSync('test.containsGreedy negative ' + msg, t => {
    const sub = new metatests.ImperativeTest();
    sub.containsGreedy(subObj, actual);
    sub.end();
    t.log(sub.results[0]);
    checkResult(t, sub.results[0], 'containsGreedy', actual, subObj, !!inverse);
  });
});

metatests.testSync('test.containsGreedy arrays', test => {
  const subObj = ['resolves', 'must resolve', 42];
  const actual = [false, ...subObj, 'hello'];
  test.containsGreedy(actual, subObj);
  checkResult(test, test.results[0], 'containsGreedy', subObj, actual);
});
