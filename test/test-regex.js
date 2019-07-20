'use strict';

const metatests = require('..');

metatests.testSync('imperative#regex', test => {
  const t = new metatests.ImperativeTest();
  const testRegex = (regex, input, success, message) => {
    t.regex(regex, input, message);
    test.contains(t.results[t.results.length - 1], {
      type: 'regex',
      message,
      success,
      actual: input,
      expected: `to match ${regex}`,
    });
  };

  testRegex(/\w+/, 'hello', true);
  testRegex(/\d{3}/, '123', true, 'message');
  testRegex(/hello \w+/, 'NON_MATCHING', false);
  t.end();
});
