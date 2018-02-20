'use strict';

class TimeCollector {
  constructor(count, EXTRA_PERCENT = 5, BUFFER_SIZE = 100) {
    this.count = count > 100 ? count : 100;
    this.EXTRA_PERCENT = EXTRA_PERCENT > 50 ? 50 : EXTRA_PERCENT;
    this.BUFFER_SIZE = BUFFER_SIZE > 100 ? BUFFER_SIZE : 100;
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
        }
      }
    };
    this[type](func, testParams);
  }

  findAnomaly(testParams) {
    const sumTime = testParams.buffer.reduce((sum, time) => sum + time);
    if (!this.EXTRA_PERCENT) {
      testParams.functionTime += sumTime;
      return;
    }
    const bufferSize = testParams.buffer.length;
    const average = sumTime / bufferSize;
    const sumOfSquares = testParams.buffer.reduce((sum, time) => {
      const res = Math.pow((time - average), 2) / bufferSize;
      return res + sum;
    }, 0);
    const coef = (Math.sqrt(sumOfSquares) * 3) / Math.sqrt(bufferSize);
    let totalTime = 0;
    let anomalyTime = 0;
    let anomalyCount = 0;
    testParams.buffer.forEach(time => {
      if (Math.abs(time - average) > coef) {
        anomalyCount++;
        anomalyTime += time;
      } else {
        totalTime += time;
      }
    });
    const percent = (anomalyCount / bufferSize) * 100;
    if (percent <= this.EXTRA_PERCENT && anomalyCount) {
      testParams.anomalyCount += anomalyCount;
      testParams.anomalyTime += anomalyTime;
      totalTime += anomalyCount * average;
    } else {
      totalTime += anomalyTime;
    }
    testParams.functionTime += totalTime;
    testParams.buffer = [];
  }

  getTimeSyncFunc(func, testParams) {
    const results = [];
    for (let i = 0; i < this.count; i++) {
      const begin = process.hrtime();
      results[i] = func();
      const end = process.hrtime(begin);
      testParams.add(end[0] * 1e9 + end[1]);
    }
    if (testParams.buffer.length) this.findAnomaly(testParams);
    this.makeResults(testParams);
    return results;
  }

  getTimeAsyncFunc(func, testParams) {
    let done = 0;
    const funcWithTestCb = (begin, ...args) => {
      func(...args, () => {
        const end = process.hrtime(begin);
        testParams.add(end[0] * 1e9 + end[1]);
        if (++done === this.count) {
          if (testParams.buffer.length) this.findAnomaly(testParams);
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

module.exports = TimeCollector;
