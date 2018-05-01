'use strict';

const mt = require('..');

const f1 = x => x * 2;

mt.namespace({ submodule: { f1 } });

mt.case('Declarative example', {
  'submodule.f1': [
    [1, 2],
    [2, 4],
    [3, 6],
  ]
});
