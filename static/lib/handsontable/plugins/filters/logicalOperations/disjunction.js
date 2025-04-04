"use strict";

exports.__esModule = true;
exports.operationResult = operationResult;
var C = _interopRequireWildcard(require("../../../i18n/constants"));
var _logicalOperationRegisterer = require("../logicalOperationRegisterer");
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && {}.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
const OPERATION_ID = exports.OPERATION_ID = 'disjunction';
const SHORT_NAME_FOR_COMPONENT = exports.SHORT_NAME_FOR_COMPONENT = C.FILTERS_LABELS_DISJUNCTION;
// (p OR q OR w OR x OR...) === TRUE?

/**
 * @param {Array} conditions An array with values to check.
 * @param {*} value The comparable value.
 * @returns {boolean}
 */
function operationResult(conditions, value) {
  return conditions.some(condition => condition.func(value));
}
(0, _logicalOperationRegisterer.registerOperation)(OPERATION_ID, SHORT_NAME_FOR_COMPONENT, operationResult);