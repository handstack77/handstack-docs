import "core-js/modules/es.array.push.js";
import "core-js/modules/esnext.set.difference.v2.js";
import "core-js/modules/esnext.set.intersection.v2.js";
import "core-js/modules/esnext.set.is-disjoint-from.v2.js";
import "core-js/modules/esnext.set.is-subset-of.v2.js";
import "core-js/modules/esnext.set.is-superset-of.v2.js";
import "core-js/modules/esnext.set.symmetric-difference.v2.js";
import "core-js/modules/esnext.set.union.v2.js";
import { getComparisonFunction } from "../../helpers/feature.mjs";
import { arrayUnique, arrayEach } from "../../helpers/array.mjs";
const sortCompare = getComparisonFunction();

/**
 * Comparison function for sorting purposes.
 *
 * @param {*} a The first value to compare.
 * @param {*} b The second value to compare.
 * @returns {number} Returns number from -1 to 1.
 */
export function sortComparison(a, b) {
  if (typeof a === 'number' && typeof b === 'number') {
    return a - b;
  }
  return sortCompare(a, b);
}

/**
 * Convert raw value into visual value.
 *
 * @param {*} value The value to convert.
 * @param {string} defaultEmptyValue Default value for empty cells.
 * @returns {*}
 */
export function toVisualValue(value, defaultEmptyValue) {
  let visualValue = value;
  if (visualValue === '') {
    visualValue = `(${defaultEmptyValue})`;
  }
  return visualValue;
}
const SUPPORT_SET_CONSTRUCTOR = new Set([1]).has(1);
const SUPPORT_FAST_DEDUPE = SUPPORT_SET_CONSTRUCTOR && typeof Array.from === 'function';

/**
 * Create an array assertion to compare if an element exists in that array (in a more efficient way than .indexOf).
 *
 * @param {Array} initialData Values to compare.
 * @returns {Function}
 */
export function createArrayAssertion(initialData) {
  let dataset = initialData;
  if (SUPPORT_SET_CONSTRUCTOR) {
    dataset = new Set(dataset);
  }
  return function (value) {
    let result;
    if (SUPPORT_SET_CONSTRUCTOR) {
      result = dataset.has(value);
    } else {
      /* eslint-disable no-bitwise */
      result = !!~dataset.indexOf(value);
    }
    return result;
  };
}

/**
 * Convert empty-ish values like null and undefined to an empty string.
 *
 * @param {*} value Value to check.
 * @returns {string}
 */
export function toEmptyString(value) {
  return value === null || value === undefined ? '' : value;
}

/**
 * Unify column values (remove duplicated values and sort them).
 *
 * @param {Array} values An array of values.
 * @returns {Array}
 */
export function unifyColumnValues(values) {
  let unifiedValues = values;
  if (SUPPORT_FAST_DEDUPE) {
    unifiedValues = Array.from(new Set(unifiedValues));
  } else {
    unifiedValues = arrayUnique(unifiedValues);
  }
  unifiedValues = unifiedValues.sort((a, b) => {
    if (typeof a === 'number' && typeof b === 'number') {
      return a - b;
    }
    if (a === b) {
      return 0;
    }
    return a > b ? 1 : -1;
  });
  return unifiedValues;
}

/**
 * Intersect 'base' values with 'selected' values and return an array of object.
 *
 * @param {Array} base An array of base values.
 * @param {Array} selected An array of selected values.
 * @param {string} defaultEmptyValue Default value for empty cells.
 * @param {Function} [callback] A callback function which is invoked for every item in an array.
 * @returns {Array}
 */
export function intersectValues(base, selected, defaultEmptyValue, callback) {
  const result = [];
  const same = base === selected;
  let selectedItemsAssertion;
  if (!same) {
    selectedItemsAssertion = createArrayAssertion(selected);
  }
  arrayEach(base, value => {
    let checked = false;
    if (same || selectedItemsAssertion(value)) {
      checked = true;
    }
    const item = {
      checked,
      value,
      visualValue: toVisualValue(value, defaultEmptyValue)
    };
    if (callback) {
      callback(item);
    }
    result.push(item);
  });
  return result;
}