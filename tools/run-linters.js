'use strict';

const path = require('path');
const childProcess = require('child_process');

const nodeVersionString = process.version.slice(1);
const nodeMajorVersion = parseInt(nodeVersionString.split('.')[0]);
if (nodeMajorVersion < 4) {
  console.error('Skipping linters on your system.');
  process.exit();
}

const projectDir = path.resolve(__dirname, '..');

function runLinter(linterName, args, callback) {
  if (process.platform === 'win32') {
    linterName += '.cmd';
  }

  const linter = childProcess.spawn(linterName, args, {
    cwd: projectDir,
    stdio: 'inherit'
  });

  linter.on('close', (code) => {
    if (code !== 0) {
      process.exit(code);
    }
    callback();
  });
}

runLinter('eslint', ['.'], () => {
  runLinter('remark', ['-q', '.'], () => {
    console.log('All checks ran successfully.');
  });
});
