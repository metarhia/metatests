'use strict';

const assert = require('assert');
const { equal, strictEqual } = require('../lib/compare');

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

assert(equal([,,,], [,,,]));
assert(!equal([,,,], [,,,,,]));

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
