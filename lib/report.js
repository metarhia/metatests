'use strict';

module.exports = (metatests) => {

  metatests.results = {
    modules: 0,
    targets: 0,
    functions: 0,
    values: 0,
    classes: 0,
    methods: 0,
    tests: 0,
    errors: 0,
  };

  const renderStack = stack => {
    const path = process.cwd();
    const lines = stack.split('\n');
    lines.splice(1, 1);
    const result = lines.map((line, i) => (
      ' '.repeat(i ? 12 : 0) +
      line.trim().replace(/at /g, '').replace(path, '')
    )).filter(line => !line.includes('(internal/'));
    return result.join('\n');
  };

  metatests.report = () => {
    const errCount = metatests.results.errors;
    const failed = errCount === 0;
    const result = failed ? 'PASSED' : 'FAILED';
    console.log(
      'Test finished with following metatests.results:' +
      '\n  Modules:   ' + metatests.results.modules +
      '\n  Targets:   ' + metatests.results.targets +
      '\n  Functions: ' + metatests.results.functions +
      '\n  Values:    ' + metatests.results.values +
      '\n  Classes:   ' + metatests.results.classes +
      '\n  Methods:   ' + metatests.results.methods +
      '\n  Tests:     ' + metatests.results.tests +
      '\n  Errors:    ' + metatests.results.errors +
      '\nResult: ' + result + '\n'
    );
    if (failed) process.exit(1);
  };

  metatests.fail = (reason) => {
    let message = 'Test failed: ' + reason.caption;
    if (reason.counter) {
      message += '\n   Subtests: ' + reason.counter + ' passed';
    }
    message += '\n       Type: ' + reason.type;
    message += '\n     Actual: ' + reason.actual;
    message += '\n   Expected: ' + reason.expected;
    if (reason.message) {
      message += '\n    Message: ' + reason.message;
    }
    if (reason.stack) {
      message += '\n      Stack: ' + renderStack(reason.stack);
    }
    console.log(message + '\n');
  };

};
