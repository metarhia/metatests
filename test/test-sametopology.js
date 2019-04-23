'use strict';

const metatests = require('..');

[
  () => {
    const obj1 = { data: 1, subObj: {} };
    const obj2 = { data: 1, subObj: {} };

    obj1.self = obj1;
    obj2.self = obj2;

    obj1.subObj.self = obj1.subObj;
    obj2.subObj.self = obj2.subObj;

    obj1.ref = obj2;
    obj2.ref = obj1;

    return [obj1, obj2];
  },
].forEach(f => {
  metatests.testSync('test.sameTopology', test => {
    const [obj1, obj2] = f();
    test.log('Input:', obj1, obj2);
    test.sameTopology(obj1, obj2);
  });
});

[
  () => {
    const obj1 = {};
    const obj2 = {};

    obj1.self = obj1;
    obj2.self = obj2;

    obj1.a = 2;
    obj2.a = 1;

    return [obj1, obj2];
  },
].forEach(f => {
  metatests.testSync('test.notSameTopology', test => {
    const [obj1, obj2] = f();
    test.log('Input:', obj1, obj2);
    test.notSameTopology(obj1, obj2);
  });
});
