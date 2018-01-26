'use strict';

const speed = require('../lib/speed');

const baseFunction = callback => {
  setTimeout(callback, 1000);
};

const twiceLongFunction = callback => {
  setTimeout(callback, 2000);
};

speed('Speed test', 1000, [], [
  baseFunction,
  twiceLongFunction
]);
