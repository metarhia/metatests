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

#### Using `metatests` cli

The `metatests measure` and `metatests speed` CLI commands can be used to
benchmark as follows:

```cmd
$ metatests measure benchmarks/example/create.js --new mixinObject --old defineObject --name create
...
         confidence improvement accuracy (*)   (**)  (***)
 create                 -2.22 %       ±4.22% ±5.65% ±7.43%

Be aware that when doing many comparisons the risk of a false-positive
  result increases. In this case there are 1 comparisons, you can thus
  expect the following amount of false-positive results:
    0.05 false positives, when considering a   5% risk acceptance (*, **, ***),
    0.01 false positives, when considering a   1% risk acceptance (**, ***),
    0.00 false positives, when considering a 0.1% risk acceptance (***)

```

```cmd
$ metatests speed benchmarks/example/create.js
...
Speed test
defineObject   299498923ns   min          33389101.68 ops/s ±5.15%
mixinObject    313518668ns +4.68%         31896027.32 ops/s ±2.29%
```

The example above can be found in [benchmarks/example/create.js](./example/create.js).

#### Manual creation of benchmark results

- `benchmark.js` file with the use of `metatests.measure()` and
  `metatests.convertToCsv()` to measure performance of some dependent
  functionality.
- run `node benchmark.js > bench-old.csv` on existing codebase.
- apply code changes to the dependent code.
- run `node benchmark.js > bench-new.csv` on new codebase.
- run `Rscript --newfile bench-new.csv --oldfile bench-old.csv` and analyze
  the results.

#### Analysing results

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

[metatestsmeasureapi]: ../README.md#measurecases
[t-test]: https://en.wikipedia.org/wiki/Student%27s_t-test#Equal_or_unequal_sample_sizes.2C_unequal_variances
