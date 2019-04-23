'use strict';

const equalArray = (arr1, arr2) => {
  const len1 = arr1.length;
  const len2 = arr2.length;
  if (len1 !== len2) return false;
  for (let i = 0; i < len1; i++) {
    if (!equal(arr1[i], arr2[i])) return false;
  }
  return true;
};

const equalObject = (obj1, obj2) => {
  if (obj1 === null || obj2 === null) return obj1 === obj2;
  const keys1 = Object.keys(obj1);
  const keys2 = Object.keys(obj2);
  const len1 = keys1.length;
  const len2 = keys2.length;
  if (len1 !== len2) return false;
  for (let i = 0; i < len1; i++) {
    const key = keys1[i];
    if (!equal(obj1[key], obj2[key])) return false;
  }
  return true;
};

const nativeFunctionPattern = /^function \w*\(\) \{ \[native code\] \}$/;
const equalFunction = (func1, func2) => {
  if (func1 === null || func2 === null) return func1 === func2;
  const f1Str = func1.toString();
  const f2Str = func2.toString();
  return (
    !nativeFunctionPattern.test(f1Str) &&
    !nativeFunctionPattern.test(f2Str) &&
    f1Str === f2Str
  );
};

function equal(val1, val2) {
  if (val1 == val2) return true; // eslint-disable-line eqeqeq
  const isArray1 = Array.isArray(val1);
  const isArray2 = Array.isArray(val2);
  if (isArray1 !== isArray2) return false;
  if (isArray1 && isArray2) return equalArray(val1, val2);
  const type1 = typeof val1;
  const type2 = typeof val2;
  if (type1 !== type2) return false;
  if (type1 === 'object') return equalObject(val1, val2);
  if (type1 === 'function') return equalFunction(val1, val2);
  return Number.isNaN(val1) && Number.isNaN(val2);
}

const strictEqualArray = (arr1, arr2) => {
  const len1 = arr1.length;
  const len2 = arr2.length;
  if (len1 !== len2) return false;
  for (let i = 0; i < len1; i++) {
    if (!strictEqual(arr1[i], arr2[i])) return false;
  }
  return true;
};

const strictEqualObject = (obj1, obj2) => {
  if (obj1 === null || obj2 === null) return obj1 === obj2;
  const keys1 = Object.keys(obj1);
  const keys2 = Object.keys(obj2);
  const len1 = keys1.length;
  const len2 = keys2.length;
  if (len1 !== len2) return false;
  for (let i = 0; i < len1; i++) {
    const key = keys1[i];
    if (!strictEqual(obj1[key], obj2[key])) return false;
  }
  return true;
};

function strictEqual(val1, val2) {
  if (val1 === val2) return true;
  const isArray1 = Array.isArray(val1);
  const isArray2 = Array.isArray(val2);
  if (isArray1 !== isArray2) return false;
  const type1 = typeof val1;
  const type2 = typeof val2;
  if (type1 !== type2) return false;
  if (isArray1) return strictEqualArray(val1, val2);
  if (type1 === 'object') return strictEqualObject(val1, val2);
  if (type1 === 'function') return equalFunction(val1, val2);
  return Number.isNaN(val1) && Number.isNaN(val2);
}

function errorCompare(err1, err2) {
  return (
    err1 instanceof err2.constructor &&
    (!err2.message || err1.message === err2.message)
  );
}

function sameTopology(obj1, obj2, ref1 = [], ref2 = []) {
  ref1.push(obj1);
  ref2.push(obj2);

  if (Array.isArray(obj1) !== Array.isArray(obj2)) return false;

  for (const key in obj1) {
    const val1 = obj1[key];
    const val2 = obj2[key];

    const index1 = ref1.indexOf(val1);
    if (index1 === -1) {
      if (
        typeof val1 === 'object' &&
        val1 &&
        typeof val2 === 'object' &&
        val2
      ) {
        if (!sameTopology(val1, val2, [...ref1], [...ref2])) {
          return false;
        }
      } else if (typeof val1 === 'function' && !equalFunction(val1, val2)) {
        return false;
      } else if (Number.isNaN(val1) !== Number.isNaN(val2)) {
        return false;
      } else if (val1 !== val2) {
        return false;
      }
    } else if (index1 !== ref2.indexOf(obj2[key])) {
      return false;
    }
  }

  return true;
}

module.exports = {
  equal,
  strictEqual,
  errorCompare,
  sameTopology,
};
