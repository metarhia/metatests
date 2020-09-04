'use strict';

const { iter } = require('@metarhia/common');

const clauses = [];
for (let i = 0; i < 10; i++) {
  clauses.push({
    a: 'abc' + Math.random(),
    b: 'hello: ' + Math.random(),
  });
}

const rawJoin = () => clauses.map(c => `${c.a} ${c.b}`).join(', ');

const rawJoinSpread = () => [...clauses].map(c => `${c.a} ${c.b}`).join(', ');

const reduceJoin = () => {
  const c = clauses[0];
  return clauses
    .slice(1)
    .reduce((acc, c) => acc + `, ${c.a} ${c.b}`, `${c.a} ${c.b}`);
};

const reduceSliceStrJoin = () =>
  clauses.reduce((acc, c) => acc + `${c.a} ${c.b}, `, '').slice(0, -2);

const mapper = v => `${v.a} ${v.b}`;
const manualWithMap = () => {
  let res = mapper(clauses[0]);
  for (let i = 1; i < clauses.length; i++) {
    const c = clauses[i];
    res += ', ' + mapper(c);
  }
  return res;
};

const manualJoin = () => {
  let res = `${clauses[0].a} ${clauses[0].b}`;
  for (let i = 1; i < clauses.length; i++) {
    const c = clauses[i];
    res += `, ${c.a} ${c.b}`;
  }
  return res;
};

const manualJoinForOf = () => {
  const it = clauses[Symbol.iterator]();
  const { value: val } = it.next();
  let res = `${val.a} ${val.b}`;
  for (const value of it) {
    res += `, ${value.a} ${value.b}`;
  }
  return res;
};

const iterJoin = () =>
  iter(clauses)
    .map(c => `${c.a} ${c.b}`)
    .join(', ');

module.exports = {
  rawJoin,
  rawJoinSpread,
  manualJoin,
  manualWithMap,
  iterJoin,
  manualJoinForOf,
  reduceJoin,
  reduceSliceStrJoin,
};
