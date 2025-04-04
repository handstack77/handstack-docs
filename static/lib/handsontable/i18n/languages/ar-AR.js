"use strict";

exports.__esModule = true;
var C = _interopRequireWildcard(require("../constants"));
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && {}.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
/**
 * @preserve
 * Authors: Handsoncode
 * Last updated: Feb 9, 2022
 *
 * Description: Definition file for Arabic - Without a specific country.
 */

const dictionary = {
  languageCode: 'ar-AR',
  languageDirection: 'rtl',
  [C.CONTEXTMENU_ITEMS_NO_ITEMS]: 'لا توجد خيارات متوفرة',
  [C.CONTEXTMENU_ITEMS_ROW_ABOVE]: 'إدراج صف للأعلى',
  [C.CONTEXTMENU_ITEMS_ROW_BELOW]: 'إدراج صف للأسفل',
  [C.CONTEXTMENU_ITEMS_INSERT_LEFT]: 'إدراج عمود لليسار',
  [C.CONTEXTMENU_ITEMS_INSERT_RIGHT]: 'إدراج عمود لليمين',
  [C.CONTEXTMENU_ITEMS_REMOVE_ROW]: ['احدف الصف', 'احذف الصفوف'],
  [C.CONTEXTMENU_ITEMS_REMOVE_COLUMN]: ['احدف العمود', 'احدف الأعمدة'],
  [C.CONTEXTMENU_ITEMS_UNDO]: 'تراجع',
  [C.CONTEXTMENU_ITEMS_REDO]: 'إلغاء التراجع',
  [C.CONTEXTMENU_ITEMS_READ_ONLY]: 'للقراءة فقط',
  [C.CONTEXTMENU_ITEMS_CLEAR_COLUMN]: 'افرغ العمود',
  [C.CONTEXTMENU_ITEMS_ALIGNMENT]: 'المحاذاة',
  [C.CONTEXTMENU_ITEMS_ALIGNMENT_LEFT]: 'يسار',
  [C.CONTEXTMENU_ITEMS_ALIGNMENT_CENTER]: 'وسط',
  [C.CONTEXTMENU_ITEMS_ALIGNMENT_RIGHT]: 'يمين',
  [C.CONTEXTMENU_ITEMS_ALIGNMENT_JUSTIFY]: 'بالتساوي',
  [C.CONTEXTMENU_ITEMS_ALIGNMENT_TOP]: 'أعلى',
  [C.CONTEXTMENU_ITEMS_ALIGNMENT_MIDDLE]: 'متوسط',
  [C.CONTEXTMENU_ITEMS_ALIGNMENT_BOTTOM]: 'أسفل',
  [C.CONTEXTMENU_ITEMS_FREEZE_COLUMN]: 'تجميد العمود',
  [C.CONTEXTMENU_ITEMS_UNFREEZE_COLUMN]: 'إلغاء تجميد العمود',
  [C.CONTEXTMENU_ITEMS_BORDERS]: 'الحدود',
  [C.CONTEXTMENU_ITEMS_BORDERS_TOP]: 'أعلى',
  [C.CONTEXTMENU_ITEMS_BORDERS_RIGHT]: 'يمين',
  [C.CONTEXTMENU_ITEMS_BORDERS_BOTTOM]: 'أسفل',
  [C.CONTEXTMENU_ITEMS_BORDERS_LEFT]: 'يسار',
  [C.CONTEXTMENU_ITEMS_REMOVE_BORDERS]: 'أحذف الحد(ود)',
  [C.CONTEXTMENU_ITEMS_ADD_COMMENT]: 'أضف تعليقاً',
  [C.CONTEXTMENU_ITEMS_EDIT_COMMENT]: 'تعديل التعليق',
  [C.CONTEXTMENU_ITEMS_REMOVE_COMMENT]: 'احذف التعليق',
  [C.CONTEXTMENU_ITEMS_READ_ONLY_COMMENT]: 'تعليق للقراءة فقط',
  [C.CONTEXTMENU_ITEMS_MERGE_CELLS]: 'ادمج الخلايا',
  [C.CONTEXTMENU_ITEMS_UNMERGE_CELLS]: 'إلغاء دمج الخلايا',
  [C.CONTEXTMENU_ITEMS_COPY]: 'نسخ',
  [C.CONTEXTMENU_ITEMS_CUT]: 'قص',
  [C.CONTEXTMENU_ITEMS_NESTED_ROWS_INSERT_CHILD]: 'أدخل صفاً فرعياً',
  [C.CONTEXTMENU_ITEMS_NESTED_ROWS_DETACH_CHILD]: 'افصل عن الصف الأصلي',
  [C.CONTEXTMENU_ITEMS_HIDE_COLUMN]: ['إخفاء العمود', 'إخفاء الأعمدة'],
  [C.CONTEXTMENU_ITEMS_SHOW_COLUMN]: ['إظهار العمود', 'إظهار الأعمدة'],
  [C.CONTEXTMENU_ITEMS_HIDE_ROW]: ['إخفاء السطر', 'إخفاء السطور'],
  [C.CONTEXTMENU_ITEMS_SHOW_ROW]: ['إظهار السطر', 'إظهار السطور'],
  [C.FILTERS_CONDITIONS_NONE]: 'بلا',
  [C.FILTERS_CONDITIONS_EMPTY]: 'فارغ',
  [C.FILTERS_CONDITIONS_NOT_EMPTY]: 'غير فارغ',
  [C.FILTERS_CONDITIONS_EQUAL]: 'يساوي',
  [C.FILTERS_CONDITIONS_NOT_EQUAL]: 'لا يساوي',
  [C.FILTERS_CONDITIONS_BEGINS_WITH]: 'يبداً بـ',
  [C.FILTERS_CONDITIONS_ENDS_WITH]: 'ينتهي بـ',
  [C.FILTERS_CONDITIONS_CONTAINS]: 'يحتوي',
  [C.FILTERS_CONDITIONS_NOT_CONTAIN]: 'لا يحتوي',
  [C.FILTERS_CONDITIONS_GREATER_THAN]: 'أكبر من',
  [C.FILTERS_CONDITIONS_GREATER_THAN_OR_EQUAL]: 'أكبر أو يساوي',
  [C.FILTERS_CONDITIONS_LESS_THAN]: 'أصغر',
  [C.FILTERS_CONDITIONS_LESS_THAN_OR_EQUAL]: 'أصغر أو يساوي',
  [C.FILTERS_CONDITIONS_BETWEEN]: 'بين',
  [C.FILTERS_CONDITIONS_NOT_BETWEEN]: 'خارج المجال',
  [C.FILTERS_CONDITIONS_AFTER]: 'بعد',
  [C.FILTERS_CONDITIONS_BEFORE]: 'قبل',
  [C.FILTERS_CONDITIONS_TODAY]: 'اليوم',
  [C.FILTERS_CONDITIONS_TOMORROW]: 'غداً',
  [C.FILTERS_CONDITIONS_YESTERDAY]: 'البارحة',
  [C.FILTERS_VALUES_BLANK_CELLS]: 'خلايا فارغة',
  [C.FILTERS_DIVS_FILTER_BY_CONDITION]: 'تصفية حسب الشرط',
  [C.FILTERS_DIVS_FILTER_BY_VALUE]: 'تصفية حسب القيمة',
  [C.FILTERS_LABELS_CONJUNCTION]: 'و',
  [C.FILTERS_LABELS_DISJUNCTION]: 'أو',
  [C.FILTERS_BUTTONS_SELECT_ALL]: 'اختيار الكل',
  [C.FILTERS_BUTTONS_CLEAR]: 'إلغاء',
  [C.FILTERS_BUTTONS_OK]: 'موافق',
  [C.FILTERS_BUTTONS_CANCEL]: 'إلغاء',
  [C.FILTERS_BUTTONS_PLACEHOLDER_SEARCH]: 'البحث',
  [C.FILTERS_BUTTONS_PLACEHOLDER_VALUE]: 'القيمة',
  [C.FILTERS_BUTTONS_PLACEHOLDER_SECOND_VALUE]: 'القيمة الثانية'
};
var _default = exports.default = dictionary;