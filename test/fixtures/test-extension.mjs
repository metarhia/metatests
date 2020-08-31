import metatests from '../../metatests.js';

metatests.testSync('must support MJS extension', test => {
  test.strictSame(2 + 2, 4);
})
