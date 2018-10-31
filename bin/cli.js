#!/usr/bin/env node
'use strict';

const metatests = require('..');
const program = require('commander');
const common = require('metarhia-common');
const yaml = require('yaml').default;
const path = require('path');
const fs = require('fs');

const splitOpts = v => v.split(',');

const cliOptions = [
  [ '--exclude <patterns>',      'Exclude tests patterns', splitOpts, [] ],
  [ '--reporter <value>',        'Reporter name'],
  [ '--log-level <value>',       'Log level'],
  [ '-c, --config <value>',      'Config file' ],
];

const logLevels = ['quiet', 'default', 'debug'];

const isLogAtLeast = (level1, level2) => {
  if (logLevels.indexOf(level1) === -1) level1 = 'default';
  if (logLevels.indexOf(level2) === -1) level2 = 'default';
  return logLevels.indexOf(level1) >= logLevels.indexOf(level2);
};

const merge = (arr1 = [], arr2 = []) => common.merge(arr1, arr2);

const exclude = (files, filterArr) =>
  filterArr.map(path => path.replace('.', '\\.')
    .replace('*', '.+')
    .replace('?', '.'))
    .map(path => new RegExp(path))
    .reduce((files, regexp) => files.filter(file => !regexp.test(file)), files);

const parseFile = file => {
  const data = fs.readFileSync(path.resolve(file), 'utf8');
  switch (common.fileExt(file)) {
    case 'json':
      return JSON.parse(data);
    case 'yml':
    case 'yaml':
      return yaml.parse(data);
    default:
      return {};
  }
};

const loadFiles = files => {
  const result = [];
  files
    .map(file => {
      if (fs.existsSync(file + '.js')) {
        return file + '.js';
      } else if (fs.existsSync(file)) {
        return file;
      } else {
        console.error('File does not exist:', file);
        process.exit(1);
        return '';
      }
    })
    .forEach(file => {
      if (fs.statSync(file).isDirectory()) {
        const subfiles = fs.readdirSync(file).map(f => path.join(file, f));
        result.push(...loadFiles(subfiles));
      } else if (common.fileExt(file) === 'js') {
        result.push(file);
      }
    });
  return result;
};

const getConfig = () => {
  const version = parseFile(path.resolve(__dirname, '../package.json')).version;
  program.version(version).usage('[options] -- <file ...>');
  cliOptions.forEach(option => program.option(...option));
  program.parse(process.argv);

  const config = program.config ? parseFile(program.config) : {};

  config.files = merge(config.files, program.args);
  config.files = loadFiles(config.files);
  config.exclude = merge(config.exclude, program.exclude);
  config.files = exclude(config.files, config.exclude);
  config.logLevel = program.logLevel || 'default';
  config.reporter = program.logLevel || program.reporter || 'default';

  return config;
};

const runNode = (config, cb) => {
  if (config.logLevel === 'quiet') metatests.runner.instance.removeReporter();
  metatests.runner.instance.on('finish', () => {
    if (isLogAtLeast(config.logLevel, 'default')) {
      console.log('Tests finished. Waiting for unfinished tests after end\n');
    }
    setTimeout(() => cb(metatests.runner.instance.hasFailures ? 1 : 0), 5000);
  });
  if (isLogAtLeast(config.logLevel, 'default')) {
    console.log(`\nNode ${process.version} (v8 ${process.versions.v8}):`);
  }
  config.files.map(name => require(path.resolve('./' + name)));
};

const onExit = code => {
  console.log('Metatests finished with code', code);
  process.exit(code);
};

const config = getConfig();
if (isLogAtLeast(config.logLevel, 'debug')) {
  console.log(`Metatests final config:\n${JSON.stringify(config, null, 2)}\n`);
}

if (!config.files.length) {
  program.outputHelp(help => 'No test files specified\n\n' + help);
  onExit(1);
}

runNode(config, onExit);
