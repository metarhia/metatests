'use strict';

const { fork } = require('child_process');
const makeResults = require('./speed/make-results.js');
const PATH_TO_CHILD = __dirname + '/speed/get-time.js'; // Path to child process

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

const exportFunctions = (
  // Function witch add test functions to module.exports
  testArray // array, array with test functions
) => {
  let func, modRef = module;
  while (modRef.filename !== PATH_TO_CHILD) modRef = modRef.parent;
  for (func of testArray) modRef.children[0].exports[func.name] = func;
};

const speed = (
  // Function witch manage processes of testing functions
  caption, // string, caption of test
  count, // number, number of iterations
  testsSync, // array of sync functions
  testsAsync = [], // array of functions, callback-last
  versions = [process.env.NVM_BIN.split('/')[6]] // array, node ver-s: [v8.0.0]
) => {
  const path = new Error().stack.split('(')[2].split(':')[0];
  //path to file where was called function speed
  const testArray = testsAsync.concat(testsSync);

  if (process.argv[1] === PATH_TO_CHILD) { // start only from child process
    exportFunctions(testArray);
    return;
  }

  const versResults = new Map(); // map to collection versions results
  versResults.caption = caption;
  versResults.count = count;


  const requests = [];
  versions.forEach(version => {
    const time = [];
    const makeRequest = (func, type) => {
      const request = { name: func.name, count, type, path };
      requests.push([request, generatePath(version), time, version]);
    };
    testsSync.forEach(func => makeRequest(func, 'sync'));
    testsAsync.forEach(func => makeRequest(func, 'async'));
  });

  const sendRequest = (request, nodePath, time, version) => {
    const forked = fork(PATH_TO_CHILD, [path], { execPath: nodePath });
    forked.send(request);
    forked.on('message', msg => {
      time.push(msg);
      const nextFunc = requests.shift();
      if (nextFunc) sendRequest(...nextFunc);
      if (time.length === testArray.length) versResults.set(version, time);
      if (versResults.size === versions.length) makeResults(versResults);
    });
  };
  sendRequest(...requests.shift());
};
module.exports = speed;
