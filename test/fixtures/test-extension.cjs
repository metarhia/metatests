const { testSync } = require('../../metatests.js');

testSync('must support CJS extension', test => {
  test.strictSame(2 + 2, 4);
});
