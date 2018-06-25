'use strict';

const { capitalize } = require('metarhia-common');

const LINE_LENGTH = 12;

const lpad = (s, count, char = ' ') => (char.repeat(count - s.length) + s);

const line = (title, s) => {
  if (typeof s === 'object') s = JSON.stringify(s);
  return `\n${lpad(title, LINE_LENGTH)}: ${s}`;
};

const list = (lines, s = '') => {
  let key;
  for (key in lines) s += line(capitalize(key), lines[key]);
  return s;
};

module.exports = (metatests) => {

  metatests.results = {
    modules: 0,
    targets: 0,
    functions: 0,
    values: 0,
    classes: 0,
    methods: 0,
    tests: 0,
    errors: 0,
  };

  const renderStack = stack => {
    const path = process.cwd();
    const lines = stack.split('\n');
    lines.splice(1, 1);
    const result = lines.map((line, i) => (
      ' '.repeat(i ? 12 : 0) +
      line.trim().replace(/at /g, '').replace(path, '')
    )).filter(line => !line.includes('(internal/'));
    return result.join('\n');
  };

  metatests.report = () => {
    const next = () => {
      const errCount = metatests.results.errors;
      const successed = errCount === 0;
      metatests.results['result'] = successed ? 'PASSED' : 'FAILED';
      console.log(
        'Test finished with following results' +
        list(metatests.results)
      );
      if (!successed) process.exit(1);
    };
    if (metatests.current) metatests.current.on('done', next);
    else next();
  };

  metatests.fail = (reason) => {
    const message = ' Test failed: ' + reason.caption;
    delete reason.caption;
    if (reason.stack) reason.stack = renderStack(reason.stack);
    console.log(list(reason, message) + '\n');
  };

};
