'use strict';

const metatests = require('..');

metatests.testSync('imperative#is', test => {
  const moreThan3 = v => v > 3;

  const t = new metatests.ImperativeTest();
  t.is(moreThan3, 1);
  t.is(moreThan3, 4);
  t.is(moreThan3, 4, 'hello');
  t.end();

  test.contains(t.results[0], {
    type: `is ${moreThan3.name}`,
    success: false,
    actual: 1,
    expected: undefined,
  });
  test.contains(t.results[1], {
    type: `is ${moreThan3.name}`,
    success: true,
    actual: 4,
    expected: undefined,
  });
  test.contains(t.results[2], {
    type: `is ${moreThan3.name}`,
    message: 'hello',
    success: true,
    actual: 4,
    expected: undefined,
  });
});

metatests.testSync('imperative#isArray', test => {
  const t = new metatests.ImperativeTest();
  t.isArray([]);
  t.isArray([], 'hello');
  t.isArray({});
  t.end();

  test.contains(t.results[0], {
    type: `is isArray`,
    success: true,
    actual: [],
    expected: undefined,
  });
  test.contains(t.results[1], {
    type: `is isArray`,
    message: 'hello',
    success: true,
    actual: [],
    expected: undefined,
  });
  test.contains(t.results[2], {
    type: `is isArray`,
    success: false,
    actual: {},
    expected: undefined,
  });
});

metatests.testSync('imperative#isBuffer', test => {
  const t = new metatests.ImperativeTest();
  t.isBuffer(Buffer.from(''));
  t.isBuffer(Buffer.from(''), 'hello');
  t.isBuffer({});
  t.end();

  test.contains(t.results[0], {
    type: `is isBuffer`,
    success: true,
    actual: Buffer.from(''),
    expected: undefined,
  });
  test.contains(t.results[1], {
    type: `is isBuffer`,
    message: 'hello',
    success: true,
    actual: Buffer.from(''),
    expected: undefined,
  });
  test.contains(t.results[2], {
    type: `is isBuffer`,
    success: false,
    actual: {},
    expected: undefined,
  });
});
