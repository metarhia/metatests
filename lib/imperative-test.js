'use strict';

const compare = require('./compare');
const Test = require('./test');
const { instance: runnerInstance } = require('./runner');

const defaultTestOptions = {
  run: true,
  async: true,
  timeout: 30000,
  context: {},
  parallelSubtests: false,
};

class ImperativeTest extends Test {

  // TODO(lundibundi): Current implementaion will not fail if
  // you have any tests past the 'plan' or after 'end' but it should

  constructor(caption, func, options) {
    super(caption, options);

    Object.keys(defaultTestOptions)
      .filter(k => this.options[k] === undefined)
      .forEach(k => this.options[k] = defaultTestOptions[k]);

    this.subtestId = 0;
    this.subtests = new Map();
    this.subtestQueue = [];
    this.func = func;
    this.waitingSubtests = !this.func;
    this.planned = null;
    this.context = this.options.context;
    this.beforeEachFunc = null;
    this.afterEachFunc = null;

    this._setupSubtestCallbacks();

    if (this.options.timeout > 0) this._setupTimeout(this.options.timeout);

    if (this.options.run) this.run();
  }

  _setupSubtestCallbacks() {
    const subtestCallbackEnd = (test) => {
      if (this.subtestQueue.length > 0 && test.id === this.subtestQueue[0].id) {
        this.subtestQueue.shift();
        if (this.subtestQueue.length > 0) {
          this._runSubtest(this.subtestQueue[0]);
          return;
        }
      }

      // if this test hasn't finished its function
      // (this.waitingSubtests is false) or is sync we can assume it's only
      // waiting for subtets to end, therefore try to end if there are
      // no more subtests
      if (this.subtests.size === 0 &&
          (!this.options.async || this.waitingSubtests)) {
        // allow to add new tests before ending (i.e. in 'done' event)
        process.nextTick(() => {
          if (!this.done && this.subtests.size === 0) this._end();
        });
      }
    };

    this._subtestCallback = (test) => {
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

    this._subtestErrorCallback = (test, message) => {
      this.results.push({
        test,
        message,
        type: 'subtest',
        success: false,
      });
      if (this.done) {
        this.succeeded = false;
        message = `Subtest ${test.id} / ${test.caption} ` +
                  `failed with: ${message}`;
        this.emit('error', this, message);
      }
    };
  }

  _setupTimeout(timeout) {
    this.timeoutTimer = setTimeout(() => {
      if (this.done) return;
      this.results.unshift({
        type: 'timeout',
        message: `Test execution time exceed timeout (${timeout})`,
        // TODO(lundibundi): once possible in common add a property of
        // Filename here to ease search of the failed test
        success: false,
      });
      this._end(new Error('Failed with timeout'));
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

  _runSubtest(test) {
    this.subtests.set(test.id, test);
    test.on('done', this._subtestCallback);
    test.on('error', this._subtestErrorCallback);
    if (this.beforeEachFunc) {
      this.beforeEachFunc(test, (context) => {
        Object.assign(test.context, context);
        test.run();
      });
    } else {
      test.run();
    }
  }

  test(message, func, options = {}) {
    const id = this.subtestId++;
    options.id = id;
    options.run = false;
    options.context = Object.assign({}, this.context, options.context);
    const test = new ImperativeTest(message, func, options);
    if (this.options.parallelSubtests) {
      this._runSubtest(test);
    } else {
      this.subtestQueue.push(test);
      if (this.subtestQueue.length === 1) {
        this._runSubtest(test);
      }
    }
  }

  testAsync(message, func, options = {}) {
    options.async = true;
    this.test(message, func, options);
  }

  testSync(message, func, options = {}) {
    options.async = false;
    this.test(message, func, options);
  }

  _check(type, testFunc, actual, expected, message) {
    const success = testFunc(actual, expected);
    this.results.push({
      type,
      success,
      stack: new Error().stack,
      expected, actual, message,
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

  fail(message) {
    // TODO(lundibundi): make fail stop the execution of the
    // whole test(including any subtests)
    this._check('fail', () => false, undefined, undefined, message);
    this._end();
  }

  error(err, message) {
    this._check(
      'error',
      (err) => !(err instanceof Error),
      err,
      null,
      message
    );
  }

  type(obj, type, message) {
    this._check(
      'type',
      ([domain, category], type) => domain === type || category === type,
      [typeof obj, obj.constructor.name],
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
        message: 'End called in a \'plan\' test',
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
    super._end(error);
  }

  plan(n) {
    this.planned = n;
  }

  pass(message) {
    this.results.push({
      type: 'pass',
      success: true,
      expected: undefined,
      actual: undefined,
      message,
      stack: new Error().stack,
    });
    this._passCheck();
  }

  _passCheck() {
    if (this.planned && this.results.length >= this.planned) {
      const success = this.results.length === this.planned;
      this.results.push({
        success,
        type: 'test',
        expected: this.planned,
        actual: this.results.length,
        message: `Expected to pass 'plan' (${this.planned}) number of asserts`,
      });
      // report plan test error only once
      if (!success) this.planned = undefined;
      this._end();
    }
  }

  on(name, listener) {
    if (name === 'done' && this.done) {
      listener(this);
    } else {
      super.on(name, listener);
    }
  }

  run() {
    process.nextTick(() => {
      this.runNow();
      if (!this.options.async) {
        this.waitingSubtests = true;
        process.nextTick(() => {
          if (!this.done && this.subtests.size === 0) this.end();
        });
      }
    });
  }

  runNow() {
    if (this.func) this.func(this, this.context);
  }
}

function makeAliases(target, aliases) {
  Object.keys(aliases).forEach(method => {
    aliases[method].forEach(alias => target[alias] = target[method]);
  });
}

makeAliases(ImperativeTest.prototype, {
  same: ['equal'],
  strictSame: ['strictEqual'],
  assert: ['ok'],
  assertNot: ['notOk'],
});

const test = (
  caption,
  func,
  options = {},
  runner = runnerInstance
) => {
  if (!runner.options.runTodo && options.todo) {
    return;
  }
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
