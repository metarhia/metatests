'use strict';

const { iter, capitalize } = require('@metarhia/common');
const yaml = require('tap-yaml');

const { inspect, packageRegex } = require('./utils');

let TSR = null;
const lazyTSR = (...args) => {
  if (!TSR) {
    TSR = require('tap-mocha-reporter');
  }
  return new TSR(...args);
};

const LINE_LENGTH = 12;

const line = (title, s) => '\n' + `${title}: `.padStart(LINE_LENGTH, ' ') + s;

const pad = n => ' '.repeat(n);

const renderStack = stack => {
  const path = process.cwd();
  const lines = stack.split('\n');
  const result = lines
    .map(
      (line, i) =>
        (i !== 0 ? pad(LINE_LENGTH) : '') +
        line.replace(/at /g, '').replace(path, '')
    )
    .filter(line => !line.includes('(internal/'));
  return result.join('\n');
};

class Reporter {
  //   options <Object>
  //     stream <stream.Writable> optional
  constructor(options) {
    this.options = { ...options };
    if (!this.options.stream) this.options.stream = process.stdout;
  }

  // Record test
  //   test <Test>
  record() {
    throw new Error('Not implemented');
  }

  // Fail test with error
  //   test <Test>
  //   error <Error>
  error() {
    throw new Error('Not implemented');
  }

  finish() {
    throw new Error('Not implemented');
  }

  log(...args) {
    this.options.stream.write(args.join(' ') + '\n');
  }

  logComment(...args) {
    this.log(...args);
  }
}

class ConciseReporter extends Reporter {
  constructor(options) {
    super(options);
    this.successful = 0;
    this.failed = 0;
    this.skipped = 0;
    this.successfulAsserts = 0;
    this.failedAsserts = 0;
  }

  error(test, error) {
    // remove one success because 'error' may only be received after end
    // though the test may have already failed so we need a way to check
    // if we should do this, i.e. store map of successful tests
    // this.successes--;
    // test.todo ? this.skipped++ : this.failures++;
    this.listFailure(
      test,
      { message: `Failure after end: ${error ? error.message : 'no message'}` },
      ` Test failed: ${test.caption}`
    );
  }

  parseTestResults(test, subtest) {
    const testResult = test.success ? 'succeeded' : 'failed';
    const todoPrefix = test.todo ? 'TODO' : '';
    let message = `${todoPrefix} Test ${testResult}: ${test.caption}\n`;
    if (test.metadata.filepath) message += `  ${test.metadata.filepath}\n`;

    if (!test.success && test.output) message += `\nOutput:\n${test.output}\n`;

    let firstFailure = true;
    test.results.forEach(res => {
      if (res.type === 'subtest') {
        const t = res.test;
        if (!t.success) {
          const subResult = {
            type: res.type,
            message: `Subtest ${t.id} / ${t.caption} failed: ${res.message}`,
            success: res.success,
          };
          if (firstFailure) {
            firstFailure = false;
            subtest ? this.printSubtestSeparator() : this.printTestSeparator();
          }
          this.listFailure(t, subResult, message);
        }
        this.parseTestResults(t, true);
      } else if (!res.success) {
        if (res.type !== 'test') this.failedAsserts++;
        if (firstFailure) {
          firstFailure = false;
          subtest ? this.printSubtestSeparator() : this.printTestSeparator();
        }
        this.listFailure(test, res, message);
      } else if (res.type !== 'test') {
        this.successfulAsserts++;
      }
    });
  }

  listFailure(test, res, message) {
    if (res.stack) res.stack = renderStack(res.stack);
    this.printAssertErrorSeparator();
    let s = message;
    ['type', 'message', 'expected', 'actual', 'stack']
      .filter(key => Object.prototype.hasOwnProperty.call(res, key))
      .forEach(key => {
        let value = res[key];
        if (key === 'message' && !value) return;
        if (key === 'actual' || key === 'expected') {
          const isError = value instanceof Error;
          let type = typeof value;
          if (type === 'function' || isError) {
            value = value.toString();
          } else {
            if (type === 'object' && value !== null && value.constructor) {
              type = value.constructor.name;
            }
            if (value === undefined) value = 'undefined';
            else value = inspect(value);
          }
          if (value !== 'undefined' && value !== 'null' && !isError) {
            value += ` is ${type}`;
          }
        }
        s += line(capitalize(key), value);
      });
    this.log(`${s}\n`);
  }

  record(test) {
    if (test.success) this.successful++;
    else if (!test.todo) this.failed++;
    else this.skipped++;
    this.parseTestResults(test);
  }

  finish() {
    this.printTestSeparator();
    this.log(
      'Tests finished: ' +
        `[+${this.successful} | -${this.failed} | ~${this.skipped}]\n` +
        'Asserts:        ' +
        `[+${this.successfulAsserts} | -${this.failedAsserts}]`
    );
  }

  printTestSeparator() {
    this.log('='.repeat(60));
  }

  printSubtestSeparator() {
    this.log('~'.repeat(60));
  }

  printAssertErrorSeparator() {
    this.log('-'.repeat(60));
  }
}

const padLines = (str, offset) => str.replace(/\n/g, `\n${pad(offset)}`);

const tapRenderStack = (stack, offset) =>
  '|\n' +
  iter(stack.replace(/^\s*at /gm, '').split('\n'))
    .skip(1)
    .filter(line => !line.match(packageRegex))
    .map(line => pad(offset) + line)
    .join('\n');

const tapTestCaption = (id, test) => {
  const testPrefix = test.success ? 'ok' : 'not ok';
  let msg = `${testPrefix} ${id}`;
  if (test.caption) {
    msg += ' - ' + test.caption;
  }
  if (test.metadata.time !== undefined) {
    msg += ` # time=${test.metadata.time}ms`;
  }
  return msg;
};

const dump = val => {
  let res = yaml.stringify(val);
  if (val instanceof Error) {
    // remove !error tag to avoid info stripping by different tap reporters
    // with this it will be displayed as an object
    res = res.slice(res.indexOf('\n') + 1);
  }
  return '\n' + res;
};

class TapReporter extends Reporter {
  constructor(options) {
    super(options);
    // TODO(lundibundi): fix (remove) this once TSR properly supports require from worker_threads
    const { type } = this.options;
    if (type && type !== 'tap') {
      let stream = null;
      Object.defineProperty(this.options, 'stream', {
        get() {
          // TODO: do .pipe(this.options.stream) as soon as TSR supports it
          if (!stream) stream = lazyTSR(type);
          return stream;
        },
      });
    }
    this.successful = 0;
    this.skipped = 0;
    this.failedTests = new Set();
    this.testNumeration = 0;
  }

  error(test, error) {
    const offset = 4;
    this.log(`# Subtest: ${test.caption}`);
    this.log(`${pad(offset)}not ok 1 - error after end`);
    this.listFailure(
      test,
      {
        caption: `Test failed: '${test.caption}'`,
        message: `Failure after end: ${error.toString()}`,
        stack: error.stack,
      },
      offset + 2
    );
    this.log(tapTestCaption(++this.testNumeration, test));
  }

  parseTestResults(test, offset = 0) {
    test.results.forEach((res, index) => {
      const testId = index + 1;
      if (res.type === 'subtest') {
        this.log(`${pad(offset)}# Subtest: ${res.test.caption}`);
        this.parseTestResults(res.test, offset + 4);
        this.log(pad(offset) + tapTestCaption(testId, res.test));
      } else if (res.success) {
        this.log(`${pad(offset)}ok ${testId} - ${res.type}`);
      } else {
        this.log(`${pad(offset)}not ok ${testId} - ${res.type}`);
        this.listFailure(test, res, offset + 2);
      }
    });
    this.log(`${pad(offset)}1..${test.results.length}`);
  }

  listFailure(test, res, offset) {
    let message = `${pad(offset)}---\n`;
    if (res.message) {
      message += `${pad(offset)}message: '${res.message}'\n`;
    }
    message += `${pad(offset)}severity: `;
    message += res.severity ? `${res.severity}\n` : 'fail\n';
    message += `${pad(offset)}type: ${res.type}\n`;
    const expected = padLines(dump(res.expected), offset + 2);
    message += `${pad(offset)}wanted:${expected}\n`;
    const actual = padLines(dump(res.actual), offset + 2);
    message += `${pad(offset)}found:${actual}\n`;
    if (test.output) {
      const output = padLines('|\n' + test.output, offset + 2);
      message += `${pad(offset)}output: ${output}\n`;
    }
    if (test.metadata.filepath) {
      message += `${pad(offset)}at:\n`;
      message += `${pad(offset + 2)}file: ${test.metadata.filepath}\n`;
    }
    if (res.stack) {
      const stack = tapRenderStack(res.stack, offset + 2);
      message += `${pad(offset)}stack: ${stack}\n`;
    }
    message += `${pad(offset)}...\n`;
    this.log(message);
  }

  record(test) {
    if (this.testNumeration === 0) this.log('TAP version 13');
    this.testNumeration++;
    if (test.success) {
      this.successful++;
    } else if (!test.todo) {
      this.failedTests.add(this.testNumeration);
    } else {
      this.skipped++;
    }
    if (test.todo) {
      const caption = test.caption ? ' - ' + test.caption : '';
      this.log(`\nok ${this.testNumeration}${caption} # TODO`);
      return;
    }
    this.log(`# Subtest: ${test.caption}`);
    this.parseTestResults(test, 4);
    this.log(tapTestCaption(this.testNumeration, test));
  }

  finish() {
    this.log(`1..${this.testNumeration}`);
    const failed = this.failedTests.size;
    const testsCount = this.testNumeration;
    if (failed !== 0) {
      const percentOfSuccess = (
        ((this.testNumeration - failed) / testsCount) *
        100
      ).toFixed(2);
      const testHarness =
        `FAILED test ${iter(this.failedTests).join(', ')}\n` +
        `Failed ${failed}/${testsCount} tests, ${percentOfSuccess}% okay`;
      this.log(testHarness);
    }
  }

  logComment(...args) {
    this.log('#', ...args.map(a => String(a).replace(/\n/g, '\n# ')));
  }
}

module.exports = {
  Reporter,
  ConciseReporter,
  TapReporter,
};
