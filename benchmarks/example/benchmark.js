'use strict';

const metatests = require('../../metatests');
const createObject = require('./create');

const results = metatests.measure(
  [
    {
      name: 'createObject',
      fn: createObject,
    },
  ],
  {
    defaultCount: 1e6,
    preflight: 10,
    runs: 20,
  }
);

console.log(metatests.convertToCsv(results));
