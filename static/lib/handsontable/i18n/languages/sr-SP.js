"use strict";

exports.__esModule = true;
var C = _interopRequireWildcard(require("../constants"));
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && {}.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
/**
 * @preserve
 * Author: Ivan Zarkovic
 * Last updated: May 9, 2022
 *
 * Description: Definition file for Serbian - Republic of Serbia language-country.
 */

const dictionary = {
  languageCode: 'sr-SP',
  [C.CONTEXTMENU_ITEMS_NO_ITEMS]: 'Nema dostupnih opcija',
  [C.CONTEXTMENU_ITEMS_ROW_ABOVE]: 'Unesi red iznad',
  [C.CONTEXTMENU_ITEMS_ROW_BELOW]: 'Unesi red ispod',
  [C.CONTEXTMENU_ITEMS_INSERT_LEFT]: 'Unesi kolonu levo',
  [C.CONTEXTMENU_ITEMS_INSERT_RIGHT]: 'Insert kolonu desno',
  [C.CONTEXTMENU_ITEMS_REMOVE_ROW]: ['Ukloni red', 'Ukloni redove'],
  [C.CONTEXTMENU_ITEMS_REMOVE_COLUMN]: ['Ukloni kolonu', 'Ukloni kolone'],
  [C.CONTEXTMENU_ITEMS_UNDO]: 'Poništi',
  [C.CONTEXTMENU_ITEMS_REDO]: 'Ponovi',
  [C.CONTEXTMENU_ITEMS_READ_ONLY]: 'Samo za čitanje',
  [C.CONTEXTMENU_ITEMS_CLEAR_COLUMN]: 'Obriši kolonu',
  [C.CONTEXTMENU_ITEMS_ALIGNMENT]: 'Poravnanje',
  [C.CONTEXTMENU_ITEMS_ALIGNMENT_LEFT]: 'Levo',
  [C.CONTEXTMENU_ITEMS_ALIGNMENT_CENTER]: 'Centar',
  [C.CONTEXTMENU_ITEMS_ALIGNMENT_RIGHT]: 'Desno',
  [C.CONTEXTMENU_ITEMS_ALIGNMENT_JUSTIFY]: 'Složeno',
  [C.CONTEXTMENU_ITEMS_ALIGNMENT_TOP]: 'Gore',
  [C.CONTEXTMENU_ITEMS_ALIGNMENT_MIDDLE]: 'Sredina',
  [C.CONTEXTMENU_ITEMS_ALIGNMENT_BOTTOM]: 'Dole',
  [C.CONTEXTMENU_ITEMS_FREEZE_COLUMN]: 'Zamrzni kolonu',
  [C.CONTEXTMENU_ITEMS_UNFREEZE_COLUMN]: 'Odmrzni kolonu',
  [C.CONTEXTMENU_ITEMS_BORDERS]: 'Ivica',
  [C.CONTEXTMENU_ITEMS_BORDERS_TOP]: 'Gore',
  [C.CONTEXTMENU_ITEMS_BORDERS_RIGHT]: 'Desno',
  [C.CONTEXTMENU_ITEMS_BORDERS_BOTTOM]: 'Dole',
  [C.CONTEXTMENU_ITEMS_BORDERS_LEFT]: 'Levo',
  [C.CONTEXTMENU_ITEMS_REMOVE_BORDERS]: 'Ukloni ivicu(e)',
  [C.CONTEXTMENU_ITEMS_ADD_COMMENT]: 'Dodaj komentar',
  [C.CONTEXTMENU_ITEMS_EDIT_COMMENT]: 'Izmeni komentar',
  [C.CONTEXTMENU_ITEMS_REMOVE_COMMENT]: 'Obriši komentar',
  [C.CONTEXTMENU_ITEMS_READ_ONLY_COMMENT]: 'Komentar samo za čitanje',
  [C.CONTEXTMENU_ITEMS_MERGE_CELLS]: 'Spoji ćelije',
  [C.CONTEXTMENU_ITEMS_UNMERGE_CELLS]: 'Odvoji ćelije',
  [C.CONTEXTMENU_ITEMS_COPY]: 'Kopiraj',
  [C.CONTEXTMENU_ITEMS_CUT]: 'Iseci',
  [C.CONTEXTMENU_ITEMS_NESTED_ROWS_INSERT_CHILD]: 'Unesi ugnježdeni red',
  [C.CONTEXTMENU_ITEMS_NESTED_ROWS_DETACH_CHILD]: 'Odvoji ugnježdeni red',
  [C.CONTEXTMENU_ITEMS_HIDE_COLUMN]: ['Sakrij kolonu', 'Sakrij kolone'],
  [C.CONTEXTMENU_ITEMS_SHOW_COLUMN]: ['Prikaži kolonu', 'Prikaži kolone'],
  [C.CONTEXTMENU_ITEMS_HIDE_ROW]: ['Sakrij red', 'Sakrij redove'],
  [C.CONTEXTMENU_ITEMS_SHOW_ROW]: ['Prikaži red', 'Prikaži redove'],
  [C.FILTERS_CONDITIONS_NONE]: 'Nema',
  [C.FILTERS_CONDITIONS_EMPTY]: 'Je prazno',
  [C.FILTERS_CONDITIONS_NOT_EMPTY]: 'Nije prazno',
  [C.FILTERS_CONDITIONS_EQUAL]: 'Je jednako',
  [C.FILTERS_CONDITIONS_NOT_EQUAL]: 'Nije jednako',
  [C.FILTERS_CONDITIONS_BEGINS_WITH]: 'Počinje sa',
  [C.FILTERS_CONDITIONS_ENDS_WITH]: 'Završava se sa',
  [C.FILTERS_CONDITIONS_CONTAINS]: 'Sadrži',
  [C.FILTERS_CONDITIONS_NOT_CONTAIN]: 'Ne sadrži',
  [C.FILTERS_CONDITIONS_GREATER_THAN]: 'Veće od',
  [C.FILTERS_CONDITIONS_GREATER_THAN_OR_EQUAL]: 'Veće od ili jednako',
  [C.FILTERS_CONDITIONS_LESS_THAN]: 'Manje od',
  [C.FILTERS_CONDITIONS_LESS_THAN_OR_EQUAL]: 'Manje od ili jednako',
  [C.FILTERS_CONDITIONS_BETWEEN]: 'Je između',
  [C.FILTERS_CONDITIONS_NOT_BETWEEN]: 'Nije između',
  [C.FILTERS_CONDITIONS_AFTER]: 'Posle',
  [C.FILTERS_CONDITIONS_BEFORE]: 'Pre',
  [C.FILTERS_CONDITIONS_TODAY]: 'Danas',
  [C.FILTERS_CONDITIONS_TOMORROW]: 'Sutra',
  [C.FILTERS_CONDITIONS_YESTERDAY]: 'Juče',
  [C.FILTERS_VALUES_BLANK_CELLS]: 'Prazne ćelije',
  [C.FILTERS_DIVS_FILTER_BY_CONDITION]: 'Filtriraj po uslovu',
  [C.FILTERS_DIVS_FILTER_BY_VALUE]: 'Filtriraj po vrednosti',
  [C.FILTERS_LABELS_CONJUNCTION]: 'I',
  [C.FILTERS_LABELS_DISJUNCTION]: 'Ili',
  [C.FILTERS_BUTTONS_SELECT_ALL]: 'Selektuj sve',
  [C.FILTERS_BUTTONS_CLEAR]: 'Očisti',
  [C.FILTERS_BUTTONS_OK]: 'U redu',
  [C.FILTERS_BUTTONS_CANCEL]: 'Otkaži',
  [C.FILTERS_BUTTONS_PLACEHOLDER_SEARCH]: 'Pretraga',
  [C.FILTERS_BUTTONS_PLACEHOLDER_VALUE]: 'Vrednost',
  [C.FILTERS_BUTTONS_PLACEHOLDER_SECOND_VALUE]: 'Druga vrednost'
};
var _default = exports.default = dictionary;