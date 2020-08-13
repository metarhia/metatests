#!/usr/bin/env node
'use strict';

const metatests = require('..');
const yargs = require('yargs');
const common = require('@metarhia/common');
const yaml = require('tap-yaml');
const path = require('path');
const fs = require('fs');

const DEFAULT_EXIT_TIMEOUT = 5;
const runner = metatests.runner.instance;

const logLevels = {
  quiet: 0,
  default: 1,
  error: 1,
  warn: 2,
  info: 3,
  debug: 4,
};

const isLogAtLeast = (level1, level2 = 'default') =>
  logLevels[level1] >= logLevels[level2];

const printIfLog = (config, log, ...msg) => {
  if (isLogAtLeast(config.logLevel, log)) {
    runner.reporter.log(...msg);
  }
};

const printIfLogComment = (config, log, ...msg) => {
  if (isLogAtLeast(config.logLevel, log)) {
    runner.reporter.logComment(...msg);
  }
};

const merge = (arr1 = [], arr2 = []) => common.merge(arr1, arr2);

const exclude = (files, filterArr) =>
  filterArr
    .map(p =>
      p
        .replace('/', path.sep)
        .replace(/[.+^${}()|[\]\\]/g, '\\$&')
        .replace('*', '.+')
        .replace('?', '.')
    )
    .map(p => new RegExp(p))
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

const getConfig = args => {
  const config = args.config ? parseFile(args.config) : {};

  config.exclude = merge(config.exclude, args.exclude);
  config.files = loadFiles(merge(config.files, args._));
  config.files = exclude(config.files, config.exclude);

  config.logLevel = args.logLevel || config.logLevel || 'default';
  config.reporter = args.reporter || config.reporter || 'tap';
  config.runTodo = args.runTodo || config.runTodo;
  config.exitTimeout =
    args.exitTimeout || config.exitTimeout || DEFAULT_EXIT_TIMEOUT;
  return config;
};

const runNode = (config, cb) => {
  if (config.logLevel === 'quiet') {
    runner.removeReporter();
  } else if (config.reporter.startsWith('tap')) {
    runner.setReporter(
      new metatests.reporters.TapReporter({
        type:
          config.reporter.split('-')[1] ||
          (process.stdout.isTTY ? 'classic' : 'tap'),
      })
    );
  } else if (config.reporter === 'concise') {
    runner.setReporter(new metatests.reporters.ConciseReporter());
  }
  if (config.runTodo) runner.runTodo();
  runner.on('finish', hasFailures => {
    const msg = 'Tests finished. Waiting for process to finish.\n';
    printIfLogComment(config, 'default', msg);
    if (hasFailures) {
      cb(1);
      return;
    }
    setTimeout(() => {
      const msg = `Process didn't finish within timeout (${
        config.exitTimeout * 5000
      }), exiting.`;
      printIfLog(config, 'default', msg);
      cb(1);
    }, config.exitTimeout * 5000).unref();
  });
  const msg = `\nNode ${process.version} (v8 ${process.versions.v8}):`;
  printIfLog(config, 'default', msg);
  merge(config.files, config.nodeOnly).forEach(name => {
    require(path.isAbsolute(name) ? name : path.join(process.cwd(), name));
  });
};

const runTests = args => {
  const config = getConfig(args);

  const onExit = code => {
    printIfLogComment(config, 'default', 'Metatests finished with code', code);
    process.exit(code);
  };

  const msg = `Metatests final config:\n${JSON.stringify(config, null, 2)}\n`;
  printIfLogComment(config, 'debug', msg);
  if (!config.files.length) {
    console.error('No test files were specified\n');
    yargs.showHelp();
    onExit(1);
  }

  runNode(config, onExit);
};

const runSpeed = args => {
  const res = require(path.join(process.cwd(), args.file));
  let target;
  if (Array.isArray(res)) target = res;
  else if (typeof res === 'function') target = [res];
  else if (typeof res === 'object' && args.target) {
    const r = res[args.target];
    if (Array.isArray(r)) target = r;
    else if (typeof r === 'function') target = [r];
  }
  if (target) {
    metatests.speed(args.caption, args.count, target);
  } else {
    console.error("File doesn't export correct target");
    yargs.showHelp();
  }
};

yargs
  .parserConfiguration({
    'duplicate-arguments-array': false,
  })
  .command(
    '*',
    'tests',
    y => {
      y.usage('$0 [options] file.js [file.js...]')
        .usage('$0 [options] --config config.json')
        .option('exclude', {
          global: false,
          array: true,
          type: 'string',
          describe: 'Exclude tests patterns',
        })
        .option('reporter', {
          global: false,
          type: 'string',
          describe: 'Reporter name',
        })
        .option('log-level', {
          global: false,
          choices: Object.keys(logLevels),
          type: 'string',
          describe: 'Log level',
        })
        .option('run-todo', {
          global: false,
          type: 'boolean',
          describe: 'Run todo tests',
        })
        .option('exit-timeout', {
          global: false,
          type: 'number',
          describe: 'Seconds to wait after tests finished',
        })
        .option('config', {
          global: false,
          alias: 'c',
          type: 'string',
          describe: 'Path to config file',
        })
        // This has to be a subcommand in order to have its help
        // usage printed by yargs.
        .command(
          'speed <file>',
          'Simple speed tests. The file should either export a ' +
            'case/function, an array of cases/function or an object with ' +
            '--target option provided',
          y =>
            y
              .option('caption', {
                type: 'string',
                describe: 'Caption of the speed test',
                default: 'Speed test',
              })
              .option('count', {
                alias: 'n',
                type: 'number',
                describe: 'Number of runs',
                default: 1e7,
              })
              .option('target', {
                alias: 't',
                type: 'string',
                describe: 'Name of exported property to use for speed test',
              }),
          runSpeed
        );
    },
    runTests
  )
  .help()
  .alias('help', 'h').argv;
