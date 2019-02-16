'use strict';

let nodeutil = null;
try {
  nodeutil = require('util');
} catch (e) {
  // ignore
}

const inspect = nodeutil
  ? val => nodeutil.inspect(val, { depth: null, sorted: true, compact: false })
  : val => JSON.stringify(val, null, 2);

const format = nodeutil
  ? (...args) => nodeutil.format(...args)
  : (...args) =>
      args.map(a => (typeof a === 'string' ? a : inspect(a))).join(' ');

module.exports = {
  inspect,
  format,
};
