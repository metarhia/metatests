# maojian

[![TravisCI](https://travis-ci.org/metarhia/maojian.svg?branch=master)](https://travis-ci.org/metarhia/maojian)
[![bitHound](https://www.bithound.io/github/metarhia/maojian/badges/score.svg)](https://www.bithound.io/github/metarhia/maojian)
[![Codacy Badge](https://api.codacy.com/project/badge/Grade/79d81f700ad441568d1dc6cca687ea77)](https://www.codacy.com/app/metarhia/maojian)
[![NPM Version](https://badge.fury.io/js/metarhia-maojian.svg)](https://badge.fury.io/js/metarhia-maojian)
[![NPM Downloads/Month](https://img.shields.io/npm/dm/metarhia-maojian.svg)](https://www.npmjs.com/package/metarhia-maojian)
[![NPM Downloads](https://img.shields.io/npm/dt/metarhia-maojian.svg)](https://www.npmjs.com/package/metarhia-maojian)

Welcome there, stranger.

`maojian` is (will be, to be exact) an extremely simple to use test framework
and runner built on the following principles:

* Test cases are files, tests are functions (or arrays, more on that later).

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

  ([Prior art](https://github.com/metarhia/Impress/blob/master/tests/unittests/api.common.test.js))

* The framework must work in Node.js and browsers (using Webpack or any other
  module bundler that supports CommonJS modules and emulates Node.js globals).

* There's no need to write own reporters, Karma plugins and all the stuff. The
  framework should just
  produce [TAP](https://testanything.org/tap-version-13-specification.html)
  output and it will integrate with tons of existing software out-of-the-box.
  And since TAP's syntax is quite human-readable by its nature, it will still
  be possible to use `maojian` without third-party reporters and it will work
  and look like a proper test runner, just without colors and pseudographics
  in its output.

The development has just started. Stay tuned for `0.1.0` if you are interested.

## Contributors

  - See github for full [contributors list](https://github.com/metarhia/maojian/graphs/contributors)
