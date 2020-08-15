import { Test, TestMetadata, TestOptions, TestResult } from './test';

export interface ReporterOptions {
  stream: NodeJS.WritableStream;
}

export class Reporter<O extends ReporterOptions> {
  //   options <Object>
  //     stream <stream.Writable> optional
  constructor(options: O);

  // Record test
  record<R extends TestResult, O extends TestOptions, M extends TestMetadata>(
    test: Test<R, O, M>
  ): void;

  // Fail test with error
  error<R extends TestResult, O extends TestOptions, M extends TestMetadata>(
    test: Test<R, O, M>,
    error: Error
  ): void;

  finish(): void;

  log(...args: any[]): void;

  logComment(...args: any[]): void;
}

export class ConciseReporter extends Reporter<ReporterOptions> {}

export class TapReporter extends Reporter<ReporterOptions> {}
