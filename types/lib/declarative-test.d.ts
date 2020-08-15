import { Test, TestOptions } from './test';
import { Runner } from './runner';

export interface DeclarativeTestResult {
  success: boolean;
  caption: string;
  type: 'declarative';
  actual: any;
  expected: any;
  message?: string;
  stack: string;
}

export class DeclarativeTest extends Test<DeclarativeTestResult> {
  constructor(
    caption: string,
    namespace: Record<string, any>,
    list: Record<string, any[]>,
    options: TestOptions
  );
}

// Create declarative test.
declare function checkCase(
  caption: string,
  namespace: Record<string, any>,
  list: Record<string, any[]>,
  runner: Runner
): DeclarativeTest;

export { checkCase as case };
