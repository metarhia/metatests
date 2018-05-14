'use strict';

const metatests = {};

metatests.namespaces = [];

metatests.speed = require('./lib/speed');
const Test = require('./lib/test');
require('./lib/case')(metatests);
require('./lib/report')(metatests);

metatests.namespace = (namespace) => {
  metatests.namespaces.push(namespace);
};

metatests.test = (caption, execute) => {
  const test = new Test(caption);
  execute(test);
  metatests.results.tests += test.counter;
};

module.exports = metatests;
