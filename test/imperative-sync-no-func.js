'use strict';

const { testSync } = require('../');

const test = testSync('Empty test');
test.assert(true);
// this test must just finish and will timeout otherwise
