'use strict';

const assert = require('assert');

const {
  equal,
  strictEqual,
  errorCompare,
  sameTopology,
} = require('../../lib/compare');

assert(equal(1, 1));
assert(!equal(1, 2));

assert(equal(1, '1'));
assert(!equal(1, '2'));

assert(equal('1', 1));
assert(!equal('1', 2));

assert(equal('1', '1'));
assert(!equal('1', '2'));

assert(equal(true, true));
assert(!equal(true, false));

assert(equal(false, false));
assert(!equal(false, true));

assert(equal(null, null));
assert(!equal(null, 'null'));

assert(equal(undefined, undefined));
assert(!equal(undefined, 'undefined'));

assert(equal(NaN, NaN));
assert(!equal(NaN, 'NaN'));

assert(equal([], []));
assert(!equal([], '[]'));

assert(equal([1], [1]));
assert(!equal([1], ['2']));

assert(equal([1], ['1']));
assert(!equal([1], ['2']));

assert(equal(['1'], [1]));
assert(!equal(['1'], [2]));

assert(equal(['1'], ['1']));
assert(!equal(['1'], ['2']));

assert(equal([, , ,], [, , ,])); // eslint-disable-line
assert(!equal([, , ,], [, , , , ,])); // eslint-disable-line

assert(equal([1, 2, 3], [1, 2, 3]));
assert(!equal([1, 2, 3], [3, 2, 1]));

assert(equal([1, '2', 3], [1, 2, 3]));
assert(!equal([1, '2', 3], [1, 'A', 3]));

assert(equal([1, 2, 3], [1, '2', 3]));
assert(!equal([1, 2, 3], [1, 'A', 3]));

assert(equal([1, '2', 3], [1, '2', 3]));
assert(!equal([1, '2', 3], [1, 'A', 3]));

assert(equal([1, '1', 1.1], [1, '1', 1.1]));
assert(!equal([1, '1', 1.1], [1, '1', 1.2]));

assert(equal([true, false], [true, false]));
assert(!equal([true, false], [true, true]));

assert(equal([NaN, Infinity], [NaN, Infinity]));
assert(!equal([NaN, Infinity], [Infinity, NaN]));

assert(equal({ field: 'a' }, { field: 'a' }));
assert(!equal({}, { field: 'a' }));
assert(!equal({ field: 'a' }, {}));
assert(!equal({ field: 'a' }, { field: 'b' }));

assert(equal(null, null));
assert(!equal({}, null));
assert(!equal(null, {}));

assert(equal(new Map(), new Map()));
assert(equal(new Map([[1, 'a']]), new Map([[1, 'a']])));
assert(
  equal(
    new Map([
      [1, 'a'],
      [2, 'b'],
    ]),
    new Map([
      [1, 'a'],
      [2, 'b'],
    ])
  )
);
assert(
  !equal(
    new Map([
      [1, 'a'],
      [2, 'b'],
    ]),
    new Map([
      [2, 'b'],
      [1, 'a'],
    ])
  )
);
assert(
  !equal(
    new Map([[1, 'a']]),
    new Map([
      [2, 'b'],
      [1, 'a'],
    ])
  )
);
assert(
  !equal(
    new Map([
      [1, 'a'],
      [2, 'b'],
    ]),
    new Map([[1, 'a']])
  )
);
assert(
  !equal(
    new Map([
      [1, 'a'],
      [3, 'c'],
    ]),
    new Map([
      [1, 'a'],
      [2, 'b'],
    ])
  )
);

assert(equal(new Set(), new Set()));
assert(equal(new Set([1]), new Set([1])));
assert(equal(new Set([1, 2]), new Set([1, 2])));
assert(!equal(new Set([1, 2]), new Set([2, 1])));
assert(!equal(new Set([1, 2]), new Set([1])));
assert(!equal(new Set([1]), new Set([2])));

assert(
  equal(
    () => {},
    () => {}
  )
);
assert(
  equal(
    () => 3,
    () => 3
  )
);
assert(
  equal(
    a => a,
    a => a
  )
);
assert(
  equal(
    (a, b) => a + b,
    (a, b) => a + b
  )
);
assert(
  equal(
    (a, b) => {
      a += 3;
      return this.c + a + b;
    },
    (a, b) => {
      a += 3;
      return this.c + a + b;
    }
  )
);

const func = a => a;

assert(equal(func, func));
assert(!equal(console.log, console.dir));

assert(!equal(() => {}, null));
assert(
  !equal(
    () => {},
    a => ++a
  )
);
assert(!equal(JSON.stringify, () => {}));

assert(strictEqual(1, 1));
assert(!strictEqual(1, 2));

assert(!strictEqual(1, '1'));
assert(!strictEqual(1, '2'));

assert(!strictEqual('1', 1));
assert(!strictEqual('1', 2));

assert(strictEqual('1', '1'));
assert(!strictEqual('1', '2'));

assert(strictEqual(true, true));
assert(!strictEqual(true, false));

assert(strictEqual(false, false));
assert(!strictEqual(false, true));

assert(strictEqual(null, null));
assert(!strictEqual(null, 'null'));

assert(strictEqual(undefined, undefined));
assert(!strictEqual(undefined, 'undefined'));

assert(strictEqual(NaN, NaN));
assert(!strictEqual(NaN, 'NaN'));

assert(strictEqual([], []));
assert(!strictEqual([], '[]'));

assert(strictEqual([1], [1]));
assert(!strictEqual([1], ['2']));

assert(!strictEqual([1], ['1']));
assert(!strictEqual([1], ['2']));

assert(!strictEqual(['1'], [1]));
assert(!strictEqual(['1'], [2]));

assert(strictEqual(['1'], ['1']));
assert(!strictEqual(['1'], ['2']));

assert(strictEqual([, , ,], [, , ,])); // eslint-disable-line
assert(!strictEqual([, , ,], [, , , , ,])); // eslint-disable-line

assert(strictEqual([1, 2, 3], [1, 2, 3]));
assert(!strictEqual([1, 2, 3], [3, 2, 1]));

assert(!strictEqual([1, '2', 3], [1, 2, 3]));
assert(!strictEqual([1, '2', 3], [1, 'A', 3]));

assert(!strictEqual([1, 2, 3], [1, '2', 3]));
assert(!strictEqual([1, 2, 3], [1, 'A', 3]));

assert(strictEqual([1, '2', 3], [1, '2', 3]));
assert(!strictEqual([1, '2', 3], [1, 'A', 3]));

assert(strictEqual([1, '1', 1.1], [1, '1', 1.1]));
assert(!strictEqual([1, '1', 1.1], [1, '1', 1.2]));

assert(strictEqual([true, false], [true, false]));
assert(!strictEqual([true, false], [true, true]));

assert(strictEqual([NaN, Infinity], [NaN, Infinity]));
assert(!strictEqual([NaN, Infinity], [Infinity, NaN]));

assert(
  strictEqual(
    () => {},
    () => {}
  )
);
assert(
  strictEqual(
    () => 3,
    () => 3
  )
);
assert(
  strictEqual(
    a => a,
    a => a
  )
);
assert(
  strictEqual(
    (a, b) => a + b,
    (a, b) => a + b
  )
);
assert(
  strictEqual(
    (a, b) => {
      a += 3;
      return this.c + a + b;
    },
    (a, b) => {
      a += 3;
      return this.c + a + b;
    }
  )
);
assert(strictEqual(func, func));
assert(!strictEqual(console.log, console.dir));

assert(strictEqual({ field: 1 }, { field: 1 }));
assert(!strictEqual({}, { field: 'a' }));
assert(!strictEqual({ field: 'a' }, {}));
assert(!strictEqual({ field: 1 }, { field: '1' }));

assert(strictEqual(new Map(), new Map()));
assert(strictEqual(new Map([[1, 'a']]), new Map([[1, 'a']])));
assert(
  strictEqual(
    new Map([
      [1, 'a'],
      [2, 'b'],
    ]),
    new Map([
      [1, 'a'],
      [2, 'b'],
    ])
  )
);
assert(
  !strictEqual(
    new Map([
      [1, 'a'],
      [2, 'b'],
    ]),
    new Map([
      [2, 'b'],
      [1, 'a'],
    ])
  )
);
assert(
  !strictEqual(
    new Map([[1, 'a']]),
    new Map([
      [2, 'b'],
      [1, 'a'],
    ])
  )
);
assert(
  !strictEqual(
    new Map([
      [1, 'a'],
      [2, 'b'],
    ]),
    new Map([[1, 'a']])
  )
);
assert(
  !strictEqual(
    new Map([
      [1, 'a'],
      [3, 'c'],
    ]),
    new Map([
      [1, 'a'],
      [2, 'b'],
    ])
  )
);

assert(strictEqual(new Set(), new Set()));
assert(strictEqual(new Set([1]), new Set([1])));
assert(strictEqual(new Set([1, 2]), new Set([1, 2])));
assert(!strictEqual(new Set([1, 2]), new Set([2, 1])));
assert(!strictEqual(new Set([1, 2]), new Set([1])));
assert(!strictEqual(new Set([1]), new Set([2])));

assert(strictEqual(null, null));
assert(!strictEqual({}, null));
assert(!strictEqual(null, {}));

assert(errorCompare(new Error(), new Error()));
assert(!errorCompare(new Error(), ''));

assert(errorCompare(new Error('message'), new Error()));
assert(errorCompare(new Error('message'), new Error('message')));
assert(!errorCompare(new Error('message'), new Error('another message')));
assert(!errorCompare(new Error(), new Error('message')));

assert(!equal({}, () => {}));
assert(!equal([1, 2, 3], { 0: 1, 1: 2, 2: 3 }));

assert(!strictEqual({}, () => {}));
assert(!strictEqual([1, 2, 3], { 0: 1, 1: 2, 2: 3, length: 3 }));

assert(!equal(Symbol('name'), Symbol('name')));
assert(!strictEqual(Symbol('name'), Symbol('name')));

{
  const obj1 = { data: 1, subObj: {} };
  const obj2 = { data: 1, subObj: {} };

  obj1.self = obj1;
  obj2.self = obj2;

  obj1.subObj.self = obj1.subObj;
  obj2.subObj.self = obj2.subObj;

  obj1.ref = obj2;
  obj2.ref = obj1;

  assert(sameTopology(obj1, obj2));
}

{
  const obj1 = { data: 1, subObj: {} };
  const obj2 = { data: 1, subObj: {} };

  obj1.self = obj1;
  obj2.self = obj2;

  obj1.subObj.self = obj1.subObj;
  obj2.subObj.self = obj2.subObj;

  obj1.ref = obj1;
  obj2.ref = obj1;

  assert(!sameTopology(obj1, obj2));
}
