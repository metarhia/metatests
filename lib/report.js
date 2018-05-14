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

  metatests.report = () => {
    const errCount = metatests.results.errors;
    const result = errCount === 0 ? 'PASSED' : 'FAILED';
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
  };

};
