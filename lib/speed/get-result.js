'use strict';

const logToConsole = (
  // Function witch log results to console
  top, // array, sort array with objects '{ name: time }'
  relative, // number, relative time
  tableCaption, // string, name of test
  count // number, number of iterations
) => {
  const rpad = (s, char, count) => (s + char.repeat(count - s.length));
  const lpad = (s, char, count) => (char.repeat(count - s.length) + s);

  console.log(rpad(tableCaption, '.', 40) + count);

  top.forEach((test) => {
    test.percent = Math.round(
      Math.round(relative(test.time) * 100) / 100
    ) - 100;
    const time = lpad(test.time.toString(), '.', 15);
    const name = rpad(test.name, '.', 25);
    const percent = lpad((
      test.percent === 0 ? 'min' : '+' + test.percent + '%'
    ), '.', 10);
    console.log(name + time + percent);
  });
};

const logToCsv = (
  // Function witch log results to csv file
  top, // array, sort array with objects '{ name: time }'
  relative, // number, relative time
  tableCaption, // string, name of test
  count // number, number of iterations
) => {
  const fs = require('fs');
  const fileName = './results.csv';

  const caption = [tableCaption, count].join(',') +  '\n' +
  ['functionName', 'time', 'percent'].join(',') + '\n';

  fs.writeFileSync(fileName, caption);
  top.forEach((test) => {
    test.percent = Math.round(
      Math.round(relative(test.time) * 100) / 100
    ) - 100;
    const percent = test.percent === 0 ? 'min' : '+' + test.percent + '%';
    const str = [test.name, test.time, percent].join(',') + '\n';
    fs.appendFileSync(fileName, str);
  });
};

const getResult = (
  times, // array, array with objects '{ name: time }'
  caption, // string, name of test
  count // number, number of iterations
) => {
  const top = times.sort((t1, t2) => (t1.time - t2.time));
  const relative = time => time * 100 / top[0].time;
  logToConsole(top, relative, caption, count);
  logToCsv(top, relative, caption, count);
};

module.exports = getResult;
