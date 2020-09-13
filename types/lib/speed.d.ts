export type MeasureCase =
  | {
      fn: () => any;
      name?: string;
      argCases: Array<any[]>;
      n: number;
    }
  | (() => any);

export interface MeasureResult {
  name: string;
  args: any[];
  count: number;
  time: number;
  result: any;
}

export interface MeasureOptions {
  defaultCount: number;
  preflight: number;
  preflightCount: number;
  runs: number;
  listener: {
    preflight?: (name: string, count: number, args: any[]) => void;
    run?: (name: string, count: number, args: any[]) => void;
    cycle?: (name: string, results: MeasureResult) => void;
    done?: (name: string, args: any[], results: MeasureResult[]) => void;
    finish?: (results: MeasureResult[]) => void;
  };
}

// Microbenchmark each passed configuration multiple times
export function measure(
  cases: MeasureCase,
  options?: MeasureOptions
): MeasureResult[];

// Microbenchmark each passed function and compare results.
export function speed(
  caption: string,
  count: number,
  cases: Array<() => {}>
): void;

// Convert metatests.measure result to csv.
export function convertToCsv(results: MeasureResult[]): string;
