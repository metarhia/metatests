'use strict';

const { iter, capitalize } = require('@metarhia/common');
const TSR = require('tap-mocha-reporter');
const { Console } = console;

const { inspect, packageRegex } = require('./utils');

const LINE_LENGTH = 12;

const lpad = (s, count, char = ' ') => char.repeat(count - s.length) + s;

const line = (title, s) => '\n' + lpad(`${title}: `, LINE_LENGTH) + s;

const pad = n => ' '.repeat(n);

const renderStack = stack => {
  const path = process.cwd();
  const lines = stack.split('\n');
  const result = lines
    .map(
      (line, i) =>
        ' '.repeat(i ? LINE_LENGTH : 0) +
        line.replace(/at /g, '').replace(path, '')
    )
    .filter(line => !line.includes('(internal/'));
  return result.join('\n');
};

class Reporter {
  //   options <Object>
  //     stream <stream.Writable> optional
  constructor(options) {
    this.options = Object.assign({}, options);
    if (!this.options.stream) this.options.stream = process.stdout;
  }

  record(/* test */) {
    throw new Error('Not implemented');
  }

  error(/* test, error */) {
    throw new Error('Not implemented');
  }

  finish() {
    throw new Error('Not implemented');
  }

  log() {
    throw new Error('Not implemented');
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
    this.console = Console ? new Console(this.options.stream) : console;
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
      .filter(key => res.hasOwnProperty(key))
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

  log(...args) {
    this.console.log(...args);
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

class TapReporter extends Reporter {
  constructor(options) {
    super(options);
    const writeStream = this.options.type
      ? // TODO: do .pipe(this.options.stream) as soon as TSR supports it
        new TSR(this.options.type)
      : this.options.stream;
    this.console = Console ? new Console(writeStream) : console;
    this.successful = 0;
    this.failed = 0;
    this.skipped = 0;
    this.failedTests = [];
    this.testNumeration = 0;
  }

  error(test, error) {
    // remove one success because 'error' may only be received after end
    // though the test may have already failed so we need a way to check
    // if we should do this, i.e. store map of successful tests
    // this.successes--;
    // test.todo ? this.skipped++ : this.failures++;
    // TODO(lundibundi): add test.metadata.filename here too once available
    this.listFailure(
      test,
      { message: `Failure after end: ${error ? error.message : 'no message'}` },
      ` Test failed: ${test.caption}`
    );
  }

  parseTestResults(test, offset = 0) {
    test.results.forEach((res, index) => {
      const testId = index + 1;
      if (res.type === 'subtest') {
        const t = res.test;
        const caption = t.caption || '';
        this.log(`${pad(offset)}# Subtest: ${caption}`);
        this.parseTestResults(t, offset + 4);
        const prefix = t.success ? 'ok' : 'not ok';
        this.log(`${pad(offset)}${prefix} ${testId} - ${caption}`);
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
    const expected = padLines(inspect(res.expected), offset);
    message += `${pad(offset)}wanted: ${expected}\n`;
    const actual = padLines(inspect(res.actual), offset);
    message += `${pad(offset)}found: ${actual}\n`;
    const stack = tapRenderStack(res.stack, offset + 2);
    if (test.output) {
      const output = padLines('|\n' + test.output, offset + 2);
      message += `${pad(offset)}output: ${output}\n`;
    }
    message += `${pad(offset)}stack: ${stack}\n`;
    message += `${pad(offset)}...\n`;
    this.log(message);
    if (
      this.failedTests[this.failedTests.length - 1] !==
      this.testNumeration + 1
    ) {
      this.failedTests.push(this.testNumeration);
    }
  }

  record(test) {
    if (this.testNumeration === 0) this.log('TAP version 13');
    this.testNumeration++;
    if (test.success) {
      this.successful++;
    } else if (!test.todo) {
      this.failed++;
    } else {
      this.skipped++;
    }
    const caption = test.caption || '';
    if (test.todo) {
      this.log(`\nok ${this.testNumeration} - ${caption} # TODO`);
      return;
    }
    this.log(`# Subtest: ${caption}`);
    this.parseTestResults(test, 4);
    const testPrefix = test.success ? 'ok' : 'not ok';
    this.log(`${testPrefix} ${this.testNumeration} - ${caption}`);
  }

  finish() {
    this.log(`1..${this.testNumeration}`);
    if (this.failed !== 0) {
      let testHarness = `FAILED test ${this.failedTests.join(', ')}\n`;
      const percentOfSuccess = (
        ((this.testNumeration - this.failed) / this.testNumeration) *
        100
      ).toFixed(2);
      testHarness += `Failed ${this.failed}/${this.testNumeration} tests, `;
      testHarness += `${percentOfSuccess}% okay`;
      this.log(testHarness);
    }
  }

  log(...args) {
    this.console.log(...args);
  }
}

module.exports = {
  Reporter,
  ConciseReporter,
  TapReporter,
};
