# maojian

[![bitHound Dependencies][bithound-deps-badge]][bithound-deps-url]
[![bitHound Dev Dependencies][bithound-devdeps-badge]][bithound-deps-url]
[![bitHound Code][bithound-code-badge]][bithound-url]

[![Travis Build Status][travis-badge]][travis-url]
[![AppVeyor Build Status][appveyor-badge]][appveyor-url]

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

[bithound-deps-badge]: https://www.bithound.io/github/metarhia/maojian/badges/dependencies.svg
[bithound-devdeps-badge]: https://www.bithound.io/github/metarhia/maojian/badges/devDependencies.svg
[bithound-code-badge]: https://www.bithound.io/github/metarhia/maojian/badges/code.svg
[bithound-deps-url]: https://www.bithound.io/github/metarhia/maojian/master/dependencies/npm
[bithound-url]: https://www.bithound.io/github/metarhia/maojian
[travis-badge]: https://travis-ci.org/metarhia/maojian.svg?branch=master
[travis-url]: https://travis-ci.org/metarhia/maojian
[appveyor-badge]: https://ci.appveyor.com/api/projects/status/vvysb66gccem97dq/branch/master?svg=true
[appveyor-url]: https://ci.appveyor.com/project/metarhia/maojian
