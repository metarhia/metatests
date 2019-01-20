'use strict';

const rpad = (s, char, count) => s + char.repeat(count - s.length);
const lpad = (s, char, count) => char.repeat(count - s.length) + s;

const speed = (caption, count, tests) => {
  const times = tests.map(fn => {
    const result = [];
    const begin = process.hrtime();
    for (let i = 0; i < count; i++) result.push(fn());
    const end = process.hrtime(begin);
    const time = end[0] * 1e9 + end[1];
    const name = rpad(fn.name, '.', 25);
    return { name, time };
  });
  const top = times.sort((t1, t2) => t1.time - t2.time);
  const best = top[0].time;
  const relative = time => (time * 100) / best;
  top.forEach(test => {
    test.percent =
      Math.round(Math.round(relative(test.time) * 100) / 100) - 100;
    const time = lpad(test.time.toString(), '.', 15);
    const percent = lpad(
      test.percent === 0 ? 'min' : '+' + test.percent + '%',
      '.',
      10
    );
    console.log(test.name + time + percent);
  });
  console.log();
};

module.exports = {
  speed,
};
