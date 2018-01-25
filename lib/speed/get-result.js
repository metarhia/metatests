'use strict';

const lpad = (s, char, count) => (char.repeat(count - s.length) + s);

const getResult = (times) => {
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

module.exports = getResult;
