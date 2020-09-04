'use strict';

// Run this benchmark with
// metatests measure benchmarks/example/create.js --new mixinObject --old defineObject --name create
// metatests speed benchmarks/example/create.js

const defineObject = () => ({
  hello: 'world',
  size: 100500,
  flag: true,
});

const mixinObject = () => {
  const obj = {};
  obj.hello = 'world';
  obj.size = 100500;
  obj.flag = true;
  return obj;
};

module.exports = { defineObject, mixinObject };
