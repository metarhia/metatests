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
