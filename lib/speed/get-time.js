'use strict';

const testSyncFunc = (
  // Function which test synchronous function
  func, // Function, synchronous function
  count // number, number of iterations
) => {
  const result = [];
  let i, time = 0;
  for (i = 0; i < count; i++) {
    const begin = process.hrtime();
    result.push(func());
    const end = process.hrtime(begin);
    time += end[0] * 1e9 + end[1];
  }
  process.send({ name: func.name, time });
  process.exit();
};

const testAsyncFunc = (
  // Function which test asynchronous function
  func, // Function, function to be tested
  count // number, number of iterations
) => {
  const result = [];
  let i, time = 0;
  const funcWithTestCb = (begin, ...args) => {
    func(...args, () => {
      const end = process.hrtime(begin);
      time += end[0] * 1e9 + end[1];
      result.push(end);
      if (result.length === count) {
        process.send({ name: func.name, time });
        process.exit();
      }
    });
  };
  for (i = 0; i < count; i++) {
    funcWithTestCb(process.hrtime());
  }
};

const testFunctions = {
  'sync': testSyncFunc,
  'async': testAsyncFunc
};

process.on('message', request => {
  const { name, count, type, path } = request;
  const func = require(path)[name];
  testFunctions[type](func, count);
});
