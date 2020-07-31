'use strict';

const metatests = require('../metatests');

const run = (size, n) => {
  const search = [];
  for (let i = 0; i < size; i++) {
    search.push('abc' + Math.random());
  }

  const target1 = search[Math.floor(size * 0.1)];
  const target2 = search[Math.floor(size * 0.5)];
  const target3 = search[Math.floor(size * 0.9)];

  const searchArray = () =>
    search.includes(target1) &&
    search.includes(target2) &&
    search.includes(target3);
  const searchArrayNone = () => search.includes('abc');

  const searchsss = new Set(search);
  const searchSet = () =>
    searchsss.has(target1) && searchsss.has(target2) && searchsss.has(target3);
  const searchSetNone = () => searchsss.has('abc');

  metatests.speed(`search ${size}`, n, [searchArray, searchSet]);
  metatests.speed(`searchNone ${size}`, n, [searchArrayNone, searchSetNone]);
};

run(5, 1e7);
run(500, 1e5);
