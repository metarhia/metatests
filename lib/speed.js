'use strict';

const metasync = require('metasync');
const { fork } = require('child_process');
const getResult = require('./speed/get-result.js');

const PATH_TO_CHILD = __dirname + '/speed/get-time.js'; // Path to child process

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

const generatePath = (
  version
) => {
  const fs = require('fs');
  const nvm = process.env.NVM_DIR;
  const path = nvm + '/versions/node/' + version + '/bin/node';
  if (!nvm) throw new Error('nvm not found');
  if (!fs.existsSync(path)) throw new Error('node: ' + version + ' not found');
  return path;
};

const speed = (
  // Function witch manage processes of testing functions
  caption, // string, caption of test
  count, // number, number of iterations
  testsSync, // array of sync functions
  testsAsync, // array of functions, callback-last
  versions = [null] // array, versions of node [8.0.0, 9.4.0]
) => {
  if (!versions[0]) versions[0] = process.env.NVM_BIN.split('/')[6];
  let moduleRef = module; // ref to module with function 'speed'
  while (moduleRef.parent !== null) moduleRef = moduleRef.parent;

  const testArray = testsSync ? testsAsync ? testsAsync.concat(testsSync) :
    testsSync : testsAsync;

  if (process.argv[1] === PATH_TO_CHILD) { // start only from child process
    moduleRef = moduleRef.children[0];
    let func;
    for (func of testArray) moduleRef.exports[func.name] = func;
    return;
  }
  const path = moduleRef.filename; // string, path to file with function 'speed'

  const vdc = metasync.collect(versions.length); // DC, versions results
  vdc.done(() => {
    getResult(vdc.data, caption, count);
    process.exit();
  });

  if (testsSync) {
    versions.forEach(version => {
      const dc = metasync.collect(testArray.length); // DC, functions results
      dc.done(() => vdc.pick(version, dc.data));
      const pathToNode = generatePath(version);
      testsSync.forEach((func) => {
        const forked = fork(PATH_TO_CHILD, { execPath: pathToNode });
        const obj = makeRequest(func, count, 'sync', path);
        forked.send(obj);
        forked.on('message', (msg) => dc.pick(func.name, msg));
      });
    });
  }

  if (testsAsync) {
    versions.forEach(version => {
      const dc = metasync.collect(testArray.length); // DC, functions results
      dc.done(() => vdc.pick(version, dc.data));
      const pathToNode = generatePath(version);
      testsAsync.forEach((func) => {
        const forked = fork(PATH_TO_CHILD, { execPath: pathToNode });
        const obj = makeRequest(func, count, 'async', path);
        forked.send(obj);
        forked.on('message', (msg) => dc.pick(func.name, msg));
      });
    });
  }
};


module.exports = speed;
