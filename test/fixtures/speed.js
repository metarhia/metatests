'use strict';

const metatests = require('../../metatests');

const objectCreate = () => {
  const obj = Object.create(null);
  obj.hello = 'world';
  obj.size = 100500;
  obj.flag = true;
  return obj;
};

metatests.speed('Benchmark example', 1e6, [objectCreate]);
