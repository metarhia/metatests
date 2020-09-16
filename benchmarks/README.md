# Benchmarking with metatests

`metatests` include benchmarking utilities that can be used via CLI
(`metatests measure`, `metatests speed`) or manually invoked via appropriate
APIs (`metatests.speed()`, `metatests.measure()`, `metatests.convertToCsv()`).

## Benchmark Analysis Requirements

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

## Typical usage pattern

This pattern is very similar to the one used in [Node.js core benchmarking](https://github.com/nodejs/node/blob/master/doc/guides/writing-and-running-benchmarks.md)
and was adapted to be used here. Word of appreciation goes to the [Node.js contributors](https://github.com/nodejs/node/blob/master/AUTHORS)
for writing such a good tool.

### Using `metatests` cli

The `metatests measure` and `metatests speed` CLI commands can be used to
benchmark as follows:

```cmd
$ metatests measure benchmarks/example/create.js --new mixinObject --old defineObject --name create
Measuring old target
create         35258808.21 ops/s ±0.87%
Measuring new target
create         33959942.61 ops/s ±1.7%

         confidence improvement accuracy (*)   (**)  (***)
 create         ***     -3.60 %       ±1.77% ±2.39% ±3.17%

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

### Manual creation of benchmark results

- `benchmark.js` file with the use of `metatests.measure()` and
  `metatests.convertToCsv()` to measure performance of some dependent
  functionality.
- run `node benchmark.js > bench-old.csv` on existing codebase.
- apply code changes to the dependent code.
- run `node benchmark.js > bench-new.csv` on new codebase.
- run `Rscript benchmarks/compare.R --newfile bench-new.csv --oldfile bench-old.csv`
  and analyze the results.

### Analysing results

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

## API

## CLI `metatests speed`

```cmd
$ metatests speed --help                                                                                                                                                                                                                                         ⇡ improve-bench-readme :: ● :: ⬡
metatests speed [options] <file>

Perform simple benchmarking. The file should either export a case/function, an
array of cases/functions or an object with properties. --target option can be
used to get nested paths from exported object

Options:
  --version     Show version number                                    [boolean]
  --help, -h    Show help                                              [boolean]
  --caption     Caption of the speed test       [string] [default: "Speed test"]
  --count, -n   Number of runs                      [number] [default: 10000000]
  --target, -t  Name of exported property to use for speed test         [string]

Examples:
  metatests speed bench.js         Run simple benchmarks for every function
                                   exported from "bench.js"
  metatests speed -n 1e7 bench.js  Run simple benchmarks with custom run count
                                   for every function exported from "bench.js"

```

## CLI `metatests measure`

```cmd
$ metatests measure --help                                                                                                                                                                                                                                         ⇡ improve-bench-readme :: ● :: ⬡
metatests measure [options] <file>

Perform comprehensive benchmarks with extensive customization. The file should
either export a case/function, an array of cases/functions or an object with
properties. --target option can be used to get nested paths from exported
object. Two implementations can be compared with the use of --new and --old
options

Options:
  --version               Show version number                          [boolean]
  --help, -h              Show help                                    [boolean]
  --aggregate, --agg      Aggregate multiple results with the same name. True by
                          default and incompatible with --csv          [boolean]
  --count, -n             Default number of function runs
                                                     [number] [default: 1000000]
  --runs, -r              Number of runs of each case     [number] [default: 20]
  --csv                   Output results as CSV                        [boolean]
  --preflight, -p         Number of preflight runs of each case
                                                          [number] [default: 10]
  --preflightCount, --pc  Number of preflight function runs
                                                    [number] [default: 10000000]
  --target, -t            Path of exported property to use for speed test
                                                                        [string]
  --name                  Name to use for test function if --new --old is used
                                                     [string] [default: "bench"]
  --new                   Path of exported property to use as new in comparison.
                          Must always be used with --old.               [string]
  --old                   Path of exported property to use as old in comparison.
                          Must always be used with --new.               [string]
  --verbose, -v           Output every result during the benchmark run
                                                      [boolean] [default: false]

Examples:
  metatests measure --csv bench.js          Run benchmarks for all exported
                                            functions from "bench.js" file and
                                            output them in csv format
  metatests measure --csv --preflight 5     Run benchmarks for all exported
  --runs 20 -n 1e7 bench.js                 functions from "bench.js" file using
                                            custom options and output them in
                                            csv format
  metatests measure --old oldImpl --new     Compare performance of "oldImpl"
  newImpl --name compare bench.js           function to "newImpl" one exported
                                            from "bench.js" file
  metatests measure --old oldImpl --new     Compare performance of
  newImpl --name compare --target           "nested.props.oldImpl" function to
  nested.props bench.js                     "nested.props.newImpl" one exported
                                            from "bench.js" file

```

## `metatests.speed()`

Simple wrapper for `metatest.measure()`.
Runs multiple functions specified amount of times measuring time and
compares aggregated results directly by computing the increment percentage
of the fastest run and operations per second for each function.

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

[metatestsmeasureapi]: ../README.md#measurecases
[t-test]: https://en.wikipedia.org/wiki/Student%27s_t-test#Equal_or_unequal_sample_sizes.2C_unequal_variances
