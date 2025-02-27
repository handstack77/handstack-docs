"use strict";

exports.__esModule = true;
var _core = _interopRequireDefault(require("./core"));
var _rootInstance = require("./utils/rootInstance");
var _dataMap = require("./dataMap");
var _pluginHooks = _interopRequireDefault(require("./pluginHooks"));
var _registry = require("./i18n/registry");
var _registry2 = require("./cellTypes/registry");
var _textType = require("./cellTypes/textType");
var _baseEditor = require("./editors/baseEditor");
var _src = require("./3rdparty/walkontable/src");
exports.CellCoords = _src.CellCoords;
exports.CellRange = _src.CellRange;
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
// FIXME: Bug in eslint-plugin-import: https://github.com/benmosher/eslint-plugin-import/issues/1883
/* eslint-disable import/named */

/* eslint-enable import/named */

// register default mandatory cell type for the Base package
(0, _registry2.registerCellType)(_textType.TextCellType);

// export the `BaseEditor` class to the Handsontable global namespace
Handsontable.editors = {
  BaseEditor: _baseEditor.BaseEditor
};

/**
 * @param {HTMLElement} rootElement The element to which the Handsontable instance is injected.
 * @param {object} userSettings The user defined options.
 * @returns {Core}
 */
function Handsontable(rootElement, userSettings) {
  const instance = new _core.default(rootElement, userSettings || {}, _rootInstance.rootInstanceSymbol);
  instance.init();
  return instance;
}
Handsontable.Core = function (rootElement) {
  let userSettings = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  return new _core.default(rootElement, userSettings, _rootInstance.rootInstanceSymbol);
};
Handsontable.DefaultSettings = (0, _dataMap.metaSchemaFactory)();
Handsontable.hooks = _pluginHooks.default.getSingleton();
Handsontable.CellCoords = _src.CellCoords;
Handsontable.CellRange = _src.CellRange;
Handsontable.packageName = 'handsontable';
Handsontable.buildDate = "30/07/2024 11:21:48";
Handsontable.version = "14.5.0";
Handsontable.languages = {
  dictionaryKeys: _registry.dictionaryKeys,
  getLanguageDictionary: _registry.getLanguageDictionary,
  getLanguagesDictionaries: _registry.getLanguagesDictionaries,
  registerLanguageDictionary: _registry.registerLanguageDictionary,
  getTranslatedPhrase: _registry.getTranslatedPhrase
};
var _default = exports.default = Handsontable;