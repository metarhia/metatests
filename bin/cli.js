#!/usr/bin/env node
'use strict';

const metatests = require('..');
const program = require('commander');
const common = require('@metarhia/common');
const karma = require('karma');
const yaml = require('yaml').default;
const path = require('path');
const fs = require('fs');

const splitOpts = v => v.split(',');

const cliOptions = [
  ['--node', 'Run in node.js environment'],
  ['--browser', 'Run in browser environment'],
  ['--browser-only <patterns>', 'Browser only tests patterns', splitOpts, []],
  ['--node-only <patterns>', 'Node only tests patterns', splitOpts, []],
  ['--exclude <patterns>', 'Exclude tests patterns', splitOpts, []],
  ['--browsers <values>', 'Browsers to run', splitOpts, []],
  ['--reporter <value>', 'Reporter name'],
  ['--log-level <value>', 'Log level'],
  ['--run-todo', 'Run todo tests'],
  ['-l, --browser-log <value>', 'Browser log level'],
  ['-p, --browser-port <n>', 'Browser port'],
  ['-c, --config <value>', 'Config file'],
];

const karmaLogLevels = {
  disable: ['LOG_DISABLE', 'none'],
  error: ['LOG_ERROR', 'errors-only'],
  warn: ['LOG_WARN', 'minimal'],
  info: ['LOG_INFO', 'normal'],
  debug: ['LOG_DEBUG', 'verbose'],
};

const browserLaunchers = {
  Chrome: 'karma-chrome-launcher',
  ChromeHeadless: 'karma-chrome-launcher',
  Firefox: 'karma-firefox-launcher',
  IE: 'karma-ie-launcher',
  Opera: 'karma-opera-launcher',
  Safari: 'karma-safari-launcher',
};

const logLevels = {
  quiet: [0, 'disable'],
  default: [1, 'error'],
  debug: [2, 'debug'],
};

const isLogAtLeast = (level1, level2) => {
  if (!logLevels[level1]) level1 = 'default';
  if (!logLevels[level2]) level2 = 'default';
  return logLevels[level1][0] >= logLevels[level2][0];
};

const convertLogLevel = level => {
  if (!logLevels[level]) level = 'default';
  return logLevels[level][1];
};

const merge = (arr1 = [], arr2 = []) => common.merge(arr1, arr2);

const exclude = (files, filterArr) =>
  filterArr
    .map(path =>
      path
        .replace('.', '\\.')
        .replace('*', '.+')
        .replace('?', '.')
    )
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

const setKarmaBrowsers = (config, ...browsers) => {
  if (!config.plugins) config.plugins = [];
  if (!config.browsers) config.browsers = [];

  browsers.forEach(browser => {
    const launcher = browserLaunchers[browser];
    if (!launcher) {
      console.error(
        'Metatests library does not support such browser:',
        browser
      );
      process.exit(1);
    }
    config.browsers.push(browser);
    if (!config.plugins.includes(launcher)) config.plugins.push(launcher);
  });
};

const setKarmaLogLevel = (config, logLevel = 'disable') => {
  if (!config.webpackMiddleware) config.webpackMiddleware = {};
  config.logLevel = karma.constants[karmaLogLevels[logLevel][0]];
  config.webpackMiddleware.stats = karmaLogLevels[logLevel][1];
};

const removeNodePackages = (config, ...packages) => {
  if (!config.webpack) config.webpack = {};
  if (!config.webpack.node) config.webpack.node = {};
  packages.forEach(lib => {
    config.webpack.node[lib] = 'empty';
  });
};

const getReporter = logLevel => {
  const browsers = [];
  const reporter = function(base) {
    base(this);
    if (logLevel === 'disable') {
      this.onBrowserError = () => {};
      this.onBrowserLog = () => {};
      return;
    }

    this.onBrowserLog = (browser, log) => {
      if (typeof log !== 'string') log = JSON.stringify(log);
      else log = log.slice(1, log.length - 1);
      if (!browsers.includes(browser)) {
        browsers.push(browser);
        console.log(`\n${browser}:`);
      }
      console.log(log);
    };
  };

  reporter.$inject = ['baseReporterDecorator'];
  return reporter;
};

const getBrowserConfig = conf => {
  const config = {
    preprocessors: {},
    files: [],
    plugins: [
      'karma-webpack',
      { 'reporter:meta': ['type', getReporter(conf.browser.logLevel)] },
    ],
    reporters: ['meta'],
    basePath: process.env.PWD,
    port: conf.browser.port,
    autoWatch: false,
    singleRun: true,
    concurrency: 1,
  };

  const adapter = path.resolve('./build/adapter.js');
  config.files.push(adapter);
  config.preprocessors[adapter] = ['webpack'];
  const nodePackages = ['fs', 'child_process'];

  removeNodePackages(config, ...nodePackages);
  setKarmaBrowsers(config, ...conf.browser.browsers);
  setKarmaLogLevel(config, conf.browser.logLevel);
  return config;
};

const getEnvironment = (config, program) => {
  if (program.node || program.browser) {
    config.environments = [];
    if (program.node) config.environments.push('node');
    if (program.browser) config.environments.push('browser');
    return;
  }
  if (!config.environments || config.environments.length === 0) {
    config.environments = ['node'];
  }

  config.environments = Array.from(new Set(config.environments));
  const environments = ['node', 'browser'];
  config.environments.forEach(env => {
    if (!environments.includes(env)) {
      console.error(
        `Metatests library doesn't support such environment: ${env}`
      );
      process.exit(1);
    }
  });
};

const getConfig = () => {
  const version = parseFile(path.resolve(__dirname, '../package.json')).version;
  program.version(version).usage('[options] -- <file ...>');
  cliOptions.forEach(option => program.option(...option));
  program.parse(process.argv);

  const config = program.config ? parseFile(program.config) : {};
  getEnvironment(config, program);

  config.files = merge(config.files, program.args);
  config.files = loadFiles(config.files);
  config.exclude = merge(config.exclude, program.exclude);
  config.files = exclude(config.files, config.exclude);
  config.nodeOnly = merge(config.nodeOnly, program.nodeOnly);
  config.browserOnly = merge(config.browserOnly, program.browserOnly);
  config.logLevel = program.logLevel || 'default';
  config.reporter = program.logLevel || program.reporter || 'default';
  config.runTodo = program.runTodo || config.runTodo;

  if (config.environments.includes('browser')) {
    config.browser = config.browser || {};
    config.browser.browsers = merge(config.browser.browsers, program.browsers);
    config.browser.logLevel =
      program.browserLog ||
      (program.logLevel
        ? convertLogLevel(program.logLevel)
        : config.browser.logLevel);
    config.browser.port = +program.browserPort || config.browser.port;
    config.browser = getBrowserConfig(config);
  }
  return config;
};

const runNode = (config, cb) => {
  if (config.logLevel === 'quiet') metatests.runner.instance.removeReporter();
  if (config.runTodo) metatests.runner.instance.runTodo();
  metatests.runner.instance.on('finish', () => {
    if (isLogAtLeast(config.logLevel, 'default')) {
      console.log('Tests finished. Waiting for unfinished tests after end\n');
    }
    setTimeout(() => cb(metatests.runner.instance.hasFailures ? 1 : 0), 5000);
  });
  if (isLogAtLeast(config.logLevel, 'default')) {
    console.log(`\nNode ${process.version} (v8 ${process.versions.v8}):`);
  }
  merge(config.files, config.nodeOnly).map(name =>
    require(path.resolve('./' + name))
  );
};

const runBrowser = (config, cb) => {
  if (!config.browser.browsers.length) {
    console.error('No browser environments specified');
    cb(1);
  }

  const buildDir = path.resolve('./build');
  const buildAdapter = path.resolve('./build/adapter.js');
  if (!fs.existsSync(buildDir)) fs.mkdirSync(buildDir);

  const headers = [];
  headers.push('__karma__.start=()=>{}');
  headers.push("require('babel-polyfill')");
  if (config.runTodo) {
    if (require('../package.json').name === 'metatests') {
      headers.push("require('..').runner.instance.runTodo()");
    } else {
      headers.push("require('metatests').runner.instance.runTodo()");
    }
  }
  merge(config.files, config.browserOnly).forEach(file =>
    headers.push(`require('../${file}')`)
  );

  fs.writeFileSync(buildAdapter, headers.join(';') + ';');
  const server = new karma.Server(config.browser, code => {
    fs.unlinkSync(buildAdapter);
    fs.rmdirSync(buildDir);
    cb(code);
  });
  server.start();
};

const runBoth = (config, cb) => {
  runBrowser(config, codeB => {
    if (isLogAtLeast(config.logLevel, 'default')) {
      console.log('Metatests in browser finished with code', codeB);
    }
    runNode(config, codeN => {
      if (isLogAtLeast(config.logLevel, 'default')) {
        console.log('Metatests in node finished with code', codeN);
      }
      cb(codeB + codeN);
    });
  });
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

const nodeEnv = config.environments.includes('node');
const browserEnv = config.environments.includes('browser');

if (nodeEnv && browserEnv) {
  runBoth(config, onExit);
} else if (nodeEnv) {
  runNode(config, onExit);
} else if (browserEnv) {
  runBrowser(config, onExit);
} else {
  console.error('No environments specified');
  onExit(1);
}
