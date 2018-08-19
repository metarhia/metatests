'use strict';

['compare', 'declarative', 'imperative', 'exit-code'].map(name =>
  require('./' + name)
);
