'use strict';

const metatests = require('..');

const f1 = x => x * 2;

metatests.namespace({ submodule: { f1 } });

metatests.case('Declarative example', {
  'submodule.f1': [
    [1, 2],
    [2, 4],
    [3, 6],
  ]
});
