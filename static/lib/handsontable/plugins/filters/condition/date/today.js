"use strict";

exports.__esModule = true;
exports.condition = condition;
var _moment = _interopRequireDefault(require("moment"));
var C = _interopRequireWildcard(require("../../../../i18n/constants"));
var _conditionRegisterer = require("../../conditionRegisterer");
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && {}.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
const CONDITION_NAME = exports.CONDITION_NAME = 'date_today';

/**
 * @param {object} dataRow The object which holds and describes the single cell value.
 * @returns {boolean}
 */
function condition(dataRow) {
  const date = (0, _moment.default)(dataRow.value, dataRow.meta.dateFormat);
  if (!date.isValid()) {
    return false;
  }
  return date.isSame((0, _moment.default)().startOf('day'), 'd');
}
(0, _conditionRegisterer.registerCondition)(CONDITION_NAME, condition, {
  name: C.FILTERS_CONDITIONS_TODAY,
  inputsCount: 0
});