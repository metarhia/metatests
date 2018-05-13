'use strict';

const metatests = require('..');

require('./compare');
require('./declarative');
require('./imperative');
require('./speed');

metatests.report();
