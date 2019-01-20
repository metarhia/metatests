'use strict';

const { capitalize } = require('@metarhia/common');

const LINE_LENGTH = 12;

const lpad = (s, count, char = ' ') => char.repeat(count - s.length) + s;

const line = (title, s) => '\n' + lpad(`${title}: `, LINE_LENGTH) + s;

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
  constructor(options) {
    this.options = Object.assign({}, options);
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
            else value = JSON.stringify(value, null, 2);
          }
          if (value !== 'undefined' && value !== 'null' && !isError) {
            value += ` is ${type}`;
          }
        }
        s += line(capitalize(key), value);
      });
    console.log(`${s}\n`);
  }

  record(test) {
    if (test.success) this.successful++;
    else if (!test.todo) this.failed++;
    else this.skipped++;
    this.parseTestResults(test);
  }

  finish() {
    this.printTestSeparator();
    console.log(
      'Tests finished: ' +
        `[+${this.successful} | -${this.failed} | ~${this.skipped}]\n` +
        'Asserts:        ' +
        `[+${this.successfulAsserts} | -${this.failedAsserts}]`
    );
  }

  printTestSeparator() {
    console.log('='.repeat(60));
  }

  printSubtestSeparator() {
    console.log('~'.repeat(60));
  }

  printAssertErrorSeparator() {
    console.log('-'.repeat(60));
  }
}

module.exports = {
  Reporter,
  ConciseReporter,
};
