export function equal(val1: any, val2: any): boolean;

export function strictEqual(val1: any, val2: any): boolean;

export function errorCompare(err1: Error, err2: Error): boolean;

export function sameTopology(obj1: object, obj2: object): boolean;

export function contains(
  sort?: boolean | Function,
  nestedCompare?: (actual: any, expected: any) => boolean,
): (obj1: object | Array<any>, obj2: object | Array<any>) => boolean;

export function containsGreedy(
  nestedCompare?: (actual: any, expected: any) => boolean,
): (obj1: object | Array<any>, obj2: object | Array<any>) => boolean;
