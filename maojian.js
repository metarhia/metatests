'use strict';

const common = require('metarhia-common');

const report = {
  modules: 0,
  targets: 0,
  functions: 0,
  values: 0,
  classes: 0,
  methods: 0,
  tests: 0,
  passed: 0,
  errors: 0,
};

const namespaces = [];

const addNamespace = (namespace) => {
  namespaces.push(namespace);
};

const defineCase = (
  caption, // Case caption
  list // hash of Array
  // Hint: hash keys are function and method names
  // Array contains call parameters
  // last Array item is an expected result (to compare)
  // or function (pass result to compare)
) => {
  report.modules++;

  let conditions, target, targetType, targetValue, definition, msg, cmp,
      parameters, sParameters, expected, sExpected, expectedType,
      result, sResult, functionPath, className, methodName, functionName;

  const classes = [];

  for (functionName in list) {
    conditions = list[functionName];
    if (functionName.includes('.prototype.')) {
      functionPath = functionName.split('.');
      className = functionPath[0];
      methodName = functionPath[2];
      if (!classes.includes(className)) {
        classes.push(className);
        report.classes++;
      }
      targetType = 'method';
    } else {
      target = common.getByPath(namespaces[0], functionName);
      targetType = typeof(target);
    }
    if (targetType === 'function') report.functions++;
    else if (targetType === 'method') report.methods++;
    else report.values++;
    report.targets++;

    for (let i = 0; i < conditions.length; i++) {
      report.tests++;
      definition = conditions[i];

      expected = definition.pop();
      expectedType = typeof(expected);
      if (expectedType === 'function') sExpected = 'function';
      else if (expectedType === 'string') sExpected = '"' + expected + '"';
      else sExpected = JSON.stringify(expected);

      if (targetType === 'method') target = definition.shift();

      parameters = definition;
      sParameters = JSON.stringify(parameters);

      if (targetType === 'function') {
        result = target.apply(target, parameters);
      } else if (targetType === 'method') {
        result = target === null ? null : target[methodName](...parameters);
      } else {
        targetType = 'value';
        result = target;
      }

      if (result instanceof RegExp) {
        sResult = result.toString() + '';
        sResult = '"' + sResult.substring(1, sResult.length - 1) + '"';
      } else if (result instanceof Buffer) {
        sResult = result.toString();
      } else {
        sResult = JSON.stringify(result);
      }

      if (targetType === 'method') {
        targetValue = target;
        if (target === null) targetValue = '';
        else targetValue = JSON.stringify(target);
        msg = (
          targetType + ' of ' + className + ': ' +
          targetValue + '.' + methodName
        );
      } else {
        msg = targetType + ' ' + functionName;
      }

      if (targetType === 'function' || targetType === 'method') {
        msg += '(' + sParameters.substring(1, sParameters.length - 1) + ')';
      }
      msg += ', expected: ' + sExpected + ', result: ' + sResult + ' ';

      if (expectedType === 'function') cmp = expected(result);
      else cmp = (sResult === sExpected);

      if (cmp) {
        report.passed++;
        console.log(msg + 'ok');
      } else {
        report.errors++;
        console.log(msg + 'error');
      }
    }
  }
};

const executeTest = (caption, execute) => {
  console.log('Test: ' + caption);
  execute({
    test: common.emptiness,
    strictSame: common.emptiness,
    end: common.emptiness,
  });
};

const printReport = () => {
  const errCount = report.errors;
  console.log(
    '\nTest finished with following results:' +
    '\n  Modules:   ' + report.modules +
    '\n  Targets:   ' + report.targets +
    '\n  Functions: ' + report.functions +
    '\n  Values:    ' + report.values +
    '\n  Classes:   ' + report.classes +
    '\n  Methods:   ' + report.methods +
    '\n  Tests:     ' + report.tests +
    '\n  Passed:    ' + report.passed +
    '\n  Errors:    ' + report.errors +
    '\nResult: ' + errCount === 0 ? 'PASSED' : 'FAILED'
  );
};

module.exports = {
  case: defineCase,
  test: executeTest,
  print: printReport,
  namespace: addNamespace,
  speed: require('./lib/speed')
};
