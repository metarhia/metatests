'use strict';

const domain = require('domain');
const common = require('metarhia-common');

const Test = require('./test');
const { instance: runnerInstance } = require('./runner');

const defaultOptions = {
  run: true,
};

class DeclarativeTest extends Test {
  constructor(caption, list, namespace) {
    super(caption);
    this.list = list;
    this.namespace = namespace;

    Object.keys(defaultOptions)
      .filter(k => this.options[k] === undefined)
      .forEach(k => this.options[k] = defaultOptions[k]);

    if (this.options.run) this.run();
  }

  run() {
    process.nextTick(() => {
      const funcDomain = domain.create();
      funcDomain.on('error', e => this.erroer('unhandledExeption', e));
      funcDomain.run(() => this.runNow());
      this.on('done', () => funcDomain.exit());
    });
  }

  runNow() {
    for (const functionName in this.list) {
      const conditions = this.list[functionName];
      let className, methodName, target, targetType;

      if (functionName.includes('.prototype.')) {
        const functionPath = functionName.split('.');
        className = functionPath[0];
        methodName = functionPath[2];
        targetType = 'method';
      } else {
        target = common.getByPath(this.namespace, functionName);
        targetType = typeof target;
      }

      for (let i = 0; i < conditions.length; i++) {
        const definition = conditions[i];

        const expected = definition.pop();
        const expectedType = typeof expected;

        let sExpected;
        if (expectedType === 'function') sExpected = 'function';
        else if (expectedType === 'string') sExpected = '"' + expected + '"';
        else sExpected = JSON.stringify(expected);

        if (targetType === 'method') target = definition.shift();

        const parameters = definition;
        const sParameters = JSON.stringify(parameters);

        let result;
        if (targetType === 'function') {
          result = target.apply(target, parameters);
        } else if (targetType === 'method') {
          result = target === null ? null : target[methodName](...parameters);
        } else {
          targetType = 'value';
          result = target;
        }

        let sResult;
        if (result instanceof RegExp) {
          sResult = result.toString();
          sResult = `"${sResult.substring(1, sResult.length - 1)}"`;
        } else if (result instanceof Buffer) {
          sResult = result.toString();
        } else {
          sResult = JSON.stringify(result);
        }

        let msg;
        if (targetType === 'method') {
          const targetValue = target === null ? '' : JSON.stringify(target);
          msg = `${targetType} of ${className}: ${targetValue}.${methodName}`;
        } else {
          msg = `${targetType} ${functionName}`;
        }

        if (targetType === 'function' || targetType === 'method') {
          msg += `(${sParameters.substring(1, sParameters.length - 1)})`;
        }

        const success = expectedType === 'function' ?
          expected(result) :
          (sResult === sExpected);

        this.results.push({
          success,
          caption: this.caption || 'case test failed',
          type: 'declarative',
          actual: sResult,
          expected: sExpected,
          message: msg,
          stack: new Error().stack
        });
      }
    }
    this.end();
  }
}

const checkCase = (
  caption, // Case caption
  namespace, // namespace to use in this case test
  list, // hash of Array
  // Hint: hash keys are function and method names
  // Array contains call parameters
  // last Array item is an expected result (to compare)
  // or function (pass result to compare)
  runner = runnerInstance // runner for this case test
) => {
  const test = new DeclarativeTest(caption, list, namespace);
  runner.addTest(test);
  return test;
};

module.exports = {
  case: checkCase,
  DeclarativeTest,
};
