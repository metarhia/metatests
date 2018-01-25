'use strict';

const metasync = require('metasync');
const { fork } = require('child_process');
const getResult = require('./speed/get-result.js');
const fs = require('fs');

const PATH_TO_CHILD = __dirname + '/speed/get-time.js';
const EXTENSION = '.test';
let dc;

const addExport = (filename, testsArray) => {
  fs.copyFileSync(filename, filename + EXTENSION);
  let text = '\nmodule.exports = {\n';
  let func;
  for (func of testsArray) text += '  ' + func.name + ',\n';
  text.substr(0, text.length - 2);
  text += '};\n';
  fs.appendFileSync(filename, text);
};

const deleteExport = (filename) => {
  fs.unlinkSync(filename);
  fs.renameSync(filename + EXTENSION, filename);
};

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
  testsAsync = null,
  path = process.argv[1]
) => {
  if (process.argv[1] === PATH_TO_CHILD) return;
  const testArray = testsSync ? testsAsync ? testsAsync.concat(testsSync) :
    testsSync : testsAsync;

  addExport(path, testArray);

  dc = metasync.collect(testArray.length);
  dc.done(() => {
    getResult(Object.values(dc.data));
    deleteExport(path);
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
