'use strict';

const { readdirSync } = require('node:fs');
readdirSync(__dirname).map((file) => require('./' + file));
