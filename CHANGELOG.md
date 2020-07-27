# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to
[Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased][unreleased]

## [0.7.2][] - 2020-07-27

### Added

- `test#is(checkFn, val, message)` that allows passing custom comparator
  function to avoid using `test#assert()` that will only display `true`/`false`
  result. `test#isArray()` `test#isBuffer()` utilities for `test#is()` that
  just call it with `Array.isArray` and `Buffer.isBuffer` appropriately.
- `test.regex(regex, input, message)` to simplify checking for regex pattern
  match. This avoids using `test.assert()` and shows actual pattern/input in
  the test output.

### Changed

- cli to replace forward slash (`/`) in `--exclude` option with
  OS specific path separator.

### Fixed

- `CHANGELOG.md` Changed/Fixed title level in `0.7.1` version.
- `null`/`undefined` as uncaughtException are properly handled.

### Security

- Update project dependencies and fix security issues.

## [0.7.1][] - 2019-07-05

### Added

- This CHANGELOG.md file.
- `test.containsGreedy()` that works similar to `test.contains()` but will
  greedily search for at least one successful comparison for each element.

### Changed

- `test.contains()` to support more types. It can now be used with Array,
  Set, Map and as it was with objects and also as combinations of those types
  (i.e. compare Set and Array, Map and Object).
- Use original call stack in `test.mustCall()`/`test.mustNotCall()`
  (call stack of caller).
- Errors stringified by TapReporter won't have `!error` tag anymore which
  will result in them being displayed as simple objects in diff and avoid
  hiding necessary details.

### Fixed

- Duplicate test numbers in TapReporter 'Failed' output.

## [0.7.0][] - 2019-05-15

### Added

- Handle `test.resolves(promise)` differently from
  `test.resolves(promise, undefined)`. The former version will not check for
  `strictSame` of the promise result with `undefined` but the latter will.

### Changed

- Increase stack trace size when possible.
- Explicitly record 'rejects'/'resolves' in `test.resolves()`/`test.rejects()`.
- Change CLI waiting timeout behavior. If there are failures the process will
  now exit immediately, otherwise wait for normal process finish or exit with
  code 1 after timeout.
- Use promises in beforeEach/afterEach callback handling. This delays test
  execution and finish by 1 event loop tick respectively.
- Enforce test failure and notify of multiple `_end` calls.
- Preserve stack of original error from 'erroer' when emitting.

### Fixed

- Call `subtest._end()` on subtests in a queue upon parent `parent._end()`.

## [0.6.6][] - 2019-05-11

### Added

- `equalTopology` to compare with circular references.
- `test.sameTopology()` to use `compare.sameTopology()`.
- `test.resolves()`, `test.rejects()` utilities.
- Support promises in `test.beforeEach()`/`test.afterEach()`.

### Changed

- Add error to the `test.fail()` signature. It can now be used as
  `test.fail(msg)`, `test.fail(err)`, `test.fail(msg, err)`.
- Call `test.end()`/`test.endAfterSubtests()` on test promise resolve.
- Harden argument alias check in `test.fail()`.
- Use new `test.fail(msg, err)` interface in code.
- Rename `equalWithCircular` to `sameTopology`.
- Use `tap-yaml` in cli and to properly stringify in `TapReporter`.
- Make subtest result in parent more robust by using `test.success`.
- Move `test.context` initilization to `Test`.

### Fixed

- `test.type()` on objects with no constructor.

## [0.6.5][] - 2019-04-10

### Added

- Support for running test code in `worker_threads`.

### Changed

- Move setting default `TapReporter` type to cli.
- Output filename in case of error in `TapReporter`.

### Fixed

- Reporting of 'error' events on `Test` in `TapReporter`.

## [0.6.4][] - 2019-04-08

### Changed

- Use `yargs` instead of `commander` for cli.
- Check for incorrect values of plan.

### Fixed

- `test.plan()` + `test.mustCall()` interoperability.
- Test time report of sync test.
- Properly report plan after timeout.

## [0.6.3][] - 2019-04-01

### Fixed

- Sync `ImperativeTest` without function finish.
- `TapReporter` with timeout result.

## [0.6.2][] - 2019-03-29

### Added

- `logComment` to `Reporter` interface.
- Test execution time reporting.

### Changed

- Make `imperative.end-before-timeout` test more robust.
- Use `TapReporter` type 'tap' on nonTTY and 'classic' on TTY streams.

### Fixed

- `metadata.filepath` test not calling 'end'.

## [0.6.1][] - 2019-03-26

### Changed

- Remove usage of `console` from `Reporter`s.

## [0.6.0][] - 2019-03-25

### Added

- Unit tests.
- `TapReporter` complying to TAP 13.
- Custom exit timeout.
- 'log' inside test via 'test.log'.
- Support for `TAP` formatters.

### Changed

- Allow to run `DeclarativeTest` from `ImperativeTest`.
- Align `ImperativeTest` constructor with the usage.
- Use node `util.inspect()` if available for better test results output.
- Improve `TapReporter` output.
- Update project dependencies.
- Update `stryker` to the 1.0+.
- Make `tap-classic` default reporter.

### Removed

- Dropped CLI support for browsers.
- Dropped Node.js 6 support.

### Fixed

- Handle promise rejections from test function.
- `DeclarativeTest.constructor()` interface to comply with 'case'.

## [0.5.0][] - 2019-02-14

### Changed

- Remove 'err' argument from `test.cbFail()` callback.
- Allow to pass `afterAll` callback to `test.cbFail()`.

### Fixed

- Don't call subtest function if test ended in `test.beforeEach()`.

## [0.4.1][] - 2019-02-12

### Added

- `test.contains()` to allow partial obj checks.
- `test.cb()`/`test.cbFail()` to avoid error handling
  boilerplate code. The former will perform the `test.error()`
  check on the first passed to the callback argument and forward
  them, the latter will in case of error perform `test.fail()`,
  `test.end()` and will NOT call the supplied callback, othrwise
  calls the callback with other arguments (besides the first).

### Changed

- Add 'filename' to the `Test` metadata.
- Report 'filename' in `ConciseReporter` if available.
- Use prettier for code formatting.

### Fixed

- Don't run subtest `TODO` tests by default, respect `runTodo` in `Runner`.
- Filename resolution for renamed package directory.

## [0.4.0][] - 2018-12-19

### Added

- `todo` option for cli.

### Changed

- Allow to pass `Error` to `test.bailout`.

### Fixed

- Crash on `unhandledException` in `dependentSubtests`.
- Flakiness of `unhandledExceptions` handling test.
- Typo `unhandledExeption` -> `unhandledException`.
- Properly check `Error` instance in `test.error()`.
- Properly extract `bailout` and `dependentSubtests` tests.
- Race condition in `unhandledException` test.

## [0.3.0][] - 2018-11-21

### Added

- `test.bailout()` that will cease execution.
- `Runner.wait()`/`Runner.resume()` to postpone 'finish' report.

### Changed

- Harden `testAsync` async enforcement test.
- Make fail only report 'failed' not end test.

### Fixed

- Comparison in declarative tests.

## [0.2.4][] - 2018-11-12

### Added

- `test.plan()` tests.
- `test.mustCall()`/`test.mustNotCall()` tests.
- Setter for running 'todo' in Runner.
- Support for `dependentSubtests` option to `ImperativeTest` that will
  inform the test to stop running its subtests as soon as at least
  of them fails.

### Changed

- Add default empty lambda as 'fn' in `test.mustCall()`/`test.mustNotCall()`.

### Fixed

- Omit type of `undefined` values in `reporter`.
- `todo` test reporting.

## [0.2.3][] - 2018-11-01

### Changed

- Improve `reporter` output.
- Move `eslint` related dependencies to `devDependencies`.

## [0.2.2][] - 2018-10-31

### Added

- Simple function comparison via `toString()`.

### Changed

- Report only existing result properties.
- Replace obsolete `PhantomJS` with `ChromeHeadless`.
- Use `eslint-config-metarhia` and fix linting issues.
- Show config depending on its log level.

### Removed

- Dropped support for Node.js 9.

### Fixed

- Remove actual/expected args from unrelated checks.
- Omit 'type' while reporting `undefined` and `null`.
- Allow `Runner.reporter` to be `null`.
- Flaky 'nested test that ends after subtests'.
- Properly output `Error` instance.
- Cli incorrect exit code reporting.
- `Error` stack missing important information.

## [0.2.1][] - 2018-09-27

### Added

- Mark runner result as failed upon 'error' event.
- Return (sub)test instance on subtest creation.
- Tests to improve coverage.
- Enhance cli to support running tests in `Node.js` and browser.

### Changed

- Move failure exit from `reporter` to `runner`.
- Improve `assert` failure reporting.
- Use 'domain's to catch `unhandledExeptions` in tests.
- Slightly simplify and refactor `compare.js`.
- Update example in README.md.
- Move benchmarks from `./test` to separate folder.
- Remove external variable declarations from loops.

### Removed

- Remove unnecessary exit-code test.

### Fixed

- Add missed return in `testSync`, `testAsync` aliases.
- Remove flakiness of `setTimeout` from test.
- Don't mark finished tests as failures in `Runner`.
- Flaky `afterEach()` test.
- Make timeouted tests emit 'done', not 'error'.
- Incorrect description in example test case.

## [0.2.0][] - 2018-08-29

### Added

- New functionality.
  - Report:
    - `ConciseReporter` that just prints minimal needed info and is used
      by default.
  - Runner:
    - New runner class that currently only listens to the tests and
      progagates treir results to Reporter. Uses ConciseReporter by default.
    - Method 'addTest' adds test to current runner to observe.
    - Runner emits 'finish' event when all of the tests it observers
      have finished.
  - Case:
    - `case()` function that just creates `DeclarativeTest` and uses default
      runner if not provided.
  - Test:
    - `isError()` to check if you have received an error (previously
      you'd have to use `test.ok(err instanceof Error)` or smth similar).
    - `fail()` to fail the test immediately with specified error message.
    - `test()` that adds a subtest to this test. This test will end until
      all subtests have finished (has 2 aliases `testSync()` and
      `testAsync()`).
    - `beforeEach`() method `(test, callback)` - it will be run before each
      subtest and its result (must be object) passed to callback will
      `beforeEach()` passed to the subtest
      `(test.test('caption', (subtest, context) => {}))`.
    - `afterEach()` method `(test, callback)` - it will be run after each
      subtest and next (sequential) subtest will not be run until this
      method calls callback.
    - `endAfterSubtests()` method to automatically end this test after
      all of the subtests has finished.
    - `strictNotSame()` (same as `strictNotSame()` but for strict equality).
    - Allow to listen on test finish event `.on('done', (test) => {})`.
    - 'error' event for errors that happed after test has ended
      (signature is `(test, error)`). Example errors: check after end,
      end after end, end on test-wit-plan etc.
    - Test timeout (`30s` default) that will fail the test if it hasn't
      finished within the timeout time.

### Changed

- Refactor typeof usage for metatests.
- Refactor whole tests to remove cyclic deps.
  - get rid of cyclic dependencies between modules.
  - Namespaces:
    - Removed and replaced with per-case namespace.
  - Report:
    - Refactor `Reporter` class with general reporting functionality.
    - `report()` method no longer triggers any tests - it only reports
      overall result.
    - `record()` is called on each `Test` to parse/save the results of
      individual tests.
    - `finish()` is called by when this reporter has to finish reporting and
      possibly print some general info.
    - `error()` will be called when the error has occured after the test
      have finished.
  - Case:
    - Refactor without globals and implicit dependencies on other modules.
    - Clean up code, avoid unnecessary checks.
    - Rename to `DeclarativeTest` that implements `Test` for declarative
      tests and uses `runNow()` method to run what previously 'case' method
      did.
  - Test:
    - File renamed to `imperative-test.js`.
    - Refactor with es6 classes, clean up code and aliases.
    - Now each test is separate and therefore any test-file can be run as a
      separate program via just node (test will be by default run on
      `nextTick` if not disabled via 'run = false' option).
    - All results are recorded including successful (this will allow to
      provide rich error reporting later on and avoid unnecessary variables
      to keep track of).
    - `notOk()` is now an alias of `assetNot()` (previously it was what
      `fail()` does now).
    - `test()` method subtests can be run in parallel, it is controlled by
      the `parallelSubtests` (`false` default) option on the parent test.
    - Test plan now properly checks and finishes the test.
    - Tests can now have metadata.
    - Tests now store results of all checks in 'results'.

## [0.1.12][] - 2018-08-07

### Fixed

- Queuing tests execution.

## [0.1.11][] - 2018-06-27

### Changed

- Use eslint for tests.
- Finish test automatically if `test.plan(n)` used.

### Removed

- Remove `.bithoundrc` and `bithound` badge in `README.md`.

## [0.1.10][] - 2018-06-26

### Changed

- Display report sequential on done.

### Fixed

- Error thrown by comparing object with `null`.

## [0.1.9][] - 2018-05-24

### Changed

- Run test sequential by default.
- Change `[object Object]` representation to json.

## [0.1.8][] - 2018-05-15

### Added

- `test.type()` and `test.error()` methods.

### Changed

- Improve reporting.

## [0.1.7][] 2018-05-14

### Changed

- Move `metarhia-common` tests to same-named repo.
- Restructure modules.
- Unify reporting and shorten stack.
- Increment statistics and exit 1.

## [0.1.6][] - 2018-05-12

### Added

- Tests for `equal()`.
- Tests for `strictEqual()`.

### Fixed

- `equal()` function.
- `strictEqual()` function.

## [0.1.5][] - 2018-05-08

### Added

- `throws()` and `doesNotThrow()` methods.

## [0.1.4][] - 2018-05-07

### Fixed

- `isArray` spelling.

## [0.1.3][] - 2018-05-07

### Added

- Deep compare.

## [0.1.2][] - 2018-05-05

### Added

- API for imperative tests.

### Changed

- Render results output.

## [0.1.1][] - 2018-05-02

### Added

- Tests for metarhia-common.

### Changed

- Change badges.
- Update examples.

## [0.1.0][] - 2018-04-29

### Added

- The first version of the `metatests` package.

[unreleased]: https://github.com/metarhia/metatests/compare/v0.7.2...HEAD
[0.7.2]: https://github.com/metarhia/metatests/compare/v0.7.1...v0.7.2
[0.7.1]: https://github.com/metarhia/metatests/compare/v0.7.0...v0.7.1
[0.7.0]: https://github.com/metarhia/metatests/compare/v0.6.6...v0.7.0
[0.6.6]: https://github.com/metarhia/metatests/compare/v0.6.5...v0.6.6
[0.6.5]: https://github.com/metarhia/metatests/compare/v0.6.4...v0.6.5
[0.6.4]: https://github.com/metarhia/metatests/compare/v0.6.3...v0.6.4
[0.6.3]: https://github.com/metarhia/metatests/compare/v0.6.2...v0.6.3
[0.6.2]: https://github.com/metarhia/metatests/compare/v0.6.1...v0.6.2
[0.6.1]: https://github.com/metarhia/metatests/compare/v0.6.0...v0.6.1
[0.6.0]: https://github.com/metarhia/metatests/compare/v0.5.0...v0.6.0
[0.5.0]: https://github.com/metarhia/metatests/compare/v0.4.1...v0.5.0
[0.4.1]: https://github.com/metarhia/metatests/compare/v0.4.0...v0.4.1
[0.4.0]: https://github.com/metarhia/metatests/compare/v0.3.0...v0.4.0
[0.3.0]: https://github.com/metarhia/metatests/compare/v0.2.4...v0.3.0
[0.2.4]: https://github.com/metarhia/metatests/compare/v0.2.3...v0.2.4
[0.2.3]: https://github.com/metarhia/metatests/compare/v0.2.2...v0.2.3
[0.2.2]: https://github.com/metarhia/metatests/compare/v0.2.1...v0.2.2
[0.2.1]: https://github.com/metarhia/metatests/compare/v0.2.0...v0.2.1
[0.2.0]: https://github.com/metarhia/metatests/compare/v0.1.12...v0.2.0
[0.1.12]: https://github.com/metarhia/metatests/compare/v0.1.11...v0.1.12
[0.1.11]: https://github.com/metarhia/metatests/compare/v0.1.10...v0.1.11
[0.1.10]: https://github.com/metarhia/metatests/compare/v0.1.9...v0.1.10
[0.1.9]: https://github.com/metarhia/metatests/compare/v0.1.8...v0.1.9
[0.1.8]: https://github.com/metarhia/metatests/compare/v0.1.7...v0.1.8
[0.1.7]: https://github.com/metarhia/metatests/compare/v0.1.6...v0.1.7
[0.1.6]: https://github.com/metarhia/metatests/compare/v0.1.5...v0.1.6
[0.1.5]: https://github.com/metarhia/metatests/compare/v0.1.4...v0.1.5
[0.1.4]: https://github.com/metarhia/metatests/compare/v0.1.3...v0.1.4
[0.1.3]: https://github.com/metarhia/metatests/compare/v0.1.2...v0.1.3
[0.1.2]: https://github.com/metarhia/metatests/compare/v0.1.1...v0.1.2
[0.1.1]: https://github.com/metarhia/metatests/compare/v0.1.0...v0.1.1
[0.1.0]: https://github.com/metarhia/metatests/releases/tag/v0.1.0
