'use strict';

const metatests = require('..');

const f1 = x => x * 2;
const f2 = x => x + 3;
const f3 = x => x;

const namespace = { submodule: { f1, f2, f3 } };

metatests.case('Declarative example', namespace, {
  'submodule.f1': [
    [1, 2],
    [2, 4],
    [3, 6],
  ],
  'submodule.f2': [
    [1, 4],
    [2, 5],
    [3, 6],
  ],
  'submodule.f3': [['\\', '\\']],
});
