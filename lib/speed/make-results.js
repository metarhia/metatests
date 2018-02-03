'use strict';

const logConsole = (
  // Function witch log results to console
  result // map
) => {
  const rpad = (s, char, count) => (s + char.repeat(count - s.length));
  const lpad = (s, char, count) => (char.repeat(count - s.length) + s);

  console.log('\n' +
    rpad(result.caption, '.', 35) +
    lpad('Count: ' + result.count, '.', 15));

  result.forEach((times, version) => {
    console.log('\n' + lpad('Node version: ' + version, '.', 50));
    times.forEach(func => {
      const name = rpad(func.name, '.', 25);
      const time = lpad(func.time.toString(), '.', 15);
      const percent = lpad(func.percent, '.', 10);
      console.log(name + time + percent);
    });
  });
};

const logCsv = (
  // Function witch log results to csv file
  result // map
) => {
  const fs = require('fs');
  const filename = './' + result.caption + '.csv';

  const caption = [result.caption, result.count].join(',') + '\n' +
  ['function name, time, percent, node version'] + '\n';
  fs.writeFileSync(filename, caption);

  result.forEach((times, version) => {
    times.forEach(func => {
      const funcResult = [func.name, func.time, func.percent, version]
        .join(',') + '\n';
      fs.appendFileSync(filename, funcResult);
    });
  });
};

const makeResult = (
  // Function witch generate result of test
  results // map
) => {
  results.forEach((result, version) => {
    const top = result.sort((t1, t2) => (t1.time - t2.time));
    const relative = time => time * 100 / top[0].time;
    top.forEach((test) => {
      const percent = Math.round(
        Math.round(relative(test.time) * 100) / 100
      ) - 100;
      test.percent = percent === 0 ? 'min' : '+' + percent + '%';
    });
    results.set(version, top);
  });
  logConsole(results);
  logCsv(results);
};

module.exports = makeResult;
