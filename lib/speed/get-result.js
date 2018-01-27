'use strict';

const logToConsole = (
  // Function witch log results to console
  top, // array, sort array with objects '{ name: time }'
  relative, // number, relative time
  tableCaption, // string, name of test
  count, // number, number of iterations
  version // string, version of node
) => {
  const rpad = (s, char, count) => (s + char.repeat(count - s.length));
  const lpad = (s, char, count) => (char.repeat(count - s.length) + s);

  console.log('\n' + rpad(tableCaption, '.', 30) +
  'count: ' + count + '; node: ' + version);

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
  count, // number, number of iterations
  version // string, version of node
) => {
  const fs = require('fs');
  const fileName = './' + tableCaption + '.csv';

  const caption = [tableCaption, count, version].join(',') +  '\n' +
  ['functionName', 'time', 'percent'].join(',') + '\n';

  fs.appendFileSync(fileName, caption);
  top.forEach((test) => {
    test.percent = Math.round(
      Math.round(relative(test.time) * 100) / 100
    ) - 100;
    const percent = test.percent === 0 ? 'min' : '+' + test.percent + '%';
    const str = [test.name, test.time, percent].join(',') + '\n';
    fs.appendFileSync(fileName, str);
  });
};

const getValues = (
// Object.value() for node 6.0.0
  obj // object
// Returns: array, array of values
) => {
  const res = [];
  let val;
  for (val in obj) res.push(obj[val]);
  return res;
};

const getResult = (
  results, // object
  caption, // string, name of test
  count // number, number of iterations
) => {
  let version;
  for (version in results) {
    const times = getValues(results[version]);
    const top = times.sort((t1, t2) => (t1.time - t2.time));
    const relative = time => time * 100 / top[0].time;
    logToConsole(top, relative, caption, count, version);
    logToCsv(top, relative, caption, count, version);
  }
};

module.exports = getResult;
