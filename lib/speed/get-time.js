'use strict';

const TimeCollector = require('./time-collector.js');

process.on('message', request => {
  const { name, count, type, path, anomalyPercent } = request;
  const func = require(path)[name];

  const collector = new TimeCollector(count, anomalyPercent);
  collector.getfunctionTime(func, type, (err, res) => {
    res.name = func.name;
    process.send(res);
    process.exit();
  });
});
