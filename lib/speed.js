'use strict';

const util = require('util');
const { iter } = require('@metarhia/common');
const { roundTo, sum } = require('../lib/utils');
const { computeStats } = require('./stats');

const NS_PER_SEC = 1e9;

const run = (count, fn, args = []) => {
  let result = null;
  const start = process.hrtime();
  for (let i = 0; i < count; i++) {
    const r = fn(...args);
    if (Math.random() > 0.5) result = r;
  }
  const elapsed = process.hrtime(start);
  const time = elapsed[0] * NS_PER_SEC + elapsed[1];
  return { result, args, count, time };
};

// Microbenchmark each passed configuration multiple times
// Signature: cases[, options]
//   cases <Array> cases to test, each case contains
//     fn <Function> function to check, will be called with each args provided
//     name <string> case name, function.name by default
//     argCases <Array> array of arguments to create runs with. When omitted
//         `fn` will be run once without arguments.
//         Total amount of runs will be `runs * argCases.length`.
//     n <number> number of times to run the test,
//         defaultCount from options by default
//   options <Object>
//     defaultCount <number> number of times to run the function by default,
//         default: 1e6
//     runs <number> number of times to run the case, default: 20
//     preflight <number> number of times to pre-run the case for each set of
//         arguments, default: 10
//     preflightCount <number> number of times to run the function in the
//         preflight stage, default: 1e4
//     listener <Object> appropriate function will be called to report events,
//         optional
//       preflight <Function> called when preflight is starting, optional
//         name <string> case name
//         count <number> number of times it will be run
//         args <Array> function arguments
//       run <Function> called when run is starting, optional
//         name <string> case name
//         count <number> number of times it will be run
//         args <Array> function arguments
//       cycle <Function> called when run is done, optional
//         name <string> case name
//         result <Object> case results
//       done <Function> called when all runs for given configurations are done,
//           optional
//         name <string> case name
//         args <Array> current configuration
//         results <Array> results of all runs with this configuration
//       finish <Function> called when measuring is finished, optional
//         results <Array> all case results
// Returns: <Array> results of all cases as objects of structure
//   name <string> case name
//   args <Array> arguments for this run
//   count <number> number of times case was run
//   time <number> time in nanoseconds it took to make `count` runs
//   result <any> result of one of the runs
const measure = (
  cases,
  {
    defaultCount = 1e6,
    preflight = 10,
    preflightCount = 1e4,
    runs = 20,
    listener = {},
  } = {}
) => {
  const res = [];
  cases.forEach(c => {
    const fn = c.fn || c;
    const { name, argCases = [], n = defaultCount } = c;
    if (!n || n <= 0)
      throw new Error('Run count is not valid, must be a positive number');
    const testName = name || fn.name || 'anonymous';
    if (argCases.length === 0) argCases.push(undefined);
    for (const args of argCases) {
      for (let i = 0; i < preflight; i++) {
        if (listener.preflight)
          listener.preflight(testName, preflightCount, args);
        run(preflightCount, fn, args);
      }
    }
    for (const args of argCases) {
      const argResults = [];
      for (let i = 0; i < runs; i++) {
        if (listener.run) listener.run(testName, n, args);
        const r = run(n, fn, args);
        const result = { ...r, name: testName };
        if (listener.cycle) listener.cycle(testName, result);
        argResults.push(result);
      }
      if (listener.done) listener.done(testName, args, argResults);
      res.push(...argResults);
    }
  });
  if (listener.finish) listener.finish(res);
  return res;
};

const aggregateResults = results =>
  iter(results)
    .chainApply(it => it.groupBy(t => t.name))
    .map(([name, samples]) => {
      const stats = computeStats(
        samples.map(s => s.time / NS_PER_SEC / s.count)
      );
      const time = sum(iter(samples).map(s => s.time)) / samples.length;
      const ops = 1 / stats.mean;
      return { name, samples, stats, time, ops };
    })
    .toArray()
    // TODO(lundibundi): use better test comparison like
    //  http://www.statisticslectures.com/topics/mannwhitneyu
    .sort((t1, t2) => t2.ops - t1.ops);

// Microbenchmark each passed function and compare results.
//   caption <string> name of the benchmark
//   count <number> amount of times ro run each function
//   cases <Array> functions to check
const speed = (caption, count, cases) => {
  const times = measure(cases, {
    defaultCount: count,
    runs: 5,
    preflight: 3,
    listener: {
      preflight: name => console.log(`start preflight ${name}`),
      run: name => console.log(`run ${name}`),
      done: name => console.log(`done ${name}`),
    },
  });
  const ladder = aggregateResults(times);
  const best = ladder[0].time;
  console.log('\n' + caption);
  ladder.forEach(test => {
    const name = test.name.padEnd(15, ' ');
    const time = Math.round(test.time) + 'ns ';
    const percent = roundTo((test.time * 100) / best - 100, 2);
    const percentstr = (percent > 0 ? `+${percent}%` : 'min')
      .padStart(5, ' ')
      .padEnd(15, ' ');
    const ops = roundTo(test.ops, 2) + ' ops/s ';
    const rme = '±' + roundTo(test.stats.relativeMarginOfError, 2) + '%';
    console.log(name + time + percentstr + ops + rme);
  });
  console.log();
};

// Convert single metatests.measure result to csv.
//   result <Object> single results from `measure` run
// Returns: <string> valid CSV representation of the result
const resultToCsv = r => {
  const name = JSON.stringify(r.name.replace(/"/g, '""'));
  const args = (r.args && r.args.map(util.inspect).join(' ')) || '';
  // Escape quotes (") for correct csv formatting
  const conf = JSON.stringify(args.replace(/"/g, '""'));
  const timeInSec = r.time / NS_PER_SEC;
  const rate = r.count / timeInSec;
  return `${name}, ${conf}, ${rate}, ${timeInSec}`;
};

// Convert metatests.measure result to csv.
//   results <Array> all results from `measure` run
// Returns: <string> valid CSV representation of the results
const convertToCsv = results => {
  return (
    iter(['name', 'configuration', 'rate', 'time'])
      .map(JSON.stringify)
      .join(', ') +
    '\n' +
    iter(results).map(resultToCsv).join('\n')
  );
};

// Make CSV files to new and old measure results
//   oldResults <Array> all results from old `measure` run
//   newResults <Array> all results from new `measure` run
// Returns: <string> valid CSV representation of all of the results
const makeTotalResults = (oldResults, newResults) =>
  ['version', 'name', 'configuration', 'rate', 'time']
    .map(JSON.stringify)
    .join(', ') +
  '\n' +
  oldResults.map(r => '"old", ' + resultToCsv(r)).join('\n') +
  '\n' +
  newResults.map(r => '"new", ' + resultToCsv(r)).join('\n');

module.exports = {
  speed,
  measure,
  resultToCsv,
  convertToCsv,
  makeTotalResults,
  aggregateResults,
};
