'use strict';

const maojian = require('..');

const f1 = x => x * 2;

maojian.namespace({ submodule: { f1 } });

maojian.case('Declarative example', {
  'submodule.f1': [
    [1, 2],
    [2, 4],
    [3, 6],
  ]
});
