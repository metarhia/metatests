'use strict';

const { fork } = require('child_process');
const makeResults = require('./speed/make-results.js');

const PATH_TO_CHILD = __dirname + '/speed/get-time.js'; // Path to child process

const makeRequest = (
  // Function witch create request to child process
  func, // Function, function to be tested
  iterations, // number, number of iterations
  typeRq, // string, 'sync' or 'async'
  pathToBaseFile // string, path to file with test function
  // Returns: object, request to child process
) => {
  if (typeRq !== 'sync' && typeRq !== 'async') throw new Error('Invalid type');
  if (typeof(func) !== 'function') throw new Error(func + 'is not a function');
  return {
    name: func.name,
    count: iterations,
    type: typeRq,
    path: pathToBaseFile
  };
};

const generatePath = (
  // Function witch create path to node by version
  version // string, versions of node example: v9.4.0
  // Returns: string, path to node
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
  testsAsync = [], // array of functions, callback-last
  versions = [] // array, versions of node example: [v8.0.0, v9.4.0]
) => {
  const path = process.argv[1]; // string, path to file with test function
  const testArray = testsSync ? testsAsync ? testsAsync.concat(testsSync) :
    testsSync : testsAsync;

  if (path === PATH_TO_CHILD) { // start only from child process
    let func, modRef = module;
    while (modRef.filename !== PATH_TO_CHILD) modRef = modRef.parent;
    for (func of testArray) modRef.children[0].exports[func.name] = func;
    return;
  }

  if (!versions[0]) versions[0] = process.env.NVM_BIN.split('/')[6];

  const versResults = new Set();

  const sendRequest = (func, type, nodePath, times) => {
    const forked = fork(PATH_TO_CHILD, { execPath: nodePath });
    const obj = makeRequest(func, count, type, path);
    forked.send(obj);
    forked.on('message', msg => {
      times.add(msg);
      if (times.size === testArray.length) versResults.add(times);
      if (versResults.size === versions.length) {
        makeResults(versResults, caption, count);
        process.exit();
      }
    });
  };

  versions.forEach(version => {
    const times = new Set();
    times.version = version;
    const nodePath = generatePath(version);
    testsSync.forEach(func => sendRequest(func, 'sync', nodePath, times));
    testsAsync.forEach(func => sendRequest(func, 'async', nodePath, times));
  });
};

module.exports = speed;
