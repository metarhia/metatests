'use strict';

const common = require('metarhia-common');

const speed = require('./lib/speed');
const test = require('./lib/test');

const results = {
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
  results.modules++;

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
        results.classes++;
      }
      targetType = 'method';
    } else {
      target = common.getByPath(namespaces[0], functionName);
      targetType = typeof(target);
    }
    if (targetType === 'function') results.functions++;
    else if (targetType === 'method') results.methods++;
    else results.values++;
    results.targets++;

    for (let i = 0; i < conditions.length; i++) {
      results.tests++;
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
      msg += '\n       Type: declarative';
      msg += '\n   Expected: ' + sExpected;
      msg += '\n     Actual: ' + sResult;

      if (expectedType === 'function') cmp = expected(result);
      else cmp = (sResult === sExpected);

      if (!cmp) {
        results.errors++;
        console.log('Test failed: ' + msg + '\n');
      }
    }
  }
};

const report = () => {
  const errCount = results.errors;
  const result = errCount === 0 ? 'PASSED' : 'FAILED';
  console.log(
    'Test finished with following results:' +
    '\n  Modules:   ' + results.modules +
    '\n  Targets:   ' + results.targets +
    '\n  Functions: ' + results.functions +
    '\n  Values:    ' + results.values +
    '\n  Classes:   ' + results.classes +
    '\n  Methods:   ' + results.methods +
    '\n  Tests:     ' + results.tests +
    '\n  Passed:    ' + results.passed +
    '\n  Errors:    ' + results.errors +
    '\nResult: ' + result + '\n'
  );
};

module.exports = {
  case: defineCase,
  test, speed,
  report,
  namespace: addNamespace
};
