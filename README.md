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
  - [speed](#speedcaption-count-tests)
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
    - [ImperativeTest.prototype.contains](#imperativetestprototypecontainsactual-subobj-message-sort-test--comparestrictequal)
    - [ImperativeTest.prototype.containsGreedy](#imperativetestprototypecontainsgreedyactual-subobj-message-test--comparestrictequal)
    - [ImperativeTest.prototype.doesNotThrow](#imperativetestprototypedoesnotthrowfn-message)
    - [ImperativeTest.prototype.end](#imperativetestprototypeend)
    - [ImperativeTest.prototype.endAfterSubtests](#imperativetestprototypeendaftersubtests)
    - [ImperativeTest.prototype.equal](#imperativetestprototypeequalactual-expected-message)
    - [ImperativeTest.prototype.error](#imperativetestprototypeerrorerr-message)
    - [ImperativeTest.prototype.fail](#imperativetestprototypefailmessage-err)
    - [ImperativeTest.prototype.is](#imperativetestprototypeischeckfn-val-message)
    - [ImperativeTest.prototype.isArray](#imperativetestprototypeisarrayval-message)
    - [ImperativeTest.prototype.isBuffer](#imperativetestprototypeisbufferval-message)
    - [ImperativeTest.prototype.isError](#imperativetestprototypeiserroractual-expected--new-error-message--undefined)
    - [ImperativeTest.prototype.isRejected](#imperativetestprototypeisrejectedinput-err)
    - [ImperativeTest.prototype.isResolved](#imperativetestprototypeisresolvedinput-expected)
    - [ImperativeTest.prototype.mustCall](#imperativetestprototypemustcall)
    - [ImperativeTest.prototype.mustNotCall](#imperativetestprototypemustnotcall)
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
    - [ImperativeTest.prototype.runNow](#imperativetestprototyperunnow)
    - [ImperativeTest.prototype.same](#imperativetestprototypesameactual-expected-message)
    - [ImperativeTest.prototype.sameTopology](#imperativetestprototypesametopologyobj1-obj2-message)
    - [ImperativeTest.prototype.strictEqual](#imperativetestprototypestrictequalactual-expected-message)
    - [ImperativeTest.prototype.strictNotSame](#imperativetestprototypestrictnotsameactual-expected-message)
    - [ImperativeTest.prototype.strictSame](#imperativetestprototypestrictsameactual-expected-message)
    - [ImperativeTest.prototype.test](#imperativetestprototypetestmessage-func-options--)
    - [ImperativeTest.prototype.testAsync](#imperativetestprototypetestasyncmessage-func-options--)
    - [ImperativeTest.prototype.testSync](#imperativetestprototypetestsyncmessage-func-options--)
    - [ImperativeTest.prototype.throws](#imperativetestprototypethrowsfn-expected--new-error-message--undefined)
    - [ImperativeTest.prototype.type](#imperativetestprototypetypeobj-type-message)
  - [test](#testcaption-func-options---runner--runnerinstance)
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

##### ImperativeTest.prototype.regex(regex, input\[, message\])

- `regex`: [`<RegExp>`][regexp]|[`<string>`][string] pattern to match
- `input`: [`<string>`][string] input to check
- `message`: [`<string>`][string]

Test whether input matches the provided RegExp

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

[object]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object
[function]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function
[regexp]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/RegExp
[array]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array
[error]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error
[boolean]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#Boolean_type
[string]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#String_type
[runner]: #class-runnerrunner-extends-eventemitter
