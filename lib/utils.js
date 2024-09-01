'use strict';

const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

let nodeutil = null;
try {
  nodeutil = require('util');
} catch {
  // ignore
}

let path = null;
try {
  path = require('path');
} catch {
  // ignore
}

let packageDir = null;
let packageRegex = null;
if (path) {
  packageDir = path.basename(path.join(__dirname, '..'));
  packageRegex = new RegExp(
    escapeRegex(`${path.sep}${packageDir}${path.sep}lib${path.sep}`) +
      '.*(test|compare)\\.js',
  );
}

const inspect = nodeutil
  ? (val) =>
      nodeutil.inspect(val, { depth: null, sorted: true, compact: false })
  : (val) => JSON.stringify(val, null, 2);

const format = nodeutil
  ? (...args) => nodeutil.format(...args)
  : (...args) =>
      args.map((a) => (typeof a === 'string' ? a : inspect(a))).join(' ');

const isPromise = (val) => val && val[Symbol.toStringTag] === 'Promise';

const isDate = (val) => Object.prototype.toString.call(val) === '[object Date]';

const isRegExp = (val) =>
  Object.prototype.toString.call(val) === '[object RegExp]';

const isError = (val) =>
  Object.prototype.toString.call(val) === '[object Error]';

const compareValues = (a, b) => {
  if (a < b) return -1;
  if (a > b) return 1;
  return 0;
};

const compareFirstKey = ([a], [b]) => compareValues(a, b);

const roundTo = (num, decimals) => {
  const c = 10 ** decimals;
  return Math.round(num * c) / c;
};

const sum = (reducable) => reducable.reduce((acc, v) => acc + v, 0);

const transformToObject = (source, sort) => {
  const constructorName = source.constructor && source.constructor.name;
  if (constructorName === 'Object' || !source[Symbol.iterator]) {
    return source;
  }
  const res = {};
  if (source instanceof Map) {
    for (const [key, v] of source) {
      res[key] = v;
    }
  } else {
    const values = [...source[Symbol.iterator]()];
    if (sort) {
      values.sort(typeof sort === 'function' ? sort : undefined);
    }
    for (const key in values) {
      res[key] = values[key];
    }
  }
  return res;
};

const transformToArray = (source) => {
  if (Array.isArray(source)) return source;
  return source[Symbol.iterator]
    ? [...source[Symbol.iterator]()]
    : Object.entries(source);
};

module.exports = {
  inspect,
  format,
  packageDir,
  packageRegex,
  isPromise,
  isDate,
  isRegExp,
  isError,
  compareValues,
  compareFirstKey,
  escapeRegex,
  roundTo,
  sum,
  transformToObject,
  transformToArray,
};
