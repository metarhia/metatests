# Benchmarking with metatests

## `metatests.speed()`

Simple wrapper for `metatest.measure()`.
Runs multiple functions specified amount of times measuring time and
compares the results directly by computing the increment percentage
of the fastest run.

## `metatests.measure()`

More complex benchmarking tool needed for fine-grained benchmarking.
Runs specified benchmark cases which must contain function and optionally,
custom name, different argument groups, runCount per-function, preflight count
per-function, total runs to make for each configuration, preflight count.

Refer to the [API documentation for metatests.measure()][metatestsmeasureapi]
for detailed method description.

## `metatests.convertToCsv()`

Extension to `metatests.measure()` to generate a csv file from benchmark
results and compare them with a different one.
This function allows making use of much more statistically correct tools
to measure performance difference.

### Benchmark Analysis Requirements

To analyze the results, `R` should be installed.
Use the one provided by your package manager or download it
from [https://www.r-project.org/](https://www.r-project.org/).

The `R` packages `ggplot2` and `plyr` are needed and can be
installed using the R REPL.

```cmd
$ R
install.packages("ggplot2")
install.packages("plyr")
```

### Typical usage pattern

This pattern is very similar to the one used in [Node.js core benchmarking](https://github.com/nodejs/node/blob/master/doc/guides/writing-and-running-benchmarks.md)
and was adapted to be used here. Word of appreciation goes to the [Node.js contributors](https://github.com/nodejs/node/blob/master/AUTHORS)
for writing such a good tool.

- `benchmark.js` file with the use of `metatests.measure()` and
  `metatests.convertToCsv()` to measure performance of some dependent
  functionality.
- run `node benchmark.js > bench-old.csv` on existing codebase.
- apply code changes to the dependent code.
- run `node benchmark.js > bench-new.csv` on new codebase.
- run `Rscript --newfile bench-new.csv --oldfile bench-old.csv` and analyze
  the results.

In the output, _improvement_ is the relative improvement of the new version
(in the `bench-new.csv` file), hopefully this is positive. _confidence_ tells
if there is enough statistical evidence to validate the _improvement_.
If there is enough evidence then there will be at least one star (`*`),
more stars is just better. **However if there are no stars, then don't make
any conclusions based on the _improvement_.** Sometimes this is fine, for
example if no improvements are expected, then there shouldn't be any stars.

**A word of caution:** Statistics is not a foolproof tool. If a benchmark shows
a statistical significant difference, there is a 5% risk that this
difference doesn't actually exist. For a single benchmark this is not an
issue. But when considering 20 benchmarks it's normal that one of them
will show significance, when it shouldn't. A possible solution is to instead
consider at least two stars (`**`) as the threshold, in that case the risk
is 1%. If three stars (`***`) is considered the risk is 0.1%. However this
may require more runs to obtain (can be set with `--runs`).

_For the statistically minded, the R script performs an [independent/unpaired
2-group t-test][t-test], with the null hypothesis that the performance is the
same for both versions. The confidence field will show a star if the p-value
is less than `0.05`._

Simple example would be as follows:

```js
// file create.js

const defineObject = () => ({
  hello: 'world',
  size: 100500,
  flag: true,
});

const mixinObject = () => {
  const obj = {};
  obj.hello = 'world';
  obj.size = 100500;
  obj.flag = true;
  return obj;
};

module.exports = defineObject;
```

```js
// file benchmark.js
const metatests = require('metatests');
const createObject = require('./create.js');

const results = metatests.measure(
  [
    {
      name: 'createObject',
      fn: createObject,
    },
  ],
  {
    defaultCount: 1e6,
    preflight: 10,
    runs: 20,
  }
);

console.log(metatests.convertToCsv(results));
```

First measure existing code with multiple runs:

```cmd
$ node benchmark.js > bench-old.csv
```

Now change the file `create.js` as follows

```js
// file create.js
// ...
// same code as before
// ...

module.exports = mixinObject;
```

And then measure new code:

```cmd
$ node benchmark.js > bench-new.csv
```

This provides 2 files with old and new results which are ready to be analyzed:

```cmd
$ Rscript benchmarks/compare.R --oldfile bench-old.csv --newfile bench-new.csv
             confidence improvement accuracy (*)   (**)  (***)
createObject                -2.34 %       ±2.66% ±3.62% ±4.87%

Be aware that when doing many comparisons the risk of a false-positive
  result increases. In this case there are 1 comparisons, you can thus
  expect the following amount of false-positive results:
    0.05 false positives, when considering a   5% risk acceptance (*, **, ***),
    0.01 false positives, when considering a   1% risk acceptance (**, ***),
    0.00 false positives, when considering a 0.1% risk acceptance (***)
  %
```

These examples can be found in the `benchmarks/examples` folder.

[metatestsmeasureapi]: ../README.md#measurecases
[t-test]: https://en.wikipedia.org/wiki/Student%27s_t-test#Equal_or_unequal_sample_sizes.2C_unequal_variances
