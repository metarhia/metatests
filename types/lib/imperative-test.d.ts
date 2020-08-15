import { Test, TestContext, TestOptions } from './test';
import { Runner } from './runner';
import { DeclarativeTest } from './declarative-test';

export interface ImperativeTestResult {
  type: string;
  success: boolean;
  message?: string;
  expected?: any;
  actual?: any;
  stack: string;
}

export interface ImperativeTestOptions<
  C extends TestContext = {},
  R extends Runner = Runner
> extends TestOptions<C, R> {
  run: boolean;
  async: boolean;
  timeout: number;
  parallelSubtests: boolean;
  dependentSubtests: boolean;
}

export class BailoutError extends Error {}

export class ImperativeTest<C extends TestContext = {}> extends Test<
  ImperativeTestResult,
  ImperativeTestOptions<C>
> {
  constructor(
    caption: string,
    func: (test: ImperativeTest) => any | Promise<any>,
    options: ImperativeTestOptions
  );

  // Mark this test to call end after its subtests are done.
  endAfterSubtests(): void;

  // Mark this test to call end after its subtests are done.
  beforeEach(
    func: (
      subtest: ImperativeTest,
      callback: (context: this['context']) => void
    ) => void
  ): void;
  beforeEach(func: (subtest: ImperativeTest) => Promise<this['context']>): void;

  // Set a function to run after each subtest.
  afterEach(
    func: (subtest: ImperativeTest, callback: () => void) => void
  ): void;
  afterEach(func: (subtest: ImperativeTest) => Promise<void>): void;

  // Create a subtest of this test.
  test<C extends TestContext = {}>(
    message: string,
    func: (test: ImperativeTest<C>) => any | Promise<any>,
    options: ImperativeTestOptions<C>
  ): ImperativeTest<C>;

  // Create an asynchronous subtest of this test.
  testAsync<C extends TestContext = {}>(
    message: string,
    func: (test: ImperativeTest<C>) => any | Promise<any>,
    options: ImperativeTestOptions<C>
  ): ImperativeTest<C>;

  // Create a synchronous subtest of this test
  testSync<C extends TestContext = {}>(
    message: string,
    func: (test: ImperativeTest<C>) => any | Promise<any>,
    options: ImperativeTestOptions<C>
  ): ImperativeTest<C>;

  // Create a declarative `{case()}` subtest of this test.
  case(
    caption: string,
    namespace: Record<string, any>,
    list: Record<string, any[]>,
    options: TestOptions
  ): DeclarativeTest;

  // Compare actual and expected for non-strict equality.
  equal(actual: any, expected: any, message?: string): void;
  // Compare actual and expected for non-strict equality.
  same(actual: any, expected: any, message?: string): void;

  // Compare actual and expected for non-strict not-equality.
  notEqual(actual: any, expected: any, message?: string): void;

  // Compare actual and expected for strict equality.
  strictEqual(actual: any, expected: any, message?: string): void;
  // Compare actual and expected for strict equality.
  strictSame(actual: any, expected: any, message?: string): void;

  // Compare actual and expected for strict non-equality.
  strictNotSame(actual: any, expected: any, message?: string): void;

  // Compare actual and expected to have same topology.
  sameTopology(obj1: any, obj2: any, message?: string): void;

  // Compare actual and expected to not have the same topology.
  notSameTopology(obj1: any, obj2: any, message?: string): void;

  // Check if value is truthy.
  assert(value: any, message?: string): void;
  // Check if value is truthy.
  ok(value: any, message?: string): void;

  // Check if value is falsy.
  assertNot(value: any, message?: string): void;
  // Check if value is falsy.
  notOk(value: any, message?: string): void;

  // Fail this test recording failure message.
  fail(err: Error): void;
  // Fail this test recording failure message.
  fail(message: string, err: Error): void;

  // Fail if err is instance of Error.
  error(err: any, message?: string): void;

  // Check if obj is of specified type.
  type(obj: any, type: string | (new () => any), message?: string): void;

  // Check if actual is equal to expected error.
  isError(actual: any, expected: Error, message?: string): void;

  // Check that fn throws expected error.
  throws(fn: () => void, expected: Error, message?: string): void;

  // Check that fn doesn't throw.
  doesNotThrow(fn: () => void, message?: string): void;

  // Check that fn is called specified amount of times.
  mustCall<F extends () => {} = () => {}>(
    fn?: F,
    count?: number,
    name?: string
  ): F;

  // Check that fn is not called.
  mustNotCall<F extends () => {} = () => {}>(fn?: F, name?: string): F;

  // Check that actual contains all properties of subObj.
  contains<T, A extends Iterable<T>, S extends Iterable<T>>(
    actual: A,
    subObj: S,
    message?: string,
    sort?: boolean,
    test?: (a: T, b: T) => boolean
  ): void;

  // Check greedily that actual contains all properties of subObj.
  containsGreedy<T, A extends Iterable<T>, S extends Iterable<T>>(
    actual: A,
    subObj: S,
    message?: string,
    test?: (a: T, b: T) => boolean
  ): void;

  // Fail this test and throw an error.
  bailout(message: string): void;
  // Fail this test and throw an error.
  bailout(err: Error, message: string): void;

  // Create error-first callback wrapper to perform automatic checks.
  cb<F extends (err: Error, ...args: any[]) => {}>(cb: F): F;
  // Create error-first callback wrapper to perform automatic checks.
  cb<F extends (err: Error, ...args: any[]) => {}>(msg: string, cb: F): F;

  // Create error-first callback wrapper to fail test if call fails.
  cbFail<A extends any[], R, F extends (err: Error, ...args: A) => R>(
    fail: string,
    cb: F,
    afterAllCb: () => void
  ): (...args: A) => R;
  // Create error-first callback wrapper to fail test if call fails.
  cbFail<A extends any[], R, F extends (err: Error, ...args: A) => R>(
    cb: F,
    afterAllCb: () => void
  ): (...args: A) => R;

  // Verify that input resolves.
  resolves<T>(input: Promise<T> | (() => Promise<T>), expected?: T): Promise<T>;
  // Verify that input resolves.
  isResolved<T>(
    input: Promise<T> | (() => Promise<T>),
    expected?: T
  ): Promise<T>;

  // Check that input rejects.
  rejects<T, E extends Error>(
    input: Promise<T> | (() => Promise<T>),
    err: Error
  ): Promise<E>;
  // Check that input rejects.
  isRejected<T, E extends Error>(
    input: Promise<T> | (() => Promise<T>),
    err: Error
  ): Promise<E>;

  // Check whether `val` satisfies custom `checkFn` condition.
  is<T>(checkFn: (val: T) => boolean, val: T, message?: string): void;

  // Check if `val` satisfies `Array.isArray`.
  isArray(val: any, message?: string): void;

  // Check if `val` satisfies `Buffer.isBuffer`.
  isBuffer(val: any, message?: string): void;

  // Test whether input matches the provided RegExp
  regex(regex: RegExp | string, input: string, message?: string): void;

  // Plan this test to have exactly n assertions and end test after
  // this amount of assertions is reached.
  plan(n: number): void;

  // Record a passing assertion.
  pass(message?: string): void;

  on(name: 'done', listener: (test: this) => void): this;
}

// Create a test case.
export function test<C extends TestContext = {}, R extends Runner = Runner>(
  caption: string,
  func: (test: ImperativeTest) => any | Promise<any>,
  options: ImperativeTestOptions,
  runner?: R
): ImperativeTest<C>;

// Create an asynchronous test
export function testAsync<
  C extends TestContext = {},
  R extends Runner = Runner
>(
  caption: string,
  func: (test: ImperativeTest) => any | Promise<any>,
  options: ImperativeTestOptions,
  runner?: R
): ImperativeTest<C>;

// Create a synchronous test
export function testSync<C extends TestContext = {}, R extends Runner = Runner>(
  caption: string,
  func: (test: ImperativeTest) => any | Promise<any>,
  options: ImperativeTestOptions,
  runner?: R
): ImperativeTest<C>;
