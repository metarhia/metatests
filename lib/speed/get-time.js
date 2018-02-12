'use strict';

class TimeCollector {
  constructor(count, EXTRA_RATIO = 1, EXTRA_PERCENT = 10, BUFFER_SIZE = 10) {
    this.EXTRA_PERCENT = EXTRA_PERCENT > 50 ? 50 : EXTRA_PERCENT;
    const minSize = Math.ceil(100 / EXTRA_PERCENT);
    this.count = count <= minSize ? minSize : count;
    this.BUFFER_SIZE = BUFFER_SIZE <= minSize ? minSize : BUFFER_SIZE;
    this.EXTRA_RATIO = EXTRA_RATIO < 1 ? 1 : EXTRA_RATIO;
    this.sync = this.getTimeSyncFunc;
    this.async = this.getTimeAsyncFunc;
  }

  getfunctionTime(func, type, callback) {
    const testParams = {
      buffer: [],
      functionTime: 0,
      anomalyTime: 0,
      anomalyCount: 0,
      done: callback,
      add: time => {
        testParams.buffer.push(time);
        if (testParams.buffer.length === this.BUFFER_SIZE) {
          this.findAnomaly(testParams);
          testParams.buffer = [];
        }
      }
    };
    this[type](func, testParams);
  }

  findAnomaly(testParams) {
    let average = 0;
    let totalTime = 0;
    let anomalyTime = 0;
    let anomalyCount = 0;
    const sortBuffer = testParams.buffer.sort((a, b) => a - b);
    sortBuffer.forEach((time, number) => {
      average = totalTime / (number + 1);
      if (number && (time / average) >= this.EXTRA_RATIO) {
        anomalyCount++;
        anomalyTime += time;
      } else totalTime += time;
    });
    const percent = (anomalyCount / sortBuffer.length) * 100;
    if (percent <= this.EXTRA_PERCENT && anomalyCount) {
      testParams.anomalyCount += anomalyCount;
      testParams.anomalyTime += anomalyTime;
      totalTime += anomalyCount * average;
    } else totalTime += anomalyTime;
    testParams.functionTime += totalTime;
  }

  getTimeSyncFunc(func, testParams) {
    const results = [];
    for (let i = 0; i < this.count; i++) {
      const begin = process.hrtime();
      results[i] = func();
      const end = process.hrtime(begin);
      testParams.add(end[0] * 1e9 + end[1]);
    }
    this.findAnomaly(testParams);
    this.makeResults(testParams);
  }

  getTimeAsyncFunc(func, testParams) {
    const result = [];
    const funcWithTestCb = (begin, ...args) => {
      func(...args, () => {
        const end = process.hrtime(begin);
        testParams.add(end[0] * 1e9 + end[1]);
        result.push(end);
        if (result.length === this.count) {
          this.findAnomaly(testParams);
          this.makeResults(testParams);
        }
      });
    };
    for (let i = 0; i < this.count; i++) {
      funcWithTestCb(process.hrtime());
    }
  }

  makeResults(testParams) {
    const getPercent = (numerator, denominator, accuracy = 0) => {
      const coef = Math.pow(10, accuracy);
      return (Math.round((numerator / denominator) * coef * 100) / coef);
    };
    const results = {
      time: Math.round(testParams.functionTime / this.count),
      anPercent: getPercent(testParams.anomalyCount, this.count, 2),
      anTime: getPercent(testParams.anomalyTime, testParams.functionTime)
    };
    testParams.done(null, results);
  }
}


process.on('message', request => {
  const { name, count, type, path } = request;
  const func = require(path)[name];

  const collector = new TimeCollector(count, 3);
  collector.getfunctionTime(func, type, (err, res) => {
    res.name = func.name;
    process.send(res);
    process.exit();
  });
});
