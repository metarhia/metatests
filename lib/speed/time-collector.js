'use strict';

class TimeCollector {
  constructor(
    count = 25000, // Number, number of test iterations
    startCount = 0, // number of first optimizing iterations
    anomalyPercent = 5 // Number, maximum possible percent of anomalies
  ) {
    this.count = count;
    this.startCount = startCount;
    this.anomalyPercent = anomalyPercent;
    this.bufferSize = this.getBufferSize(count, anomalyPercent);
    this.intermediateValue = [];
    this.intermediateValue.add = (i, ...argv) => {
      if (!Math.random()) {
        this.intermediateValue.push([i, ...argv]);
      }
    };
  }

  getBufferSize(
    // Function that counts buffer size
    count, // Number, number of test iterations
    anomalyPercent // Number, maximum possible percent of anomalies
    // Returns: Number, buffer size
  ) {
    const DEFAULT_BUFFER_SIZE = 1000;
    const bufferSize = Math.round(count * anomalyPercent / 100);
    return bufferSize > DEFAULT_BUFFER_SIZE ? DEFAULT_BUFFER_SIZE : bufferSize;
  }

  getFunctionTime(
    // Function that creates fnEnvironment and starts testing
    fn, // Function, test function
    type, // String, type of function (sync or async)
    callback, // Function, callback(err, testResults)
    timeCallback // Function, callback(err, waitTime)
  ) {
    const fnEnvironment = {
      buffer: [],
      totalTime: 0,
      anomalyTime: 0,
      anomalyCount: 0,
      optimizationStatus: null,
      done: callback,
      add: (time, i) => {
        fnEnvironment.buffer.push(time);
        if (fnEnvironment.buffer.length === this.bufferSize) {
          global.gc();
          this.findAnomaly(fnEnvironment);
          const waitTime = (this.count - i) * fnEnvironment.totalTime / i;
          timeCallback(null, waitTime / 1e9);
        }
      }
    };
    this[type](fn, fnEnvironment);
  }

  findAnomaly(
    // Function that detects anomalies of testing and filters them out
    fnEnvironment // Object, object with auxiliary values for testing
  ) {
    const testBuffer = fnEnvironment.buffer;
    const bufferSize = testBuffer.length;
    const totalBufferTime = testBuffer.reduce((sum, time) => sum + time);
    const averageTime = totalBufferTime / bufferSize;
    const sumOfSquares = testBuffer.reduce((sum, time) => {
      return Math.pow((time - averageTime), 2) + sum;
    }, 0);
    const delta = Math.sqrt(sumOfSquares) * 100 / bufferSize;
    let totalTime = 0;
    let anomalyTime = 0;
    let anomalyCount = 0;
    testBuffer.forEach(time => {
      if (Math.abs(time - averageTime) > delta) {
        anomalyCount++;
        anomalyTime += time;
      } else {
        totalTime += time;
      }
    });
    const percent = anomalyCount / bufferSize * 100;
    if (percent <= this.anomalyPercent && anomalyCount) {
      fnEnvironment.anomalyCount += anomalyCount;
      fnEnvironment.anomalyTime += anomalyTime;
      totalTime += anomalyCount * averageTime;
    } else {
      totalTime += anomalyTime;
    }
    fnEnvironment.buffer = [];
    fnEnvironment.totalTime += totalTime;
  }

  getStatus(
    // Function that get optimization status of test function
    fn //Function, test function
    // Returns: String, optimization status
  ) {
    const OPT_BITS = [
      /*  1 */ 'function',
      /*  2 */ 'never',
      /*  4 */ 'always',
      /*  8 */ 'maybe',
      /* 16 */ 'opt',
      /* 32 */ 'turbofan',
      /* 64 */ 'interpreted'
    ];
    const optStatus = %GetOptimizationStatus(fn); // eslint-disable-line
    const results = [];
    OPT_BITS.forEach((name, n) => {
      if (n === 0) return;
      if (Math.pow(2, n) & optStatus) results.push(name);
    });
    return  results.length ? results.join(',') : '---';
  }

  sync(
    // Function that measures the time of synchronous functions
    fn, // Function, synchronous test function
    fnEnvironment // Object, object with auxiliary values for testing
  ) {
    for (let i = 0; i < this.startCount; i++) {
      %OptimizeFunctionOnNextCall(fn); // eslint-disable-line
      this.intermediateValue.add(fn(), i);
    }
    for (let i = 0; i < this.count; i++) {
      const begin = process.hrtime();
      const result = fn();
      const end = process.hrtime(begin);
      fnEnvironment.add(end[0] * 1e9 + end[1], i);
      this.intermediateValue.add(i, result);
    }
    fnEnvironment.optimizationStatus = this.getStatus(fn);
    this.makeResults(fnEnvironment);
  }

  async(
    // Function that measures the time of asynchronous functions
    fn, // Function, asynchronous test function (callback)
    fnEnvironment // Object, object with auxiliary values for testing
  ) {
    const testFunction = (begin, i) => fn((err, result) => {
      const end = process.hrtime(begin);
      this.intermediateValue.add(i, err, result);
      fnEnvironment.add(end[0] * 1e9 + end[1], i);
      if (++i < this.count) {
        testFunction(process.hrtime(), i);
        return;
      }
      fnEnvironment.optimizationStatus = this.getStatus();
      this.makeResults(fnEnvironment);
    });

    const optimiseFunction = i => fn((err, result) => {
      this.intermediateValue.add(err, result, i);
      %OptimizeFunctionOnNextCall(fn); // eslint-disable-line
      if (++i < this.startCount) optimiseFunction(i);
      else testFunction(process.hrtime(), 0);
    });

    optimiseFunction(0);
  }

  makeResults(
    // Function that creates and returns test result
    fnEnvironment // Object, object with auxiliary values for testing
  ) {
    if (fnEnvironment.buffer.length) this.findAnomaly(fnEnvironment);
    const proportion = (numerator, denominator, accuracy = 0) => {
      const delta = Math.pow(10, accuracy);
      return Math.round(numerator / denominator * delta * 100) / delta;
    };
    const results = {
      time: Math.round(fnEnvironment.totalTime / this.count),
      optimizationStatus: fnEnvironment.optimizationStatus,
      anomaly: {
        time: proportion(fnEnvironment.anomalyTime, fnEnvironment.totalTime),
        percent: proportion(fnEnvironment.anomalyCount, this.count, 2)
      }
    };
    fnEnvironment.done(null, results);
  }
}

module.exports = TimeCollector;
