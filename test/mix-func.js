'use strict';

const speed = require('../lib/speed');

const baseFunctionAsync = callback => {
  setTimeout(callback, 100);
};

const twiceLongFunctionAsync = callback => {
  setTimeout(callback, 200);
};

const baseFunctionSync = () => {
  let a;
  for (let i = 0; i < 100000; i++) {
    a = i + a;
  }
  return a;
};

const twiceLongFunctionSync = () => {
  let a;
  for (let i = 0; i < 200000; i++) {
    a = i + a;
  }
  return a;
};

speed('Speed test', 10000, [
  baseFunctionSync,
  twiceLongFunctionSync
], [
  baseFunctionAsync,
  twiceLongFunctionAsync
]);
