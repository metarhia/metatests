'use strict';

const maojian = require('..');

const baseFunction = callback => {
  setTimeout(callback, 1000);
};

const twiceLongFunction = callback => {
  setTimeout(callback, 2000);
};

maojian.speed('Speed test', module, 1000, [], [
  baseFunction,
  twiceLongFunction
], ['8.0.0', '7.0', '9']);
