'use strict';

const common = require('metarhia-common');

module.exports = (metatests) => {

  metatests.case = (
    caption, // Case caption
    list // hash of Array
    // Hint: hash keys are function and method names
    // Array contains call parameters
    // last Array item is an expected result (to compare)
    // or function (pass result to compare)
  ) => {
    metatests.results.modules++;

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
          metatests.results.classes++;
        }
        targetType = 'method';
      } else {
        target = common.getByPath(metatests.namespaces[0], functionName);
        targetType = typeof(target);
      }
      if (targetType === 'function') metatests.results.functions++;
      else if (targetType === 'method') metatests.results.methods++;
      else metatests.results.values++;
      metatests.results.targets++;

      for (let i = 0; i < conditions.length; i++) {
        metatests.results.tests++;
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

        if (expectedType === 'function') cmp = expected(result);
        else cmp = (sResult === sExpected);

        if (!cmp) {
          metatests.results.errors++;
          metatests.fail({
            caption: 'Test failed',
            type: 'declarative',
            actual: sResult,
            expected: sExpected,
            message: msg,
            stack: new Error().stack
          });
        }

      }
    }
  };

};
