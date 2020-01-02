'use strict';

const domain = require('domain');

const { iter } = require('@metarhia/common');

const compare = require('./compare');
const Test = require('./test');
const { DeclarativeTest } = require('./declarative-test');
const { instance: runnerInstance } = require('./runner');
const { isPromise } = require('./utils');

const kPrepareSubtestOptions = Symbol('prepareSubtestOptions');
const kRunSubtest = Symbol('runSubtest');
const kCheckRunSubtest = Symbol('checkRunSubtest');

const transformToObject = (source, sort) => {
  const constructorName = source.constructor && source.constructor.name;
  if (constructorName === 'Object' || !source[Symbol.iterator]) {
    return source;
  }
  const res = {};
  if (source instanceof Map) {
    for (const [key, v] of source) {
      res[key] = v;
    }
  } else {
    const values = [...source[Symbol.iterator]()];
    if (sort) {
      values.sort(typeof sort === 'function' ? sort : undefined);
    }
    for (const key in values) {
      res[key] = values[key];
    }
  }
  return res;
};

const transformToArray = source => {
  if (Array.isArray(source)) return source;
  return source[Symbol.iterator]
    ? [...source[Symbol.iterator]()]
    : Object.entries(source);
};

const handleEachCallback = (func, test) => {
  if (!func) {
    return Promise.resolve();
  } else if (func.length >= 2) {
    // eachFunc(test, callback)
    return new Promise(resolve => func(test, resolve));
  } else {
    // eachFunc(test): Promise
    return func(test);
  }
};

const makeSubtestResult = (test, data = {}) => {
  const res = {
    type: 'subtest',
    test,
    message: test.caption,
    ...data,
  };
  Object.defineProperty(res, 'success', {
    get: () => test.success,
  });
  return res;
};

const captureStack = () => {
  const oldLimit = Error.stackTraceLimit;
  Error.stackTraceLimit = Infinity;
  const stack = new Error().stack;
  Error.stackTraceLimit = oldLimit;
  return stack;
};

const defaultTestOptions = {
  run: true,
  async: true,
  timeout: 30000,
  parallelSubtests: false,
  dependentSubtests: false,
};

class BailoutError extends Error {}

class ImperativeTest extends Test {
  // TODO(lundibundi): Current implementaion will not fail if
  // you have any tests past the 'plan' or after 'end' but it should

  constructor(caption, func, options) {
    if (func !== null && typeof func === 'object') {
      options = func;
      func = undefined;
    }
    if (typeof caption === 'function') {
      func = caption;
      caption = undefined;
    }
    super(caption, options);

    Object.keys(defaultTestOptions)
      .filter(k => this.options[k] === undefined)
      .forEach(k => {
        this.options[k] = defaultTestOptions[k];
      });

    if (this.options.parallelSubtests && this.options.dependentSubtests) {
      throw new Error(
        'parallelSubtests and dependentSubtests are contradictory'
      );
    }

    this.subtestId = 0;
    this.subtests = new Map();
    this.subtestQueue = [];
    this.func = func;
    this.waitingSubtests = !this.func;
    this.planned = null;
    this.beforeDoneTests = 0;
    this.beforeEachFunc = null;
    this.afterEachFunc = null;

    this._setupSubtestCallbacks();

    if (this.options.timeout > 0) this._setupTimeout(this.options.timeout);

    if (this.options.run) this.run();
  }

  // #private
  _setupSubtestCallbacks() {
    const { dependentSubtests } = this.options;
    const subtestCallbackEnd = test => {
      if (this.subtestQueue.length > 0 && test.id === this.subtestQueue[0].id) {
        this.subtestQueue.shift();
        if (this.subtestQueue.length > 0) {
          if (dependentSubtests && !test.success) {
            process.nextTick(() => {
              const msg = `Dependent subtest failure: ${test.id}/${test.title}`;
              this.bailout(msg);
            });
          } else {
            this[kRunSubtest](this.subtestQueue[0]);
          }
          return;
        }
      }

      // if this test hasn't finished its function
      // (this.waitingSubtests is false) or is sync we can assume it's only
      // waiting for subtets to end, therefore try to end if there are
      // no more subtests
      if (
        !this._hasPendingSubtests() &&
        (!this.options.async || this.waitingSubtests)
      ) {
        // allow to add new tests before ending (i.e. in 'done' event)
        process.nextTick(() => {
          if (!this.done && !this._hasPendingSubtests()) this._end();
        });
      }
    };

    this._subtestCallback = test => {
      this.subtests.delete(test.id);
      this.results.push(makeSubtestResult(test));
      handleEachCallback(this.afterEachFunc, test).then(
        () => subtestCallbackEnd(test),
        err => {
          test.fail('afterEach error', err);
          test.succeeded = false;
          subtestCallbackEnd(test);
        }
      );
    };

    this._subtestErrorCallback = (test, error) => {
      const message = `Error in subtest '${test.caption}': ${error}`;
      this._record('subtest', false, message, { test, stack: error.stack });
      if (this.done) {
        this.succeeded = false;
        this.emit('error', this, error);
      }
    };
  }

  // #private
  _setupTimeout(timeout) {
    this.timeoutTimer = setTimeout(() => {
      if (this.done) return;
      if (this.planned) this._recordPlanResult(this.planned);
      const message = `Test execution time exceed timeout (${timeout})`;
      this._record('timeout', false, message, { stack: null });
      this._end();
    }, timeout);
  }

  endAfterSubtests() {
    this.waitingSubtests = true;
    process.nextTick(() => {
      if (!this._hasPendingSubtests()) this.end();
    });
  }

  beforeEach(func) {
    this.beforeEachFunc = func;
  }

  afterEach(func) {
    this.afterEachFunc = func;
  }

  [kCheckRunSubtest](test) {
    if (!this.options.parallelSubtests) {
      this.subtestQueue.push(test);
      if (this.subtestQueue.length > 1) {
        return;
      }
    }
    this[kRunSubtest](test);
  }

  [kRunSubtest](test) {
    this.subtests.set(test.id, test);
    test.on('done', this._subtestCallback);
    test.on('error', this._subtestErrorCallback);
    handleEachCallback(this.beforeEachFunc, test).then(
      context => {
        Object.assign(test.context, context);
        if (!test.done) test.run();
      },
      err => {
        test.fail('beforeEach error', err);
        test.succeeded = false;
        if (!test.done) test.end();
      }
    );
  }

  [kPrepareSubtestOptions](message, options) {
    const runner = this.options.runner;
    if (options.todo && (!runner || !runner.options.runTodo)) {
      if (this.options.dependentSubtests) {
        process.emitWarning(
          `Test '${message}' is marked as TODO and will not be` +
            ' run as Runner.runTodo is false.',
          { code: 'METATESTS_TODO_IN_DEPENDENT_TEST' }
        );
      }
      return null;
    }
    options.id = this.subtestId++;
    options.runner = runner;
    options.run = false;
    options.context = { ...this.context, ...options.context };
    return options;
  }

  test(message, func, options = {}) {
    options = this[kPrepareSubtestOptions](message, options);
    if (!options) {
      return null;
    }
    const test = new ImperativeTest(message, func, options);
    this[kCheckRunSubtest](test);
    return test;
  }

  testAsync(message, func, options = {}) {
    options.async = true;
    return this.test(message, func, options);
  }

  testSync(message, func, options = {}) {
    options.async = false;
    return this.test(message, func, options);
  }

  case(message, namespace, list, options = {}) {
    options = this[kPrepareSubtestOptions](message, options);
    if (!options) {
      return null;
    }
    const test = new DeclarativeTest(message, namespace, list, options);
    this[kCheckRunSubtest](test);
    return test;
  }

  // #private
  _check(type, testFunc, actual, expected, message) {
    const success = testFunc(actual, expected);
    this._recordPass(type, success, message, {
      expected,
      actual,
    });
  }

  same(actual, expected, message) {
    this._check('equal', compare.equal, actual, expected, message);
  }

  notEqual(actual, expected, message) {
    this._check(
      'notEqual',
      (actual, expected) => !compare.equal(actual, expected),
      actual,
      expected,
      message
    );
  }

  strictSame(actual, expected, message) {
    this._check('strictSame', compare.strictEqual, actual, expected, message);
  }

  strictNotSame(actual, expected, message) {
    this._check(
      'strictNotSame',
      (actual, expected) => !compare.strictEqual(actual, expected),
      actual,
      expected,
      message
    );
  }

  sameTopology(obj1, obj2, message) {
    this._check(
      'sameTopology',
      (obj1, obj2) => compare.sameTopology(obj1, obj2),
      obj1,
      obj2,
      message
    );
  }

  notSameTopology(obj1, obj2, message) {
    this._check(
      'sameTopology',
      (obj1, obj2) => !compare.sameTopology(obj1, obj2),
      obj1,
      obj2,
      message
    );
  }

  assert(value, message) {
    this._check('assert', value => !!value, value, true, message);
  }

  assertNot(value, message) {
    this._check('assertNot', value => !value, value, false, message);
  }

  fail(message, err) {
    if (typeof message !== 'string' && typeof err === 'undefined') {
      err = message;
      message = undefined;
    }
    this._recordPass('fail', false, message, { actual: err });
  }

  error(err, message) {
    this._check(
      'error',
      err => Object.prototype.toString.call(err) !== '[object Error]',
      err,
      null,
      message
    );
  }

  type(obj, type, message) {
    this._check(
      'type',
      ([domain, className], type) =>
        domain === type || (className && className === type),
      [typeof obj, obj && obj.constructor && obj.constructor.name],
      type,
      message
    );
  }

  isError(actual, expected = new Error(), message = undefined) {
    this._check('isError', compare.errorCompare, actual, expected, message);
  }

  throws(fn, expected = new Error(), message = undefined) {
    let actual;
    try {
      fn();
    } catch (e) {
      actual = e;
    }
    this._check('throws', compare.errorCompare, actual, expected, message);
  }

  doesNotThrow(fn, message) {
    let actual;
    try {
      fn();
    } catch (e) {
      actual = e;
    }
    this._check('doesNotThrow', actual => !actual, actual, undefined, message);
  }

  mustCall(fn = () => {}, count = 1, name = 'anonymous') {
    this.beforeDoneTests++;
    let counter = 0;
    const stack = captureStack();
    this.once('beforeDone', () => {
      const message =
        `function '${name}' was called ${counter} time(s) but ` +
        `was expected to be called ${count} time(s)`;
      const success = counter === count;
      this._recordPass('mustCall', success, message, {
        expected: count,
        actual: counter,
        stack,
      });
    });
    return (...args) => {
      counter++;
      return fn(...args);
    };
  }

  mustNotCall(fn = () => {}, name = 'anonymous') {
    this.beforeDoneTests++;
    let counter = 0;
    const stack = captureStack();
    this.once('beforeDone', () => {
      const message =
        `function '${name}' was called ${counter} time(s) ` +
        'but was not expected to be called at all';
      const success = counter === 0;
      this._recordPass('mustNotCall', success, message, {
        expected: 0,
        actual: counter,
        stack,
      });
    });
    return (...args) => {
      counter++;
      return fn(...args);
    };
  }

  contains(actual, subObj, message, sort, test = compare.strictEqual) {
    actual = transformToObject(actual, sort);
    subObj = transformToObject(subObj, sort);
    let success = true;
    for (const key in subObj) {
      success = test(actual[key], subObj[key]);
      if (!success) break;
    }
    this._recordPass('contains', success, message, {
      expected: subObj,
      actual,
    });
  }

  containsGreedy(actual, subObj, message, test = compare.strictEqual) {
    const convertedActual = transformToArray(actual);
    const convertedSubObj = transformToArray(subObj);
    let success = true;
    for (const expected of convertedSubObj) {
      success = convertedActual.some(val => test(val, expected));
      if (!success) break;
    }
    this._recordPass('containsGreedy', success, message, {
      expected: subObj,
      actual,
    });
  }

  bailout(err, message) {
    if (typeof err === 'string') {
      message = err;
      err = null;
    }
    if (err) {
      if (message) message += '\n';
      else message = '';
      message += err.toString();
    }
    this._record('bailout', false, message, {
      stack: err ? err.stack : captureStack(),
    });
    throw new BailoutError();
  }

  cb(msg, cb) {
    if (typeof msg === 'function') {
      cb = msg;
      msg = undefined;
    }
    this.beforeDoneTests++;
    return this.mustCall((err, ...res) => {
      this.error(err, msg);
      if (cb) cb(err, ...res);
    });
  }

  cbFail(fail, cb, afterAllCb) {
    if (typeof fail === 'function') {
      afterAllCb = cb;
      cb = fail;
      fail = undefined;
    }
    return this.mustCall((err, ...res) => {
      if (err) {
        this.fail(fail, err);
        this.end();
      } else if (cb) {
        this.error(err);
        cb(...res);
      }
      if (afterAllCb) afterAllCb(err);
    });
  }

  resolves(input, ...expected) {
    if (typeof input === 'function') input = input();
    return input.then(
      res => {
        this._recordPass('resolves', true, 'must resolve', { actual: res });
        if (expected.length > 0) this.strictSame(res, expected[0]);
        return res;
      },
      e => {
        const message = 'expected to be resolved, but was rejected';
        this._recordPass('resolves', false, message, { actual: e });
        throw e;
      }
    );
  }

  // Check that input is rejected.
  rejects(input, err) {
    if (typeof input === 'function') input = input();
    return input.then(
      res => {
        const message = 'expected to be rejected, but was resolved';
        this._recordPass('rejects', false, message, { actual: res });
        throw res;
      },
      e => {
        this._recordPass('rejects', true, 'must reject', { actual: e });
        this.isError(e, err);
        return e;
      }
    );
  }

  // Check whether `val` satisfies custom `checkFn` condition.
  // Signature: checkFn, val[, message]
  //   checkFn <Function> condition function
  //     val <any> provided value
  //   Returns: <boolean> true if condition is satisfied and false otherwise
  //   val <any> value to check the condition against
  //   message <string> check message, optional
  is(checkFn, val, message) {
    this._check(`is ${checkFn.name}`, checkFn, val, undefined, message);
  }

  // Check if `val` satisfies `Array.isArray`.
  // Signature: val[, message]
  //   val <any> value to check
  //   message <string> check message, optional
  isArray(val, message) {
    this.is(Array.isArray, val, message);
  }

  // Check if `val` satisfies `Buffer.isBuffer`.
  // Signature: val[, message]
  //   val <any> value to check
  //   message <string> check message, optional
  isBuffer(val, message) {
    this.is(Buffer.isBuffer, val, message);
  }

  // Test whether input matches the provided RegExp
  // Signature: regex, input[, message]
  //   regex <RegExp> | <string> pattern to match
  //   input <string> input to check
  //   message <string>
  regex(regex, input, message) {
    if (typeof regex === 'string') regex = new RegExp(regex);
    this._check(
      'regex',
      actual => regex.test(actual),
      input,
      `to match ${regex}`,
      message
    );
  }

  end() {
    if (this._hasPendingSubtests()) {
      const message = 'End called before subtests finished';
      this._record('test', false, message);
    }
    if (this.planned) {
      const message = "End called in a 'plan' test";
      this._record('test', false, message);
    }
    super.end();
  }

  // #private
  _end(error) {
    clearTimeout(this.timeoutTimer);
    const dummySubtestCallback = test => {
      this.results.push(makeSubtestResult(test));
    };
    while (this.subtestQueue.length > 0 && this.subtestQueue[0].done) {
      this.subtestQueue.shift();
    }
    iter(this.subtestQueue)
      .chain(this.subtests.values())
      .forEach(t => {
        t.removeListener('done', this._subtestCallback);
        t.on('done', dummySubtestCallback);
        t._end();
      });
    this.subtests.clear();
    this.subtestQueue = [];
    this.emit('beforeDone', this);
    super._end(error);
  }

  plan(n) {
    if (n <= 0) this.end();
    else this.planned = n;
  }

  pass(message) {
    this._recordPass('pass', true, message);
  }

  // #private
  _record(type, success, message, data = {}) {
    this.results.push({
      type,
      success,
      message,
      stack: captureStack(),
      ...data,
    });
  }

  // #private
  _recordPass(type, success, message, data) {
    this._record(type, success, message, data);
    this._passCheck();
  }

  // #private
  _passCheck() {
    if (
      this.planned &&
      this.results.length >= this.planned - this.beforeDoneTests
    ) {
      const planned = this.planned;
      this.planned = undefined;
      this.on('beforeDone', () => {
        this._recordPlanResult(planned);
      });
      this._end();
    }
  }

  // #private
  _hasPendingSubtests() {
    return this.subtests.size > 0 || this.subtestQueue.length > 0;
  }

  // #private
  _recordPlanResult(planned) {
    const actual = this.results.length;
    const message = `Expected to pass 'plan' (${planned}) number of asserts`;
    this._record('test', actual === planned, message, {
      expected: planned,
      actual,
      stack: null,
    });
  }

  on(name, listener) {
    if (name === 'done' && this.done) {
      listener(this);
    } else {
      super.on(name, listener);
    }
  }

  run() {
    let startTime = Date.now();
    const funcDomain = domain.create();
    funcDomain.on('error', e => {
      if (e instanceof BailoutError) this._end();
      else this.erroer('unhandledException', e);
    });
    process.nextTick(() => {
      startTime = Date.now();
      funcDomain.run(() => {
        this.runNow();
        if (!this.options.async) {
          this.waitingSubtests = true;
          process.nextTick(() => {
            if (!this.done && !this._hasPendingSubtests()) this.end();
          });
        }
      });
    });
    this.on('done', () => {
      this.metadata.time = Date.now() - startTime;
      funcDomain.exit();
    });
  }

  runNow() {
    if (!this.func) return;
    const res = this.func(this, this.context);
    if (isPromise(res)) {
      res.then(
        () => {
          if (this.done || this.planned) return;
          if (this._hasPendingSubtests()) this.endAfterSubtests();
          else this.end();
        },
        e => {
          this.fail('Promise rejection', e);
          if (!this.done) this.end();
        }
      );
    }
  }
}

function makeAliases(target, aliases) {
  Object.keys(aliases).forEach(method => {
    aliases[method].forEach(alias => {
      target[alias] = target[method];
    });
  });
}

makeAliases(ImperativeTest.prototype, {
  same: ['equal'],
  strictSame: ['strictEqual'],
  assert: ['ok'],
  assertNot: ['notOk'],
  resolves: ['isResolved'],
  rejects: ['isRejected'],
});

const test = (caption, func, options = {}, runner = runnerInstance) => {
  if (!runner.options.runTodo && options.todo) {
    return null;
  }
  options.runner = runner;
  const test = new ImperativeTest(caption, func, options);
  runner.addTest(test);
  return test;
};

module.exports = {
  ImperativeTest,
  test,
  testAsync: (caption, func, options = {}, runner = runnerInstance) => {
    options.async = true;
    return test(caption, func, options, runner);
  },
  testSync: (caption, func, options = {}, runner = runnerInstance) => {
    options.async = false;
    return test(caption, func, options, runner);
  },
};
