'use strict';

const makeClosure = (hello, size, flag) => () => {
  console.log(hello, size, flag);
};

const closureInstance = () => makeClosure('world', 100500, true);

const defineArray = () => ['world', 100500, true];

const defineArrayOfString = () => ['world', 'world', 'world'];

const defineArrayOfNumber = () => [100500, 100500, 100500];

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

function ProtoItem(hello, size, flag) {
  this.hello = hello;
  this.size = size;
  this.flag = flag;
}

const newPrototype = () => new ProtoItem('world', 100500, true);

const ClassItem = class {
  constructor(hello, size, flag) {
    this.hello = hello;
    this.size = size;
    this.flag = flag;
  }
};

const newClass = () => new ClassItem('world', 100500, true);

const newObject = () => {
  const obj = new Object();
  obj.hello = 'world';
  obj.size = 100500;
  obj.flag = true;
  return obj;
};

const objectCreate = () => {
  const obj = Object.create(null);
  obj.hello = 'world';
  obj.size = 100500;
  obj.flag = true;
  return obj;
};

const itemFactory = (hello, size, flag) => ({ hello, size, flag });

const callFactory = () => itemFactory('world', 100500, true);

module.exports = {
  closureInstance,
  defineObject,
  defineArray,
  defineArrayOfString,
  defineArrayOfNumber,
  mixinObject,
  newPrototype,
  newClass,
  newObject,
  objectCreate,
  callFactory,
};
