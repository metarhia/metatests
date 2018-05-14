'use strict';

const metatests = require('..');
global.metatests = metatests;

['compare', 'declarative', 'imperative', 'speed']
  .map(name => require('./' + name));

metatests.report();
