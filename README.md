# metatests

[![TravisCI](https://travis-ci.org/metarhia/metatests.svg?branch=master)](https://travis-ci.org/metarhia/metatests)
[![Codacy Badge](https://api.codacy.com/project/badge/Grade/79fc1a2a1b144e3c9283c681607b7c3f)](https://www.codacy.com/app/metarhia/metatests)
[![NPM Version](https://badge.fury.io/js/metatests.svg)](https://badge.fury.io/js/metatests)
[![NPM Downloads/Month](https://img.shields.io/npm/dm/metatests.svg)](https://www.npmjs.com/package/metatests)
[![NPM Downloads](https://img.shields.io/npm/dt/metatests.svg)](https://www.npmjs.com/package/metatests)

`metatests` is an extremely simple to use test framework and runner for Metarhia
technology stack built on the following principles:

- Test cases are files, tests are either imperative (functions) or declarative
  (arrays and structures).

- Assertions are done using the built-in Node.js `assert` module. The framework
  also provides additional testing facilities (like spies).

- Tests can be run in parallel.

- All tests are executed in isolated sandboxes. The framework allows to easily
  mock modules required by tests and provides ready-to-use mocks for timers and
  other core functionality.

- Testing asynchronous operations must be supported.

- Testing pure functions without asynchronous operations and state can be done
  without extra boilerplate code using DSL based on arrays.

  ```javascript
  mt.case(
    'Test common.duration',
    { common },
    {
      // ...
      'common.duration': [
        ['1d', 86400000],
        ['10h', 36000000],
        ['7m', 420000],
        ['13s', 13000],
        ['2d 43s', 172843000],
        // ...
      ],
      // ...
    }
  );
  ```

  ([Prior art](https://github.com/metarhia/impress/blob/a457976b86f6a846c922f9435ab33f20dfaaad30/tests/unittests/api.common.test.js))

- The framework must work in Node.js and browsers (using Webpack or any other
  module bundler that supports CommonJS modules and emulates Node.js globals).

## Contributors

- See github for full [contributors list](https://github.com/metarhia/metatests/graphs/contributors)

## API

### Interface: metatests

#### case(caption, namespace, list, runner)

- `caption`: [`<string>`][string] case caption
- `namespace`: [`<Object>`][object] namespace to use in this case test
- `list`: [`<Object>`][object] hash of [`<Array>`][array], hash keys are
  function and method names. [`<Array>`][array] contains call parameters last
  [`<Array>`][array] item is an expected result (to compare) or
  [`<Function>`][function] (pass result to compare)
- `runner`: [`<Runner>`][runner] runner for this case test, optional, default:
  `metatests.runner.instance`

Create declarative test

#### class DeclarativeTest extends Test

##### DeclarativeTest.prototype.constructor(caption, namespace, list, options)

##### DeclarativeTest.prototype.run()

##### DeclarativeTest.prototype.runNow()

#### equal(val1, val2)

#### strictEqual(val1, val2)

#### class reporters.Reporter

##### reporters.Reporter.prototype.constructor(options)

- `options`: [`<Object>`][object]
  - `stream`: `<stream.Writable>` optional

##### reporters.Reporter.prototype.error(test, error)

- `test`: `<Test>`
- `error`: [`<Error>`][error]

Fail test with error

##### reporters.Reporter.prototype.finish()

##### reporters.Reporter.prototype.log(...args)

##### reporters.Reporter.prototype.logComment(...args)

##### reporters.Reporter.prototype.record(test)

- `test`: `<Test>`

Record test

#### class reporters.ConciseReporter extends Reporter

##### reporters.ConciseReporter.prototype.constructor(options)

##### reporters.ConciseReporter.prototype.error(test, error)

##### reporters.ConciseReporter.prototype.finish()

##### reporters.ConciseReporter.prototype.listFailure(test, res, message)

##### reporters.ConciseReporter.prototype.parseTestResults(test, subtest)

##### reporters.ConciseReporter.prototype.printAssertErrorSeparator()

##### reporters.ConciseReporter.prototype.printSubtestSeparator()

##### reporters.ConciseReporter.prototype.printTestSeparator()

##### reporters.ConciseReporter.prototype.record(test)

#### class reporters.TapReporter extends Reporter

##### reporters.TapReporter.prototype.constructor(options)

##### reporters.TapReporter.prototype.error(test, error)

##### reporters.TapReporter.prototype.finish()

##### reporters.TapReporter.prototype.listFailure(test, res, offset)

##### reporters.TapReporter.prototype.logComment(...args)

##### reporters.TapReporter.prototype.parseTestResults(test, offset = 0)

##### reporters.TapReporter.prototype.record(test)

#### class runner.Runner extends EventEmitter

##### runner.Runner.prototype.constructor(options)

##### runner.Runner.prototype.addTest(test)

##### runner.Runner.prototype.finish()

##### runner.Runner.prototype.removeReporter()

##### runner.Runner.prototype.resume()

##### runner.Runner.prototype.runTodo(active = true)

##### runner.Runner.prototype.setReporter(reporter)

##### runner.Runner.prototype.wait()

#### runner.instance

- [`<Runner>`][runner]

#### speed(caption, count, tests)

#### class ImperativeTest extends Test

##### ImperativeTest.prototype.constructor(caption, func, options)

##### ImperativeTest.prototype.afterEach(func)

##### ImperativeTest.prototype.assert(value, message)

##### ImperativeTest.prototype.assertNot(value, message)

##### ImperativeTest.prototype.bailout(err, message)

##### ImperativeTest.prototype.beforeEach(func)

##### ImperativeTest.prototype.case(message, namespace, list, options = {})

##### ImperativeTest.prototype.cb(msg, cb)

##### ImperativeTest.prototype.cbFail(fail, cb, afterAllCb)

##### ImperativeTest.prototype.contains(actual, subObj, message, sort, test = compare.strictEqual)

##### ImperativeTest.prototype.containsGreedy(actual, subObj, message, test = compare.strictEqual)

##### ImperativeTest.prototype.doesNotThrow(fn, message)

##### ImperativeTest.prototype.end()

##### ImperativeTest.prototype.endAfterSubtests()

##### ImperativeTest.prototype.equal(actual, expected, message)

##### ImperativeTest.prototype.error(err, message)

##### ImperativeTest.prototype.fail(message, err)

##### ImperativeTest.prototype.is(checkFn, val\[, message\])

- `checkFn`: [`<Function>`][function] condition function
  - `val`: `<any>` provided value
- _Returns:_ [`<boolean>`][boolean] true if condition is satisfied and false
  otherwise
- `val`: `<any>` value to check the condition against
- `message`: [`<string>`][string] check message, optional

Check whether `val` satisfies custom `checkFn` condition.

##### ImperativeTest.prototype.isArray(val\[, message\])

- `val`: `<any>` value to check
- `message`: [`<string>`][string] check message, optional

Check if `val` satisfies `Array.isArray`.

##### ImperativeTest.prototype.isBuffer(val\[, message\])

- `val`: `<any>` value to check
- `message`: [`<string>`][string] check message, optional

Check if `val` satisfies `Buffer.isBuffer`.

##### ImperativeTest.prototype.isError(actual, expected = new Error(), message = undefined)

##### ImperativeTest.prototype.isRejected(input, err)

Check that input is rejected.

##### ImperativeTest.prototype.isResolved(input, ...expected)

##### ImperativeTest.prototype.mustCall()

##### ImperativeTest.prototype.mustNotCall()

##### ImperativeTest.prototype.notEqual(actual, expected, message)

##### ImperativeTest.prototype.notOk(value, message)

##### ImperativeTest.prototype.notSameTopology(obj1, obj2, message)

##### ImperativeTest.prototype.ok(value, message)

##### ImperativeTest.prototype.on(name, listener)

##### ImperativeTest.prototype.pass(message)

##### ImperativeTest.prototype.plan(n)

##### ImperativeTest.prototype.rejects(input, err)

Check that input is rejected.

##### ImperativeTest.prototype.resolves(input, ...expected)

##### ImperativeTest.prototype.run()

##### ImperativeTest.prototype.runNow()

##### ImperativeTest.prototype.same(actual, expected, message)

##### ImperativeTest.prototype.sameTopology(obj1, obj2, message)

##### ImperativeTest.prototype.strictEqual(actual, expected, message)

##### ImperativeTest.prototype.strictNotSame(actual, expected, message)

##### ImperativeTest.prototype.strictSame(actual, expected, message)

##### ImperativeTest.prototype.test(message, func, options = {})

##### ImperativeTest.prototype.testAsync(message, func, options = {})

##### ImperativeTest.prototype.testSync(message, func, options = {})

##### ImperativeTest.prototype.throws(fn, expected = new Error(), message = undefined)

##### ImperativeTest.prototype.type(obj, type, message)

#### test(caption, func, options = {}, runner = runnerInstance)

#### testSync(caption, func, options = {}, runner = runnerInstance)

#### testAsync(caption, func, options = {}, runner = runnerInstance)

[runner]: #class-runnerrunner-extends-eventemitter
[object]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object
[function]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function
[array]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array
[error]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error
[boolean]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#Boolean_type
[string]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#String_type
