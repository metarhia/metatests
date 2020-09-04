'use strict';

const create = size => {
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
  const searchArrayNoMatch = () => search.includes('abc');

  const searchsss = new Set(search);
  const searchSet = () =>
    searchsss.has(target1) && searchsss.has(target2) && searchsss.has(target3);
  const searchSetNoMatch = () => searchsss.has('abc');

  return {
    match: { searchArray, searchSet },
    noMatch: { searchArrayNoMatch, searchSetNoMatch },
  };
};

module.exports = {
  size5: create(5),
  size500: create(500),
};
