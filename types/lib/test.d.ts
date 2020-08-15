import { Runner } from './runner';
import * as events from 'events';

export interface TestContext {}

interface TestOptions<C extends TestContext = {}, R extends Runner = Runner> {
  id: number;
  todo: boolean;
  context: C;
  runner: R;
}

interface TestResult {}

interface TestMetadata {
  filepath: string;
}

export class Test<
  R extends TestResult = TestResult,
  O extends TestOptions = TestOptions,
  M extends TestMetadata = TestMetadata
> extends events.EventEmitter {
  public caption: string;
  public results: R[];
  public done: boolean;
  public succeeded: boolean | undefined;
  public options: O;
  public id: number;
  public todo: boolean;
  public output: string;
  public context: O['context'];
  public metadata: M;

  log(...args: any[]): void;

  get success(): boolean;

  erroer(type: string, error?: Error): void;

  end(): void;
}
