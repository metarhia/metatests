import metatests from './metatests.js';

const {
  case: caseTest,
  DeclarativeTest,
  equal,
  strictEqual,
  reporters,
  runner,
  speed,
  measure,
  convertToCsv,
  ImperativeTest,
  test,
  testSync,
  testAsync,
} = metatests;

export default metatests;

export {
  caseTest as case,
  DeclarativeTest,
  equal,
  strictEqual,
  reporters,
  runner,
  speed,
  measure,
  convertToCsv,
  ImperativeTest,
  test,
  testSync,
  testAsync,
};
