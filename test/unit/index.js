'use strict';

const { readdirSync } = require('fs');
readdirSync(__dirname).map(file => require('./' + file));
