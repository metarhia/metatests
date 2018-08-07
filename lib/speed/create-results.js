'use strict';

const createResult = (
  // Function which logs results to console
  results, // Map, results of all functions of all node versions
  caption, // String
  count // Number
) => {
  const nodev = process.versions.node;
  const dots5 = '.'.repeat(5);
  console.log(`\n${caption}; Node: v${nodev}; Count: ${count}`);

  const sortedResults = results.sort((t1, t2) => t1.time - t2.time);
  const relative = time => time * 100 / sortedResults[0].time;

  console.log(
    'Function.name'.padEnd(25, '.') +
    'Percent'.padStart(10, '.') +
    'Time'.padStart(15, '.') +
    'An.Percent'.padStart(15, '.') +
    'An.Time'.padStart(10, '.') +
    dots5 + 'Status'
  );

  sortedResults.forEach(funcResult => {
    const percent = Math.round(relative(funcResult.time)) - 100;
    console.log(
      funcResult.fnName.padEnd(25, '.') +
      (percent ? percent + '%' : 'min').padStart(10, '.') +
      Math.round(funcResult.time).toString().padStart(15, '.') +
      (funcResult.anomaly.percent + '%').padStart(13, '.') +
      (funcResult.anomaly.time + '%').padStart(10, '.') +
      dots5 + funcResult.optimizationStatus
    );
  });
  console.log('');
};

module.exports = createResult;
