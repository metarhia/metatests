'use strict';

const util = require('util');
const rpad = (s, char, count) => (s + char.repeat(count - s.length));
const lpad = (s, char, count) => (char.repeat(count - s.length) + s);
const cp = require('child_process');

const timeStartSrcCode = 'const __begin_time__ = process.hrtime();';
const timeEndSrcCode = `
    const __end_time__ = process.hrtime(__begin_time__);
    console.log(__end_time__[0] * 1e9 + __end_time__[1]);
    `;

const speedSrcCode = (
  srcCode,        // source code for runnning
  preSrcCode = '' // source code for running before start of time measurement
) => {
  try {
    if (typeof srcCode === 'function') srcCode = '(' + srcCode + ')();';
    if (typeof perSrcCode === 'function') {
      preSrcCode = '(' + preSrcCode + ')();';
    }
    const input = util.format('%s;%s;%s;%s',
      preSrcCode, timeStartSrcCode, srcCode, timeEndSrcCode);
    const stdout = cp.execFileSync('node', [], { input });
    const lines = stdout.toString().split('\n');
    const time = +lines[lines.length - 2];
    return [null, time];
  } catch (e) {
    return [e];
  }
};

const wrapInLoop = (
  srcCode, // source to wrap in loop
  count    // number of loop iterations
) => util.format(`
  for (var __loop_counter__ = 0; __loop_counter__ < %d; __loop_counter__++) {
    %s;
  }`, count, srcCode);

const speedFn = (
  fn,     // function which speed is measured
  { count, preSrcCode }
  // count is number of times which fn will be ran
  // preSrcCode is code needed to be declared before function
) => speedSrcCode(wrapInLoop(fn, count), preSrcCode);

const speed = (
  caption,
  count,
  tests // [{ fn, preSrcCode }]
  // fn is function for running
  // preSrcCode is source code which should be declarated before function
) => {
  const times = tests.map(({ fn, preSrcCode }) => {
    const [err, time] = speedFn(fn, { count, preSrcCode });
    const name = rpad(fn.name, '.', 25);
    return { name, time: err ? 'FAILED' : time };
  });
  console.log();
  const top = times.sort((t1, t2) => (t1.time - t2.time));
  const best = top[0].time;
  const relative = (time) => (time * 100 / best);
  top.forEach((test) => {
    test.percent = Math.round(
      Math.round(relative(test.time) * 100) / 100
    ) - 100;
    const time = lpad(test.time.toString(), '.', 15);
    const percent = lpad((
      test.percent === 0 ? 'min' : '+' + test.percent + '%'
    ), '.', 10);
    console.log(test.name + time + percent);
  });
};

module.exports = speed;
