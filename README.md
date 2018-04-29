# metatest

[![TravisCI](https://travis-ci.org/metarhia/metatest.svg?branch=master)](https://travis-ci.org/metarhia/metatest)
[![bitHound](https://www.bithound.io/github/metarhia/metatest/badges/score.svg)](https://www.bithound.io/github/metarhia/metatest)
[![Codacy Badge](https://api.codacy.com/project/badge/Grade/79d81f700ad441568d1dc6cca687ea77)](https://www.codacy.com/app/metarhia/metatest)
[![NPM Version](https://badge.fury.io/js/metatest.svg)](https://badge.fury.io/js/metatest)
[![NPM Downloads/Month](https://img.shields.io/npm/dm/metatest.svg)](https://www.npmjs.com/package/metatest)
[![NPM Downloads](https://img.shields.io/npm/dt/metatest.svg)](https://www.npmjs.com/package/metatest)

`metatest` is an extremely simple to use test framework and runner for Metarhia
technology stack built on the following principles:

* Test cases are files, tests are either imperative (functions) or declarative
  (arrays and structures).

* Assertions are done using the built-in Node.js `assert` module. The framework
  also provides additional testing facilities (like spies).

* Tests can be run in parallel.

* All tests are executed in isolated sandboxes. The framework allows to easily
  mock modules required by tests and provides ready-to-use mocks for timers and
  other core functionality.

* Testing asynchronous operations must be supported.

* Testing pure functions without asynchronous operations and state can be done
  without extra boilerplate code using DSL based on arrays.

  ```javascript
  test.case({
    // ...
    'utils.duration': [
      ['1d',     86400000 ],
      ['10h',    36000000 ],
      ['7m',     420000   ],
      ['13s',    13000    ],
      ['2d 43s', 172843000],
      // ...
    ],
    // ...
  });
  ```

  ([Prior art](https://github.com/metarhia/impress/blob/master/tests/unittests/api.common.test.js))

* The framework must work in Node.js and browsers (using Webpack or any other
  module bundler that supports CommonJS modules and emulates Node.js globals).

## Contributors

  - See github for full [contributors list](https://github.com/metarhia/metatest/graphs/contributors)
