'use strict';

const metasync = require('metasync');
const { fork } = require('child_process');
const getResult = require('./speed/get-result.js');

const PATH_TO_CHILD = __dirname + '/speed/get-time.js';
let dc;

const makeRequest = (func, count, type, path) => {
  if (type !== 'sync' && type !== 'async') throw new Error('Invalid type');
  if (typeof(func) !== 'function') throw new Error(func + 'is not a function');
  return {
    typeOfReq: type,
    iterations: count,
    funcName: func.name,
    pathToBaseFile: path
  };
};

const speed = (
  caption,
  count,
  testsSync,
  testsAsync,
  mod
) => {
  const path = mod.filename;
  const testArray = testsSync ? testsAsync ? testsAsync.concat(testsSync) :
    testsSync : testsAsync;

  if (process.argv[1] === PATH_TO_CHILD) {
    let func;
    for (func of testArray) mod.exports[func.name] = func;
    return;
  }

  dc = metasync.collect(testArray.length);
  dc.done(() => {
    getResult(Object.values(dc.data));
    process.exit(-1);
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
