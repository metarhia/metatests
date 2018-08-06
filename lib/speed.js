'use strict';

const path = require('path');
const { fork } = require('child_process');
const makeResults = require('./speed/create-results.js');

const PATH_TO_GET_TIME = path.join(__dirname, '/speed/get-time.js');

const defaultOptions = {
  count: 25000, // number of test iterations
  startCount: 0, // number of first optimizing iterations
  anomalyPercent: 5 // maximum possible percent of anomalies
};

const prepareRequests = (
  // Function that prepares requests to child processes
  syncFunctions, // Array of synchronous functions
  asyncFunctions // Array of asynchronous functions, callback-last
  // Returns: Array, array of requests
) => {
  const requests = [];
  syncFunctions.forEach(fn => requests.push([fn.name, 'sync']));
  asyncFunctions.forEach(fn => requests.push([fn.name, 'async']));
  return requests;
};

const exportsFunctions = (
  // Function that adds test function to module.exports
  syncFunctions, // Array of synchronous functions
  asyncFunctions // Array of asynchronous functions, callback-last
) => {
  const childProcessExports = module.parent.parent.exports;
  syncFunctions.forEach(fn => { childProcessExports[fn.name] = fn; });
  asyncFunctions.forEach(fn => { childProcessExports[fn.name] = fn; });
};

const speed = (
  // Function that manages the process of testing functions
  caption, // String, caption of test
  testFunctions, // Array, sync functions and array of async functions
  config = {} // Object, config (count, anomalyPercent, startCount)
) => {
  const syncFunctions = []; // Array of synchronous functions
  const asyncFunctions = []; // Array of asynchronous functions, callback-last
  testFunctions.forEach(value => {
    if (typeof(value) === 'function') syncFunctions.push(value);
    else value.forEach(fn => asyncFunctions.push(fn));
  });

  if (process.argv[1] === PATH_TO_GET_TIME) { // start only from child process
    exportsFunctions(syncFunctions, asyncFunctions);
    return;
  }

  for (const option in defaultOptions) {
    if (config[option] === undefined) config[option] = defaultOptions[option];
  }

  const results = []; // results of all functions
  const requests = prepareRequests(syncFunctions, asyncFunctions);
  config.testFile = module.parent.parent.filename;

  const sendRequest = (
    fnName, // String, name of test function
    fnType // String, 'sync' or 'async'
  ) => {
    const forked = fork(PATH_TO_GET_TIME, {
      execArgv: ['--expose-gc', '--allow-natives-syntax']
    });
    forked.send(Object.assign(config, { fnName, fnType }));
    forked.on('message', result => {
      results.push(Object.assign(result, { fnName }));
      if (requests.length) sendRequest(...requests.pop());
      else makeResults(results, caption, config.count);
    });
  };
  sendRequest(...requests.pop());
};

module.exports = (metatests) => {
  metatests.speed = speed;
};
