'use strict';

const metasync = require('metasync');
const { fork } = require('child_process');
const getResult = require('./speed/get-result.js');

const PATH_TO_CHILD = __dirname + '/speed/get-time.js'; // Path to child process
let dc; // data collector, collect data from child processes

const makeRequest = (
  // Function whitch create request to child process
  func, // Function, function to be tested
  count, // number, number of iterations
  type, // string, 'sync' or 'async'
  path // string, path to file where was called function 'speed'
  // Returns: object, request to child process
) => {
  if (type !== 'sync' && type !== 'async') throw new Error('Invalid type');
  if (typeof(func) !== 'function') throw new Error(func + 'is not a function');
  return {
    typeOfReq: type,
    iterations: count,
    funcName: func.name,
    pathToBaseFile: path
  };
};

const getValues = (
// Object.value() for node 6.0.0
  obj // object
// Returns: array, array of values
) => {
  const res = [];
  let val;
  for (val in obj) res.push(obj[val]);
  return res;
};

const speed = (
  // Function witch manage processes of testing functions
  caption, // string, caption of test
  count, // number, number of iterations
  testsSync, // array of sync functions
  testsAsync // array of functions, callback-last
) => {
  let moduleRef = module; // ref to module where was called function 'speed'
  while (moduleRef.parent !== null) moduleRef = moduleRef.parent;

  const testArray = testsSync ? testsAsync ? testsAsync.concat(testsSync) :
    testsSync : testsAsync;

  if (process.argv[1] === PATH_TO_CHILD) {
    moduleRef = moduleRef.children[0];
    let func;
    for (func of testArray) moduleRef.exports[func.name] = func;
    return;
  }
  const path = moduleRef.filename;

  dc = metasync.collect(testArray.length);
  dc.done(() => {
    getResult(getValues(dc.data), caption, count);
    process.exit();
  });

  if (testsSync) {
    testsSync.forEach((func) => {
      const forked = fork(PATH_TO_CHILD);
      const obj = makeRequest(func, count, 'sync', path);
      forked.send(obj);
      forked.on('message', (msg) => dc.pick(func.name, msg));
    });
  }

  if (testsAsync) {
    testsAsync.forEach((func) => {
      const forked = fork(PATH_TO_CHILD);
      const obj = makeRequest(func, count, 'async', path);
      forked.send(obj);
      forked.on('message', (msg) => dc.pick(func.name, msg));
    });
  }
};

module.exports = speed;
