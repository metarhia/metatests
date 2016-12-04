'use strict';

var path = require('path');
var childProcess = require('child_process');

var nodeVersionString = process.version.slice(1);
var nodeMajorVersion = parseInt(nodeVersionString.split('.')[0]);
if (nodeMajorVersion < 4) {
  console.error('Skipping linters on your system.');
  process.exit();
}

var projectDir = path.resolve(__dirname, '..');

function runLinter(linterName, args, callback) {
  var linter = childProcess.spawn(linterName, args, {
    cwd: projectDir,
    stdio: 'inherit'
  });

  linter.on('close', function(code) {
    if (code !== 0) {
      process.exit(code);
    }
    callback();
  });
}

runLinter('eslint', ['.'], function() {
  runLinter('remark', ['-q', '.'], function() {
    console.log('All checks ran successfully.');
  });
});
