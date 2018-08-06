'use strict';

const TimeCollector = require('./time-collector.js');

process.on('message', request => {
  const {
    fnName, // String, name of test function
    fnType, // String, type of test function (sync or async)
    testFile, // String, path to test file
    count, // Number, number of iterations
    anomalyPercent, // Number, maximum possible percent of anomalies
    startCount // Number, number of first optimizing iterations
  } = request;

  const testFunction = require(testFile)[fnName];

  const tc = new TimeCollector(count, startCount, anomalyPercent);
  tc.getFunctionTime(testFunction, fnType,
    (err, result) => {
      process.send(result);
      process.exit();
    },
    (err, time) => {});
});
