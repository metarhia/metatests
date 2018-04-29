#!/usr/bin/env node
'use strict';

const metasync = require('metasync');

const walk = require('../lib/walk');

console.log('Metatest CLI Stub');

walk('../test', (err, files) => {
  metasync.for(files).each((file, next) => {
    require(file.filePath);
    next();
  }).fetch(() => {
    console.log('Tests done');
  });
});
