'use strict';

let sumExtraCount = 0;
let sumExtraTime = 0;

const anomalyCollector = (resultTime) => {
  const EXTRA_PERCENT = 10;
  const EXTRA_RATIO = 5;
  const sortTime = resultTime.sort((a, b) => a - b);
  let totalTime = 0;
  let extraTime = 0;
  let average = 0;
  let extraCount = 0;
  sortTime.forEach((time, number) => {
    average = totalTime / (number + 1);
    if (totalTime && (time / average) >= EXTRA_RATIO) {
      extraCount++;
      extraTime += time;
    } else totalTime += time;
  });
  const percent = (extraCount / resultTime.length) * 100;
  if (percent <= EXTRA_PERCENT && extraCount > 0) {
    sumExtraCount += extraCount;
    sumExtraTime += extraTime;
    totalTime += extraCount * average;
  } else totalTime += extraTime;
  return totalTime;
};

const testSyncFunc = (
  // Function which test synchronous function
  func, // Function, synchronous function
  count // number, number of iterations
) => {
  let sum = 0;
  let values = [];
  const BUFFER_SIZE = 10;
  const results = [];
  for (let i = 0; i < count; i++) {
    const begin = process.hrtime();
    results[i] = func();
    const end = process.hrtime(begin);
    values.push(end[0] * 1e9 + end[1]);
    if (values.length === BUFFER_SIZE) {
      sum += anomalyCollector(values);
      values = [];
    }
  }
  process.send(
    {
      name: func.name,
      time: sum / count,
      anomalyPercent: Math.round((sumExtraCount / count) * 10000) / 100,
      anomalyTime: Math.round((sumExtraTime / sum) * 100)
    });
  process.exit();
};

const testAsyncFunc = (
  // Function which test asynchronous function
  func, // Function, function to be tested
  count // number, number of iterations
) => {
  const result = [];
  let i;
  let sum = 0;
  let values = [];
  const funcWithTestCb = (begin, ...args) => {
    func(...args, () => {
      const end = process.hrtime(begin);
      values.push(end[0] * 1e9 + end[1]);
      if (values.length === 10) {
        sum += anomalyCollector(values);
        values = [];
      }
      result.push(end);
      if (result.length === count) {
        process.send(
          {
            name: func.name,
            time: sum / count,
            anomalyPercent: Math.round((sumExtraCount / count) * 10000) / 100,
            anomalyTime: Math.round((sumExtraTime / sum) * 100)
          });
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
