'use strict';

// eslint-disable-next-line no-unused-vars
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

module.exports = mixinObject;
