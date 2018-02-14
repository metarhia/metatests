'use strict';

const maojian = require('..');

const baseFunction = callback => {
  setTimeout(callback, 1000);
};

const twiceLongFunction = callback => {
  setTimeout(callback, 2000);
};

maojian.speed('Speed test', [[
  baseFunction,
  twiceLongFunction
]], {
  count: 100000,
  MAX_ANOMALY_PERCENT: 1,
  versions: ['8.0.0', '7.0', '9']
});
