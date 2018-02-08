'use strict';

const outputToConsole = (
  // Function which log results to console
  result // Map, sorted results of all functions of all node versions
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

const writeToCsv = (
  // Function which write results to csv file
  result // Map, sorted results of all functions of all node versions
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
  // Function which generate result of test
  results // Map, results of all functions of all node versions
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
  outputToConsole(results);
  writeToCsv(results);
  return results;
};

module.exports = makeResult;
