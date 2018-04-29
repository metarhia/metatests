'use strict';

const metatest = require('..');

const f1 = x => x * 2;

metatest.namespace({ submodule: { f1 } });

metatest.case('Declarative example', {
  'submodule.f1': [
    [1, 2],
    [2, 4],
    [3, 6],
  ]
});
