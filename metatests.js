'use strict';

const metatests = {};

['compare', 'namespaces', 'report', 'test', 'case',  'speed', 'walk']
  .map(name => require('./lib/' + name)(metatests));

module.exports = metatests;
