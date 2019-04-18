'use strict';

const domain = require('domain');

const compare = require('./compare');
const Test = require('./test');
const { DeclarativeTest } = require('./declarative-test');
const { instance: runnerInstance } = require('./runner');

const kPrepareSubtestOptions = Symbol('prepareSubtestOptions');
const kRunSubtest = Symbol('runSubtest');
const kCheckRunSubtest = Symbol('checkRunSubtest');

const defaultTestOptions = {
  run: true,
  async: true,
  timeout: 30000,
  context: {},
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
    this.context = this.options.context;
    this.beforeEachFunc = null;
    this.afterEachFunc = null;

    this._setupSubtestCallbacks();

    if (this.options.timeout > 0) this._setupTimeout(this.options.timeout);

    if (this.options.run) this.run();
  }

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
        this.subtests.size === 0 &&
        (!this.options.async || this.waitingSubtests)
      ) {
        // allow to add new tests before ending (i.e. in 'done' event)
        process.nextTick(() => {
          if (!this.done && this.subtests.size === 0) this._end();
        });
      }
    };

    this._subtestCallback = test => {
      this.subtests.delete(test.id);
      this.results.push({
        type: 'subtest',
        test,
        message: test.caption,
        success: test.success,
      });

      if (this.afterEachFunc) {
        this.afterEachFunc(test, () => subtestCallbackEnd(test));
      } else {
        subtestCallbackEnd(test);
      }
    };

    this._subtestErrorCallback = (test, error) => {
      const message = `Error in subtest '${test.caption}': ${error}`;
      this.results.push({
        test,
        message,
        stack: error.stack,
        type: 'subtest',
        success: false,
      });
      if (this.done) {
        this.succeeded = false;
        this.emit('error', this, error);
      }
    };
  }

  _setupTimeout(timeout) {
    this.timeoutTimer = setTimeout(() => {
      if (this.done) return;
      if (this.planned) this._recordPlanResult(this.planned);
      this.results.push({
        type: 'timeout',
        message: `Test execution time exceed timeout (${timeout})`,
        success: false,
      });
      this._end();
    }, timeout);
  }

  endAfterSubtests() {
    this.waitingSubtests = true;
    process.nextTick(() => {
      if (this.subtests.size === 0) this.end();
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
    if (this.beforeEachFunc) {
      this.beforeEachFunc(test, context => {
        Object.assign(test.context, context);
        if (!test.done) test.run();
      });
    } else {
      test.run();
    }
  }

  [kPrepareSubtestOptions](message, options) {
    const runner = this.options.runner;
    if (options.todo && (!runner || !runner.options.runTodo)) {
      if (this.options.dependentSubtests) {
        process.emitWarning(
          `Test '${message}' is marked as TODO and will not be` +
            ' run as Runner.runTodo is false.'
        );
      }
      return null;
    }
    options.id = this.subtestId++;
    options.runner = runner;
    options.run = false;
    options.context = Object.assign({}, this.context, options.context);
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

  _check(type, testFunc, actual, expected, message) {
    const success = testFunc(actual, expected);
    this.results.push({
      type,
      success,
      stack: new Error().stack,
      expected,
      actual,
      message,
    });
    this._passCheck();
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
    this.results.push({
      type: 'fail',
      success: false,
      message,
      actual: err,
      stack: new Error().stack,
    });
    this._passCheck();
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
    this.once('beforeDone', () => {
      this._check(
        'mustCall',
        (counter, count) => counter === count,
        counter,
        count,
        `function '${name}' was called ${counter} time(s) but ` +
          `was expected to be called ${count} time(s)`
      );
    });
    return (...args) => {
      counter++;
      return fn(...args);
    };
  }

  mustNotCall(fn = () => {}, name = 'anonymous') {
    this.beforeDoneTests++;
    let counter = 0;
    this.once('beforeDone', () => {
      this._check(
        'mustNotCall',
        (counter, count) => counter === count,
        counter,
        0,
        `function '${name}' was called ${counter} time(s) ` +
          'but was not expected to be called at all'
      );
    });
    return (...args) => {
      counter++;
      return fn(...args);
    };
  }

  contains(actual, subObj, message, test = compare.strictEqual) {
    let success = true;
    for (const key in subObj) {
      if (subObj.hasOwnProperty(key)) {
        success = test(actual[key], subObj[key]);
        if (!success) break;
      }
    }
    this.results.push({
      type: 'contains',
      success,
      stack: new Error().stack,
      expected: subObj,
      actual,
      message,
    });
    this._passCheck();
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
    this.results.push({
      type: 'bailout',
      success: false,
      message,
      stack: err ? err.stack : new Error().stack,
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

  end() {
    if (this.subtests.size > 0 || this.subtestQueue.length > 0) {
      this.results.push({
        success: false,
        type: 'test',
        message: 'End called before subtests finished',
      });
    }
    if (this.planned) {
      this.results.push({
        success: false,
        type: 'test',
        message: "End called in a 'plan' test",
      });
    }
    super.end();
  }

  _end(error) {
    clearTimeout(this.timeoutTimer);
    this.subtestQueue = [];
    const dummySubtestCallback = test => {
      this.results.push({
        type: 'subtest',
        test,
        message: test.caption,
        success: test.success,
      });
    };
    this.subtests.forEach(t => {
      t.removeListener('done', this._subtestCallback);
      t.on('done', dummySubtestCallback);
      t._end();
    });
    this.subtests.clear();
    this.emit('beforeDone', this);
    super._end(error);
  }

  plan(n) {
    if (n <= 0) this.end();
    else this.planned = n;
  }

  pass(message) {
    this.results.push({
      type: 'pass',
      success: true,
      message,
      stack: new Error().stack,
    });
    this._passCheck();
  }

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

  _recordPlanResult(planned) {
    const actual = this.results.length;
    this.results.push({
      success: actual === planned,
      type: 'test',
      expected: planned,
      actual,
      message: `Expected to pass 'plan' (${planned}) number of asserts`,
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
            if (!this.done && this.subtests.size === 0) this.end();
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
    if (Object.prototype.toString.call(res) === '[object Promise]') {
      res.then(
        () => {
          if (this.done || this.planned) return;
          if (this.subtests.size > 0) this.endAfterSubtests();
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
