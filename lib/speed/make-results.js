'use strict';
const fs = require('fs');

const outputToConsole = (
  // Function which log results to console
  result, // Map, results of all functions of all node versions
  caption, // String
  count // Number
) => {
  const rpad = (s, count) => (s + '.'.repeat(count - s.length));
  const lpad = (s, count) => ('.'.repeat(count - s.length) + s);

  console.log('\n' + rpad(caption, 35) +
    lpad('Count: ' + count, 15));

  result.forEach((times, version) => {
    console.log('\n' + lpad('Node version: ' + version, '.', 70));
    console.log(rpad('Function.name', 25) + lpad('Percent', 10) +
    lpad('Time', 15) + lpad('Anomaly', 10) + lpad('An.Time', 10));
    times.forEach(func => {
      const name = rpad(func.name, 25);
      const percent = lpad(func.percent, 10);
      const time = lpad((Math.round(func.time)).toString(), 15);
      const anomalyPercent = lpad(func.anPercent.toString() + '%', 10);
      const anomalyTime = lpad(func.anTime.toString() + '%', 10);
      console.log(name + percent + time + anomalyPercent + anomalyTime);
    });
  });
};

const writeToCsv = (
  // Function which write results to csv file
  result // Map, results of all functions of all node versions
) => {
  const filename = __dirname + '/results/data.csv';

  const captionOfFile = 'funcName,time,percent,version\n';
  fs.writeFileSync(filename, captionOfFile);

  result.forEach((times, version) => {
    times.forEach(func => {
      const funcResult = [func.name, func.time, func.percent, version]
        .join(',') + '\n';
      fs.appendFileSync(filename, funcResult);
    });
  });
};

const makeResult = (
  // Function which generate result of test
  results, // Map, results of all functions of all node versions
  caption, // String
  count // Number
  // Returns: Map, sorted results of all functions of all node versions
) => {
  results.forEach((result, version) => {
    const sortedResults = result.sort((t1, t2) => (t1.time - t2.time));
    const relative = time => time * 100 / sortedResults[0].time;
    sortedResults.forEach((test) => {
      const percent = Math.round(relative(test.time)) - 100;
      test.percent = percent === 0 ? 'min' : '+' + percent + '%';
    });
    results.set(version, sortedResults);
  });
  outputToConsole(results, caption, count);
  writeToCsv(results);
  return results;
};

module.exports = makeResult;
