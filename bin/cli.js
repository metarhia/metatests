#!/usr/bin/env node
'use strict';

const yargs = require('yargs');
const common = require('@metarhia/common');
const yaml = require('tap-yaml');
const path = require('path');
const fs = require('fs');
const util = require('util');
const { spawn } = require('child_process');

const metatests = require('..');
const {
  resultToCsv,
  makeTotalResults,
  aggregateResults,
} = require('../lib/speed');
const { roundTo } = require('../lib/utils');

const COMPARE_R_PATH = path.join(__dirname, '..', 'benchmarks', 'compare.R');

const NS_PER_SEC = 1e9;

const DEFAULT_EXIT_TIMEOUT = 5;
const runner = metatests.runner.instance;

const [semverMajor, semverMinor] = process.version
  .slice(1)
  .split('.')
  .map(Number);
const supportsESM =
  (semverMajor === 12 && semverMinor >= 17) ||
  (semverMajor === 13 && semverMinor >= 2) ||
  semverMajor >= 14;

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
  common
    .iter(files)
    .map(file => {
      if (fs.existsSync(file)) {
        return file;
      } else if (fs.existsSync(file + '.js')) {
        return file + '.js';
      } else if (fs.existsSync(file + '.cjs')) {
        return file + '.cjs';
      } else if (fs.existsSync(file + '.mjs')) {
        return file + '.mjs';
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
      } else if (['js', 'mjs', 'cjs'].includes(common.fileExt(file))) {
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
    const file = path.isAbsolute(name) ? name : path.join(process.cwd(), name);
    if (file.endsWith('mjs')) {
      if (supportsESM) {
        import('file://' + file);
      } else {
        console.warn(
          `Warning: ignoring '${file}', current Node.js version doesn't ` +
            'support dynamic import'
        );
      }
    } else {
      require(file);
    }
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

const handleBenchTarget = args => {
  const res = require(path.join(process.cwd(), args.file));
  let target = args.target ? common.getByPath(res, args.target) : res;
  if (!Array.isArray(target)) {
    if (target && typeof target === 'object') target = Object.values(target);
    else if (typeof target === 'function') target = [target];
  }
  if (!target) {
    console.error("File doesn't export correct target");
    yargs.showHelp();
    process.exit(1);
  }
  return target;
};

const runSpeed = args => {
  const target = handleBenchTarget(args);
  if (!target) return;
  metatests.speed(args.caption, args.count, target);
};

function measureTarget(target, args) {
  const options = {
    defaultCount: args.count,
    runs: args.runs,
    preflight: args.preflight,
    preflightCount: args.preflightCount,
    listener: {
      cycle: (name, r) => {
        let out;
        if (args.csv) {
          out = resultToCsv(r);
        } else if (args.verbose) {
          let args = r.args && r.args.map(util.inspect).join(' ');
          if (args) args = '\targs=' + args;
          const ops = roundTo(r.count / (r.time / NS_PER_SEC), 2);
          out = `${name}\tn=${r.count}${args}:\t\t${r.time}ns, ${ops}ops/s`;
        }
        if (out) console.log(out);
      },
      done: (caseName, caseConf, results) => {
        if (args.csv) return;
        const agg = aggregateResults(results)[0];
        const name = agg.name.padEnd(15, ' ');
        const ops = roundTo(agg.ops, 2) + ' ops/s ';
        const rme = '±' + roundTo(agg.stats.relativeMarginOfError, 2) + '%';
        console.log(name + ops + rme);
      },
    },
  };
  if (args.csv) {
    console.log(
      ['name', 'configuration', 'rate', 'time'].map(JSON.stringify).join(', ')
    );
  }
  return metatests.measure(target, options);
}

const runMeasure = args => {
  if ((args.new && !args.old) || (args.old && !args.new)) {
    console.error('Measure --old --new must always be used together.');
    process.exit(1);
  }
  if (args.new && args.old) {
    let res = require(path.join(process.cwd(), args.file));
    if (args.target) res = common.getByPath(res, args.target);
    const oldTarget = common.getByPath(res, args.old);
    const oldCases = Array.isArray(oldTarget)
      ? oldTarget
      : [{ name: args.name, fn: oldTarget }];
    const newTarget = common.getByPath(res, args.new);
    const newCases = Array.isArray(newTarget)
      ? newTarget
      : [{ name: args.name, fn: newTarget }];

    console.log('Measuring old target');
    const oldResults = measureTarget(oldCases, args);
    console.log('Measuring new target');
    const newResults = measureTarget(newCases, args);

    const r = spawn('Rscript', [COMPARE_R_PATH], {
      stdio: ['pipe', 'inherit', 'inherit'],
    });
    console.log();
    r.stdin.write(makeTotalResults(oldResults, newResults));
    r.stdin.end();
  } else {
    const target = handleBenchTarget(args);
    if (!target) return;
    measureTarget(target, args);
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
          'speed [options] <file>',
          'Perform simple benchmarking. The file should either export a ' +
            'case/function, an array of cases/functions or an object with ' +
            'properties. --target option can be used to get nested paths ' +
            'from exported object',
          y =>
            y
              .example(
                '$0 speed bench.js',
                'Run simple benchmarks for every function exported from ' +
                  '"bench.js"'
              )
              .example(
                '$0 speed -n 1e7 bench.js',
                'Run simple benchmarks with custom run count for every ' +
                  'function exported from "bench.js"'
              )
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
        )
        .command(
          'measure [options] <file>',
          'Perform comprehensive benchmarks with extensive customization. ' +
            'The file should either export a case/function, an array of ' +
            'cases/functions or an object with properties. --target option ' +
            'can be used to get nested paths from exported object. ' +
            'Two implementations can be compared with the use of ' +
            '--new and --old options',
          y =>
            y
              .example(
                '$0 measure --csv bench.js',
                'Run benchmarks for all exported functions from "bench.js" ' +
                  'file and output them in csv format'
              )
              .example(
                '$0 measure --csv --preflight 5 --runs 20 -n 1e7 bench.js',
                'Run benchmarks for all exported functions from "bench.js" ' +
                  'file using custom options and output them in csv format'
              )
              .example(
                '$0 measure --old oldImpl --new newImpl --name compare bench.js',
                'Compare performance of "oldImpl" function to "newImpl" one ' +
                  'exported from "bench.js" file'
              )
              .example(
                '$0 measure --old oldImpl --new newImpl --name compare --target ' +
                  'nested.props bench.js',
                'Compare performance of "nested.props.oldImpl" function to ' +
                  '"nested.props.newImpl" one exported from "bench.js" file'
              )
              .option('aggregate', {
                alias: 'agg',
                type: 'boolean',
                conflicts: ['csv'],
                describe:
                  'Aggregate multiple results with the same name. ' +
                  'True by default and incompatible with --csv',
              })
              .option('count', {
                alias: 'n',
                type: 'number',
                describe: 'Default number of function runs',
                default: 1e6,
              })
              .option('runs', {
                alias: 'r',
                type: 'number',
                describe: 'Number of runs of each case',
                default: 20,
              })
              .option('csv', {
                type: 'boolean',
                describe: 'Output results as CSV',
              })
              .option('preflight', {
                alias: 'p',
                type: 'number',
                describe: 'Number of preflight runs of each case',
                default: 10,
              })
              .option('preflightCount', {
                alias: 'pc',
                type: 'number',
                describe: 'Number of preflight function runs',
                default: 1e7,
              })
              .option('target', {
                alias: 't',
                type: 'string',
                describe: 'Path of exported property to use for speed test',
              })
              .option('name', {
                type: 'string',
                describe:
                  'Name to use for test function if --new --old is used',
                default: 'bench',
              })
              .option('new', {
                type: 'string',
                describe:
                  'Path of exported property to use as new in comparison. ' +
                  'Must always be used with --old.',
              })
              .option('old', {
                type: 'string',
                describe:
                  'Path of exported property to use as old in comparison. ' +
                  'Must always be used with --new.',
              })
              .option('verbose', {
                alias: 'v',
                type: 'boolean',
                describe: 'Output every result during the benchmark run',
                default: false,
              }),
          runMeasure
        );
    },
    runTests
  )
  .help()
  .alias('help', 'h').argv;
