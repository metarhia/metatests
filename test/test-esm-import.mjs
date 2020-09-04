import metatests, {
  test,
  testSync,
  testAsync,
  case as caseTest,
  DeclarativeTest,
  speed,
  measure,
  convertToCsv,
  ImperativeTest,
} from '../metatests.mjs';

test('must support named imports: test', test => {
  test.strictSame(2 + 2, 4);
  test.end();
});

testSync('must support named imports: testSync', test => {
  test.strictSame(2 + 2, 4);
});

testAsync('must support named imports: testAsync', test => {
  test.strictSame(2 + 2, 4);
  test.end();
});

testSync('must support other named imports', test => {
  test.type(caseTest, 'function');
  test.type(speed, 'function');
  test.type(measure, 'function');
  test.type(convertToCsv, 'function');
  test.type(DeclarativeTest, 'function');
  test.type(DeclarativeTest.prototype, 'DeclarativeTest');
  test.type(ImperativeTest, 'function');
  test.type(ImperativeTest.prototype, 'ImperativeTest');
});
