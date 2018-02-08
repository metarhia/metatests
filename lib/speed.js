'use strict';

const makeResults = require('./speed/make-results.js');
const PATH_GET_TIME = __dirname + '/speed/get-time.js';
const GET_NODE_PATH = __dirname + '/speed/get-node-path.sh';

const getNodePath = (
  // Function which get path to node by version
  version // String, versions of node, example: 9.4.0, 8.0, 7
  // Returns: String, path to node
) => {
  const fs = require('fs');
  const execSync = require('child_process').execSync;
  let pathToNode = null;
  if (process.env.NVM_DIR) {
    pathToNode = execSync(['sh', GET_NODE_PATH, version, 'nvm'].join(' '))
      .toString().trim();
    if (fs.existsSync(pathToNode)) return pathToNode;
  }
  if (process.env.NVS_HOME) {
    pathToNode = execSync(['sh', GET_NODE_PATH, version, 'nvs'].join(' '))
      .toString().trim();
    if (fs.existsSync(pathToNode)) return pathToNode;
  }
  throw new Error('Node: ' + version + ' not found');
};

const getFullVersion = (
  // Function which get full node version from node path
  pathToNode // String, path to node
  // Returns: String, full node version
) => {
  const path = pathToNode.split('/');
  const version = path[path.length - 3];
  return version[0] === 'v' ? version.substring(1, version.length) : version;
};

const makeRequests = (
  // Function which create requests to child processes
  versions, // Array of string, array of node versions
  testsSync, // Array of synchronous functions
  testsAsync // Array of asynchronous functions, callback-last
  // Returns: Array, array of requests
) => {
  const requests = [];
  versions.forEach(version => {
    const versionResults = []; // results of all functions in one node version
    const nodePath = getNodePath(version);
    const fullVersion = getFullVersion(nodePath);
    testsSync.forEach(func => {
      requests.push([func, 'sync', fullVersion, versionResults, nodePath]);
    });
    testsAsync.forEach(func => {
      requests.push([func, 'async', fullVersion, versionResults, nodePath]);
    });
  });
  return requests;
};

const speed = (
  // Function which manage processes of testing functions
  caption, // String, caption of test
  modRef, // Reference to the module that contains tested functions
  count, // Number, number of iterations
  testsSync, // Array of synchronous functions
  testsAsync = [], // Array of asynchronous functions, callback-last
  versions = [process.versions.node] // Array, node ver-s: [8.0.0, 9.4, 6]
) => {
  const path = modRef.filename; // path to file that contains tested functions

  if (process.argv[1] === PATH_GET_TIME) { // start only from child process
    testsSync.forEach(func => { modRef.exports[func.name] = func; });
    testsAsync.forEach(func => { modRef.exports[func.name] = func; });
    return;
  }

  const results = new Map(); // results of all functions of all node versions
  results.caption = caption;
  results.count = count;

  const requests = makeRequests(versions, testsSync, testsAsync);
  const numberOfFuncs = testsSync.length + testsAsync.length;

  const sendRequest = (
    func, // Function, tested function
    type, // String, 'sync' or 'async'
    version, // String, version of node
    versionResults, // Array, results of all functions in one node version
    nodePath // String, path to the needed version of the node
  ) => {
    const { fork } = require('child_process');
    const forked = fork(PATH_GET_TIME, { execPath: nodePath });
    forked.send({ name: func.name, count, type, path });
    forked.on('message', result => {
      versionResults.push(result);
      if (versionResults.length === numberOfFuncs) {
        results.set(version, versionResults);
        if (results.size === versions.length) makeResults(results);
      }
      if (requests.length) sendRequest(...requests.pop());
    });
  };

  sendRequest(...requests.pop());
};
module.exports = speed;
