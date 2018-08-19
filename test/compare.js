'use strict';

const assert = require('assert');

const { equal, strictEqual } = require('..');

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

assert(equal([,,,], [,,,])); // eslint-disable-line
assert(!equal([,,,], [,,,,,])); // eslint-disable-line

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

assert(strictEqual([,,,], [,,,])); // eslint-disable-line
assert(!strictEqual([,,,], [,,,,,])); // eslint-disable-line

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
