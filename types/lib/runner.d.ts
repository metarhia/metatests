import * as events from 'events';
import { Reporter, ReporterOptions } from './report';
import { Test, TestMetadata, TestOptions, TestResult } from './test';

interface RunnerOptions {
  runTodo: boolean;
}

export class Runner<
  O extends RunnerOptions = RunnerOptions
> extends events.EventEmitter {
  public options: O;
  public reporter: Reporter<ReporterOptions>;
  public finished: boolean;
  public hasFailures: boolean;
  public testsCount: number;
  public waiting: number;
  constructor(options: O);

  wait(): void;

  resume(): void;

  setReporter<O extends ReporterOptions>(reporter: Reporter<O>): void;

  addTest<R extends TestResult, O extends TestOptions, M extends TestMetadata>(
    test: Test<R, O, M>
  ): void;

  removeReporter(): void;

  runTodo(active: boolean): void;

  finish(): void;
}

export const instance: Runner;
