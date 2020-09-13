# metatests

[![CI Status Badge](https://github.com/metarhia/metatests/workflows/Testing%20CI/badge.svg?branch=master)](https://github.com/metarhia/metatests/actions?query=workflow%3A%22Testing+CI%22+branch%3Amaster)
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

- [Interface metatests](#interface-metatests)
  - [case](#casecaption-namespace-list-runner)
  - [DeclarativeTest](#class-declarativetest-extends-test)
    - [DeclarativeTest.prototype.constructor](#declarativetestprototypeconstructorcaption-namespace-list-options)
    - [DeclarativeTest.prototype.run](#declarativetestprototyperun)
    - [DeclarativeTest.prototype.runNow](#declarativetestprototyperunnow)
  - [equal](#equalval1-val2)
  - [strictEqual](#strictequalval1-val2)
  - [reporters.Reporter](#class-reportersreporter)
    - [reporters.Reporter.prototype.constructor](#reportersreporterprototypeconstructoroptions)
    - [reporters.Reporter.prototype.error](#reportersreporterprototypeerrortest-error)
    - [reporters.Reporter.prototype.finish](#reportersreporterprototypefinish)
    - [reporters.Reporter.prototype.log](#reportersreporterprototypelogargs)
    - [reporters.Reporter.prototype.logComment](#reportersreporterprototypelogcommentargs)
    - [reporters.Reporter.prototype.record](#reportersreporterprototyperecordtest)
  - [reporters.ConciseReporter](#class-reportersconcisereporter-extends-reporter)
    - [reporters.ConciseReporter.prototype.constructor](#reportersconcisereporterprototypeconstructoroptions)
    - [reporters.ConciseReporter.prototype.error](#reportersconcisereporterprototypeerrortest-error)
    - [reporters.ConciseReporter.prototype.finish](#reportersconcisereporterprototypefinish)
    - [reporters.ConciseReporter.prototype.listFailure](#reportersconcisereporterprototypelistfailuretest-res-message)
    - [reporters.ConciseReporter.prototype.parseTestResults](#reportersconcisereporterprototypeparsetestresultstest-subtest)
    - [reporters.ConciseReporter.prototype.printAssertErrorSeparator](#reportersconcisereporterprototypeprintasserterrorseparator)
    - [reporters.ConciseReporter.prototype.printSubtestSeparator](#reportersconcisereporterprototypeprintsubtestseparator)
    - [reporters.ConciseReporter.prototype.printTestSeparator](#reportersconcisereporterprototypeprinttestseparator)
    - [reporters.ConciseReporter.prototype.record](#reportersconcisereporterprototyperecordtest)
  - [reporters.TapReporter](#class-reporterstapreporter-extends-reporter)
    - [reporters.TapReporter.prototype.constructor](#reporterstapreporterprototypeconstructoroptions)
    - [reporters.TapReporter.prototype.error](#reporterstapreporterprototypeerrortest-error)
    - [reporters.TapReporter.prototype.finish](#reporterstapreporterprototypefinish)
    - [reporters.TapReporter.prototype.listFailure](#reporterstapreporterprototypelistfailuretest-res-offset)
    - [reporters.TapReporter.prototype.logComment](#reporterstapreporterprototypelogcommentargs)
    - [reporters.TapReporter.prototype.parseTestResults](#reporterstapreporterprototypeparsetestresultstest-offset--0)
    - [reporters.TapReporter.prototype.record](#reporterstapreporterprototyperecordtest)
  - [runner.Runner](#class-runnerrunner-extends-eventemitter)
    - [runner.Runner.prototype.constructor](#runnerrunnerprototypeconstructoroptions)
    - [runner.Runner.prototype.addTest](#runnerrunnerprototypeaddtesttest)
    - [runner.Runner.prototype.finish](#runnerrunnerprototypefinish)
    - [runner.Runner.prototype.removeReporter](#runnerrunnerprototyperemovereporter)
    - [runner.Runner.prototype.resume](#runnerrunnerprototyperesume)
    - [runner.Runner.prototype.runTodo](#runnerrunnerprototyperuntodoactive--true)
    - [runner.Runner.prototype.setReporter](#runnerrunnerprototypesetreporterreporter)
    - [runner.Runner.prototype.wait](#runnerrunnerprototypewait)
  - [runner.instance](#runnerinstance)
  - [speed](#speedcaption-count-cases)
  - [measure](#measurecases-options)
  - [convertToCsv](#converttocsvresults)
  - [ImperativeTest](#class-imperativetest-extends-test)
    - [ImperativeTest.prototype.constructor](#imperativetestprototypeconstructorcaption-func-options)
    - [ImperativeTest.prototype.afterEach](#imperativetestprototypeaftereachfunc)
    - [ImperativeTest.prototype.assert](#imperativetestprototypeassertvalue-message)
    - [ImperativeTest.prototype.assertNot](#imperativetestprototypeassertnotvalue-message)
    - [ImperativeTest.prototype.bailout](#imperativetestprototypebailouterr-message)
    - [ImperativeTest.prototype.beforeEach](#imperativetestprototypebeforeeachfunc)
    - [ImperativeTest.prototype.case](#imperativetestprototypecasemessage-namespace-list-options--)
    - [ImperativeTest.prototype.cb](#imperativetestprototypecbmsg-cb)
    - [ImperativeTest.prototype.cbFail](#imperativetestprototypecbfailfail-cb-afterallcb)
    - [ImperativeTest.prototype.contains](#imperativetestprototypecontainsactual-subobj-message-sort-test)
    - [ImperativeTest.prototype.containsGreedy](#imperativetestprototypecontainsgreedyactual-subobj-message-sort-test)
    - [ImperativeTest.prototype.doesNotThrow](#imperativetestprototypedoesnotthrowfn-message)
    - [ImperativeTest.prototype.end](#imperativetestprototypeend)
    - [ImperativeTest.prototype.endAfterSubtests](#imperativetestprototypeendaftersubtests)
    - [ImperativeTest.prototype.equal](#imperativetestprototypeequalactual-expected-message)
    - [ImperativeTest.prototype.error](#imperativetestprototypeerrorerr-message)
    - [ImperativeTest.prototype.fail](#imperativetestprototypefailmessage-err)
    - [ImperativeTest.prototype.is](#imperativetestprototypeischeckfn-val-message)
    - [ImperativeTest.prototype.isArray](#imperativetestprototypeisarrayval-message)
    - [ImperativeTest.prototype.isBuffer](#imperativetestprototypeisbufferval-message)
    - [ImperativeTest.prototype.isError](#imperativetestprototypeiserroractual-expected-message)
    - [ImperativeTest.prototype.isRejected](#imperativetestprototypeisrejectedinput-err)
    - [ImperativeTest.prototype.isResolved](#imperativetestprototypeisresolvedinput-expected)
    - [ImperativeTest.prototype.mustCall](#imperativetestprototypemustcallfn-count-name)
    - [ImperativeTest.prototype.mustNotCall](#imperativetestprototypemustnotcallfn-name)
    - [ImperativeTest.prototype.notEqual](#imperativetestprototypenotequalactual-expected-message)
    - [ImperativeTest.prototype.notOk](#imperativetestprototypenotokvalue-message)
    - [ImperativeTest.prototype.notSameTopology](#imperativetestprototypenotsametopologyobj1-obj2-message)
    - [ImperativeTest.prototype.ok](#imperativetestprototypeokvalue-message)
    - [ImperativeTest.prototype.on](#imperativetestprototypeonname-listener)
    - [ImperativeTest.prototype.pass](#imperativetestprototypepassmessage)
    - [ImperativeTest.prototype.plan](#imperativetestprototypeplann)
    - [ImperativeTest.prototype.regex](#imperativetestprototyperegexregex-input-message)
    - [ImperativeTest.prototype.rejects](#imperativetestprototyperejectsinput-err)
    - [ImperativeTest.prototype.resolves](#imperativetestprototyperesolvesinput-expected)
    - [ImperativeTest.prototype.run](#imperativetestprototyperun)
    - [ImperativeTest.prototype.same](#imperativetestprototypesameactual-expected-message)
    - [ImperativeTest.prototype.sameTopology](#imperativetestprototypesametopologyobj1-obj2-message)
    - [ImperativeTest.prototype.strictEqual](#imperativetestprototypestrictequalactual-expected-message)
    - [ImperativeTest.prototype.strictNotSame](#imperativetestprototypestrictnotsameactual-expected-message)
    - [ImperativeTest.prototype.strictSame](#imperativetestprototypestrictsameactual-expected-message)
    - [ImperativeTest.prototype.test](#imperativetestprototypetestcaption-func-options)
    - [ImperativeTest.prototype.testAsync](#imperativetestprototypetestasyncmessage-func-options--)
    - [ImperativeTest.prototype.testSync](#imperativetestprototypetestsyncmessage-func-options--)
    - [ImperativeTest.prototype.throws](#imperativetestprototypethrowsfn-expected-message)
    - [ImperativeTest.prototype.type](#imperativetestprototypetypeobj-type-message)
  - [test](#testcaption-func-options-runner)
  - [testSync](#testsynccaption-func-options---runner--runnerinstance)
  - [testAsync](#testasynccaption-func-options---runner--runnerinstance)

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

#### speed(caption, count, cases)

- `caption`: [`<string>`][string] name of the benchmark
- `count`: [`<number>`][number] amount of times ro run each function
- `cases`: [`<Array>`][array] functions to check

Microbenchmark each passed function and compare results.

#### measure(cases\[, options\])

- `cases`: [`<Array>`][array] cases to test, each case contains
  - `fn`: [`<Function>`][function] function to check, will be called with each
    args provided
  - `name`: [`<string>`][string] case name, function.name by default
  - `argCases`: [`<Array>`][array] array of arguments to create runs with. When
    omitted `fn` will be run once without arguments. Total amount of runs will
    be `runs * argCases.length`.
  - `n`: [`<number>`][number] number of times to run the test, defaultCount from
    options by default
- `options`: [`<Object>`][object]
  - `defaultCount`: [`<number>`][number] number of times to run the function by
    default, default: 1e6
  - `runs`: [`<number>`][number] number of times to run the case, default: 20
  - `preflight`: [`<number>`][number] number of times to pre-run the case for
    each set of arguments, default: 10
  - `preflightCount`: [`<number>`][number] number of times to run the function
    in the preflight stage, default: 1e4
  - `listener`: [`<Object>`][object] appropriate function will be called to
    report events, optional
    - `preflight`: [`<Function>`][function] called when preflight is starting,
      optional
      - `name`: [`<string>`][string] case name
      - `count`: [`<number>`][number] number of times it will be run
      - `args`: [`<Array>`][array] function arguments
    - `run`: [`<Function>`][function] called when run is starting, optional
      - `name`: [`<string>`][string] case name
      - `count`: [`<number>`][number] number of times it will be run
      - `args`: [`<Array>`][array] function arguments
    - `cycle`: [`<Function>`][function] called when run is done, optional
      - `name`: [`<string>`][string] case name
      - `result`: [`<Object>`][object] case results
    - `done`: [`<Function>`][function] called when all runs for given
      configurations are done, optional
      - `name`: [`<string>`][string] case name
      - `args`: [`<Array>`][array] current configuration
      - `results`: [`<Array>`][array] results of all runs with this
        configuration
    - `finish`: [`<Function>`][function] called when measuring is finished,
      optional
      - `results`: [`<Array>`][array] all case results

_Returns:_ [`<Array>`][array] results of all cases as objects of structure

- `name`: [`<string>`][string] case name
- `args`: [`<Array>`][array] arguments for this run
- `count`: [`<number>`][number] number of times case was run
- `time`: [`<number>`][number] time in nanoseconds it took to make `count` runs
- `result`: `<any>` result of one of the runs

Microbenchmark each passed configuration multiple times

#### convertToCsv(results)

- `results`: [`<Array>`][array] all results from `measure` run

_Returns:_ [`<string>`][string] valid CSV representation of the results

Convert metatests.measure result to csv.

#### class ImperativeTest extends Test

##### ImperativeTest.prototype.constructor(caption, func, options)

##### ImperativeTest.prototype.afterEach(func)

- `func`: [`<Function>`][function]
  - `subtest`: `<ImperativeTest>` test instance
  - `callback`: [`<Function>`][function]
  - _Returns:_ [`<Promise>`][promise]|`<void>`

Set a function to run after each subtest.

The function must either return a promise or call a callback.

##### ImperativeTest.prototype.assert(value\[, message\])

- `value`: `<any>` value to check
- `message`: [`<string>`][string] description of the check, optional

Check if value is truthy.

##### ImperativeTest.prototype.assertNot(value\[, message\])

- `value`: `<any>` value to check
- `message`: [`<string>`][string] description of the check, optional

Check if value is falsy.

##### ImperativeTest.prototype.bailout(\[err\]\[, message\])

- `err`: [`<Error>`][error] bailout error
- `message`: [`<string>`][string] bailout message

Fail this test and throw an error.

If both `err` and `message` are provided `err.toString()` will be appended to
`message`.

##### ImperativeTest.prototype.beforeEach(func)

- `func`: [`<Function>`][function]
  - `subtest`: `<ImperativeTest>` test instance
  - `callback`: [`<Function>`][function]
    - `context`: `<any>` context of the test. It will pe passed as a second
      argument to test function and is available at `test.context`
  - _Returns:_ [`<Promise>`][promise]|`<void>` nothing or `Promise` resolved
    with context

Set a function to run before each subtest.

The function must either return a promise or call a callback.

##### ImperativeTest.prototype.case(message, namespace, list, options = {})

Create a declarative [`case()`][case()] subtest of this test.

##### ImperativeTest.prototype.cb(\[msg\]\[, cb\])

- `msg`: [`<string>`][string] test.error message
- `cb`: [`<Function>`][function] callback function

_Returns:_ [`<Function>`][function] function to pass to callback

Create error-first callback wrapper to perform automatic checks.

This will check for [`test.mustCall()`][test.mustcall()] the callback and
`{test.error()}` the first callback argument.

##### ImperativeTest.prototype.cbFail(\[fail\]\[, cb\[, afterAllCb\]\])

- `fail`: [`<string>`][string] test.fail message
- `cb`: [`<Function>`][function] callback function to call if there was no error
- `afterAllCb`: [`<Function>`][function] function called after callback handling

_Returns:_ [`<Function>`][function] function to pass to callback

Create error-first callback wrapper to fail test if call fails.

This will check for [`test.mustCall()`][test.mustcall()] the callback and if the
call errored will use `{test.fail()}` and `{test.end()}`

##### ImperativeTest.prototype.contains(actual, subObj\[, message\[, sort\[, test\]\]\])

- `actual`: `<any>` actual data
- `subObj`: `<any>` expected properties
- `message`: [`<string>`][string] description of the check, optional
- `sort` <boolean | Function> if true or a sort function sort data properties,
  default: false
- `test`: [`<Function>`][function] test function, default: compare.strictEqual
  - `actual`: `<any>`
  - `expected`: `<any>`
  - _Returns:_ [`<boolean>`][boolean] true if actual is equal to expected, false
    otherwise

Check that actual contains all properties of subObj.

Properties will be compared with test function.

##### ImperativeTest.prototype.containsGreedy(actual, subObj\[, message\[, sort\[, test\]\]\])

- `actual`: `<any>` actual data
- `subObj`: `<any>` expected properties
- `message`: [`<string>`][string] description of the check, optional
- `test`: [`<Function>`][function] test function, default: compare.strictEqual
  - `actual`: `<any>`
  - `expected`: `<any>`
  - _Returns:_ [`<boolean>`][boolean] true if actual is equal to expected, false
    otherwise

Check greedily that actual contains all properties of subObj.

Similar to [`test.contains()`][test.contains()] but will succeed if at least one
of the properties in actual match the one in subObj.

##### ImperativeTest.prototype.doesNotThrow(fn\[, message\])

- `fn`: [`<Function>`][function] function to run
- `message`: [`<string>`][string] description of the check, optional

Check that fn doesn't throw.

##### ImperativeTest.prototype.end()

Finish the test.

This will fail if the test has unfinished subtests or plan is not complete.

##### ImperativeTest.prototype.endAfterSubtests()

Mark this test to call end after its subtests are done.

##### ImperativeTest.prototype.equal(actual, expected\[, message\])

- `actual`: `<any>` actual data
- `expected`: `<any>` expected data
- `message`: [`<string>`][string] description of the check, optional

Compare actual and expected for non-strict equality.

##### ImperativeTest.prototype.error(err\[, message\])

- `err`: `<any>` error to check
- `message`: [`<string>`][string] description of the check, optional

Fail if err is instance of Error.

##### ImperativeTest.prototype.fail(\[message\]\[, err\])

- `message` <string | Error> failure message or error, optional
- `err`: [`<Error>`][error] error, optional

Fail this test recording failure message.

This doesn't call [`test.end()`][test.end()].

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

##### ImperativeTest.prototype.isError(actual\[, expected\[, message\]\])

- `actual`: `<any>` actual error to compare
- `expected`: `<any>` expected error, default: new Error()
- `message`: [`<string>`][string] description of the check, optional

Check if actual is equal to expected error.

##### ImperativeTest.prototype.isRejected(input, err)

- `input` <Promise | Function> promise of function returning thenable
- `err`: `<any>` value to be checked with [`test.isError()`][test.iserror()]
  against rejected value

Check that input rejects.

##### ImperativeTest.prototype.isResolved(input\[, expected\])

- `input` <Promise | Function> promise of function returning thenable
- `expected`: `<any>` if passed it will be checked with
  [`test.strictSame()`][test.strictsame()] against resolved value

Verify that input resolves.

##### ImperativeTest.prototype.mustCall(\[fn\[, count\[, name\]\]\])

- `fn`: [`<Function>`][function] function to be checked, default: () => {}
- `count`: [`<number>`][number] amount of times fn must be called, default: 1
- `name`: [`<string>`][string] name of the function, default: 'anonymous'

_Returns:_ [`<Function>`][function] function to check with, will forward all
arguments to fn, and result from fn

Check that fn is called specified amount of times.

##### ImperativeTest.prototype.mustNotCall(\[fn\[, name\]\])

- `fn`: [`<Function>`][function] function to not be checked, default: () => {}
- `name`: [`<string>`][string] name of the function, default: 'anonymous'

_Returns:_ [`<Function>`][function] function to check with, will forward all
arguments to fn, and result from fn

Check that fn is not called.

##### ImperativeTest.prototype.notEqual(actual, expected\[, message\])

- `actual`: `<any>` actual data
- `expected`: `<any>` expected data
- `message`: [`<string>`][string] description of the check, optional

Compare actual and expected for non-strict not-equality.

##### ImperativeTest.prototype.notOk(value\[, message\])

- `value`: `<any>` value to check
- `message`: [`<string>`][string] description of the check, optional

Check if value is falsy.

##### ImperativeTest.prototype.notSameTopology(obj1, obj2\[, message\])

- `obj1`: `<any>` actual data
- `obj2`: `<any>` expected data
- `message`: [`<string>`][string] description of the check, optional

Compare actual and expected to not have the same topology.

##### ImperativeTest.prototype.ok(value\[, message\])

- `value`: `<any>` value to check
- `message`: [`<string>`][string] description of the check, optional

Check if value is truthy.

##### ImperativeTest.prototype.on(name, listener)

##### ImperativeTest.prototype.pass(\[message\])

- `message`: [`<string>`][string] message to record

Record a passing assertion.

##### ImperativeTest.prototype.plan(n)

- `n`: [`<number>`][number] amount of assertions

Plan this test to have exactly n assertions and end test after

this amount of assertions is reached.

##### ImperativeTest.prototype.regex(regex, input\[, message\])

- `regex`: [`<RegExp>`][regexp]|[`<string>`][string] pattern to match
- `input`: [`<string>`][string] input to check
- `message`: [`<string>`][string]

Test whether input matches the provided RegExp.

##### ImperativeTest.prototype.rejects(input, err)

- `input` <Promise | Function> promise of function returning thenable
- `err`: `<any>` value to be checked with [`test.isError()`][test.iserror()]
  against rejected value

Check that input rejects.

##### ImperativeTest.prototype.resolves(input\[, expected\])

- `input` <Promise | Function> promise of function returning thenable
- `expected`: `<any>` if passed it will be checked with
  [`test.strictSame()`][test.strictsame()] against resolved value

Verify that input resolves.

##### ImperativeTest.prototype.run()

Start running the test.

##### ImperativeTest.prototype.same(actual, expected\[, message\])

- `actual`: `<any>` actual data
- `expected`: `<any>` expected data
- `message`: [`<string>`][string] description of the check, optional

Compare actual and expected for non-strict equality.

##### ImperativeTest.prototype.sameTopology(obj1, obj2\[, message\])

- `obj1`: `<any>` actual data
- `obj2`: `<any>` expected data
- `message`: [`<string>`][string] description of the check, optional

Compare actual and expected to have same topology.

Useful for comparing objects with circular references for equality.

##### ImperativeTest.prototype.strictEqual(actual, expected\[, message\])

- `actual`: `<any>` actual data
- `expected`: `<any>` expected data
- `message`: [`<string>`][string] description of the check, optional

Compare actual and expected for strict equality.

##### ImperativeTest.prototype.strictNotSame(actual, expected\[, message\])

- `actual`: `<any>` actual data
- `expected`: `<any>` expected data
- `message`: [`<string>`][string] description of the check, optional

Compare actual and expected for strict non-equality.

##### ImperativeTest.prototype.strictSame(actual, expected\[, message\])

- `actual`: `<any>` actual data
- `expected`: `<any>` expected data
- `message`: [`<string>`][string] description of the check, optional

Compare actual and expected for strict equality.

##### ImperativeTest.prototype.test(caption, func, options)

- `caption`: [`<string>`][string] name of the test
- `func`: [`<Function>`][function] test function
  - `test`: `<ImperativeTest>` test instance
- `options`: `<TestOptions>`
  - `run`: [`<boolean>`][boolean] auto start test, default: true
  - `async`: [`<boolean>`][boolean] if true do nothing, if false auto-end test
    on nextTick after `func` run, default: true
  - `timeout`: [`<number>`][number] time in milliseconds after which test is
    considered timeouted.
  - `parallelSubtests`: [`<boolean>`][boolean] if true subtests will be run in
    parallel, otherwise subtests are run sequentially, default: false
  - `dependentSubtests`: [`<boolean>`][boolean] if true each subtest will be
    executed sequentially in order of addition to the parent test
    short-circuiting if any subtest fails, default: false

_Returns:_ `<ImperativeTest>` subtest instance

Create a subtest of this test.

If the subtest fails this test will fail as well.

##### ImperativeTest.prototype.testAsync(message, func, options = {})

Create an asynchronous subtest of this test.

Simple wrapper for [`test.test()`][test.test()] setting `async` option to
`true`.

##### ImperativeTest.prototype.testSync(message, func, options = {})

Create a synchronous subtest of this test

Simple wrapper for [`test.test()`][test.test()] setting `async` option to
`false`.

##### ImperativeTest.prototype.throws(fn\[, expected\[, message\]\])

- `fn`: [`<Function>`][function] function to run
- `expected`: `<any>` expected error, default: new Error()
- `message`: [`<string>`][string] description of the check, optional

Check that fn throws expected error.

##### ImperativeTest.prototype.type(obj, type\[, message\])

- `obj`: `<any>` value to check
- `type` <string | Function> class or class name to check
- `message`: [`<string>`][string] description of the check, optional

Check if obj is of specified type.

#### test(caption, func\[, options\[, runner\]\])

- `caption`: [`<string>`][string] name of the test
- `func`: [`<Function>`][function] test function
  - `test`: `<ImperativeTest>` test instance
- `options`: `<TestOptions>`
  - `run`: [`<boolean>`][boolean] auto start test, default: true
  - `async`: [`<boolean>`][boolean] if true do nothing, if false auto-end test
    on nextTick after `func` run, default: true
  - `timeout`: [`<number>`][number] time in milliseconds after which test is
    considered timeouted.
  - `parallelSubtests`: [`<boolean>`][boolean] if true subtests will be run in
    parallel, otherwise subtests are run sequentially, default: false
  - `dependentSubtests`: [`<boolean>`][boolean] if true each subtest will be
    executed sequentially in order of addition to the parent test
    short-circuiting if any subtest fails, default: false
- `runner`: [`<Runner>`][runner] runner instance to use to run this test

_Returns:_ `<ImperativeTest>` test instance

Create a test case.

#### testSync(caption, func, options = {}, runner = runnerInstance)

Create a synchronous test

Simple wrapper for [`test()`][test()] setting `async` option to `false`.

#### testAsync(caption, func, options = {}, runner = runnerInstance)

Create an asynchronous test

Simple wrapper for [`test()`][test()] setting `async` option to `true`.

[object]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object
[function]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function
[regexp]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/RegExp
[promise]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise
[array]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array
[error]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error
[boolean]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#Boolean_type
[number]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#Number_type
[string]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#String_type
[runner]: #class-runnerrunner-extends-eventemitter
[test()]: #testcaption-func-options-runner
[test.test()]: #imperativetestprototypetestcaption-func-options
[test.strictsame()]: #imperativetestprototypestrictsameactual-expected-message
[test.contains()]: #imperativetestprototypecontainsactual-subobj-message-sort-test
[test.mustcall()]: #imperativetestprototypemustcallfn-count-name
[test.iserror()]: #imperativetestprototypeiserroractual-expected-message
[test.end()]: #imperativetestprototypeend
[case()]: #casecaption-namespace-list-runner
