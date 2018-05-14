'use strict';

const f1 = x => x * 2;
const f2 = x => x + 3;

metatests.namespace({ submodule: { f1, f2 } });

metatests.case('Declarative example', {
  'submodule.f1': [
    [1, 2],
    [2, 4],
    [3, 7],
  ],
  'submodule.f2': [
    [1, 4],
    [2, 5],
    [3, 6],
  ]
});
