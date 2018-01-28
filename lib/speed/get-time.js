'use strict';

const getTimeSync = (
  // Function witch test sync function
  func, // Function, function to be tested
  count, // number, number of iterations
  name // string, name of function
) => {
  const result = [];
  let i, time = 0;
  for (i = 0; i < count; i++) {
    const begin = process.hrtime();
    result.push(func());
    const end = process.hrtime(begin);
    time += end[0] * 1e9 + end[1];
  }
  process.send({ name, time });
};

const getTimeAsync = (
  // Function witch test sync function
  func, // Function, function to be tested
  count, // number, number of iterations
  name // string, name of function
) => {
  const result = [];
  let i, time = 0;
  const partFunc = (begin, ...args) => {
    func(...args, () => {
      const end = process.hrtime(begin);
      time += end[0] * 1e9 + end[1];
      result.push(end);
      if (result.length === count) process.send({ name, time });
    });
  };
  for (i = 0; i < count; i++) {
    partFunc(process.hrtime());
  }
};

process.on('message', msg => {
  const { name, count, type, path } = msg;
  const func = require(path)[name];
  if (type === 'sync') getTimeSync(func, count, name);
  else if (type === 'async') getTimeAsync(func, count, name);
});
