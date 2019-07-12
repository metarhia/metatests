'use strict';

const escapeRegex = str => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

let nodeutil = null;
try {
  nodeutil = require('util');
} catch (e) {
  // ignore
}

let path = null;
try {
  path = require('path');
} catch (e) {
  // ignore
}

let packageDir = null;
let packageRegex = null;
if (path) {
  packageDir = path.basename(path.join(__dirname, '..'));
  packageRegex = new RegExp(
    escapeRegex(`${path.sep}${packageDir}${path.sep}lib${path.sep}`) +
      '.*(test|compare)\\.js'
  );
}

const inspect = nodeutil
  ? val => nodeutil.inspect(val, { depth: null, sorted: true, compact: false })
  : val => JSON.stringify(val, null, 2);

const format = nodeutil
  ? (...args) => nodeutil.format(...args)
  : (...args) =>
      args.map(a => (typeof a === 'string' ? a : inspect(a))).join(' ');

const isPromise = val => val && val[Symbol.toStringTag] === 'Promise';

const compareValues = (a, b) => {
  if (a < b) return -1;
  if (a > b) return 1;
  return 0;
};

const compareFirstKey = ([a], [b]) => compareValues(a, b);

module.exports = {
  inspect,
  format,
  packageDir,
  packageRegex,
  isPromise,
  compareValues,
  compareFirstKey,
  escapeRegex,
};
