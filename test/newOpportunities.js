'use strict';

const maojian = require('..');

const baseFunction = callback => {
  setTimeout(callback, 1000);
};

const twiceLongFunction = callback => {
  setTimeout(callback, 2000);
};

maojian.speed('Speed test', 1000, [], [
  baseFunction,
  twiceLongFunction
], ['v8.0.0', 'v7.0.0', 'v9.4.0']);
