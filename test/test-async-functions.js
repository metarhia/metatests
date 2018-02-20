'use strict';

const maojian = require('..');

const baseFunction = callback => {
  setTimeout(callback, 1000);
};

const twiceAsLongFunction = callback => {
  setTimeout(callback, 2000);
};

maojian.speed('Speed test', [[
  baseFunction,
  twiceAsLongFunction
]], {
  count: 100000,
  MAX_ANOMALY_PERCENT: 1,
  versions: ['8.0.0', '7.0', '9']
});
