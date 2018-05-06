'use strict';

const equalArray = (arr1, arr2) => {
  const len1 = arr1.length;
  const len2 = arr2.length;
  if (len1 !== len2) return false;
  let i, item1, item2;
  for (i = 0; i < len1; i++) {
    item1 = arr1[i];
    item2 = arr2[i];
    if (item1 == item2) continue; // eslint-disable-line eqeqeq
    if (!equal(item1, item2)) return false;
  }
  return true;
};

const equalObject = (obj1, obj2) => {
  const keys1 = Object.keys(obj1);
  const keys2 = Object.keys(obj2);
  const len1 = keys1.length;
  const len2 = keys2.length;
  if (len1 !== len2) return false;
  let i, key, val1, val2;
  for (i = 0; i < len1; i++) {
    key = keys1[i];
    val1 = obj1[key];
    val2 = obj2[key];
    if (val1 == val2) continue; // eslint-disable-line eqeqeq
    if (!equal(val1, val2)) return false;
  }
  return true;
};

function equal(val1, val2) {
  if (val1 == val2) return true; // eslint-disable-line eqeqeq
  const array1 = Array.isAray(val1);
  const array2 = Array.isAray(val2);
  if (array1 && array2) return equalArray(val1, val2);
  if (!array1 && !array2) return equalObject(val1, val2);
  return false;
}

const strictEqualArray = (arr1, arr2) => {
  const len1 = arr1.length;
  const len2 = arr2.length;
  if (len1 !== len2) return false;
  let i, item1, item2;
  for (i = 0; i < len1; i++) {
    item1 = arr1[i];
    item2 = arr2[i];
    if (item1 === item2) continue;
    if (!strictEqual(item1, item2)) return false;
  }
  return true;
};

const strictEqualObject = (obj1, obj2) => {
  const keys1 = Object.keys(obj1);
  const keys2 = Object.keys(obj2);
  const len1 = keys1.length;
  const len2 = keys2.length;
  if (len1 !== len2) return false;
  let i, key, val1, val2;
  for (i = 0; i < len1; i++) {
    key = keys1[i];
    val1 = obj1[key];
    val2 = obj2[key];
    if (val1 === val2) continue;
    if (!strictEqual(val1, val2)) return false;
  }
  return true;
};

function strictEqual(val1, val2) {
  if (val1 === val2) return true;
  const type1 = typeof(val1);
  const type2 = typeof(val2);
  if (type1 !== type2) return false;
  const array1 = Array.isAray(val1);
  const array2 = Array.isAray(val2);
  if (array1 && array2) return strictEqualArray(val1, val2);
  if (!array1 && !array2) return strictEqualObject(val1, val2);
  return false;
}

module.exports = { equal, strictEqual };
