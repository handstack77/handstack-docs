import Core from "./core.mjs";
import { rootInstanceSymbol } from "./utils/rootInstance.mjs";
import { metaSchemaFactory } from "./dataMap/index.mjs";
import Hooks from "./pluginHooks.mjs"; // FIXME: Bug in eslint-plugin-import: https://github.com/benmosher/eslint-plugin-import/issues/1883
/* eslint-disable import/named */
import { dictionaryKeys, getTranslatedPhrase, registerLanguageDictionary, getLanguagesDictionaries, getLanguageDictionary } from "./i18n/registry.mjs";
/* eslint-enable import/named */
import { registerCellType } from "./cellTypes/registry.mjs";
import { TextCellType } from "./cellTypes/textType/index.mjs";
import { BaseEditor } from "./editors/baseEditor/index.mjs";
import { CellCoords, CellRange } from "./3rdparty/walkontable/src/index.mjs"; // register default mandatory cell type for the Base package
registerCellType(TextCellType);

// export the `BaseEditor` class to the Handsontable global namespace
Handsontable.editors = {
  BaseEditor
};

/**
 * @param {HTMLElement} rootElement The element to which the Handsontable instance is injected.
 * @param {object} userSettings The user defined options.
 * @returns {Core}
 */
function Handsontable(rootElement, userSettings) {
  const instance = new Core(rootElement, userSettings || {}, rootInstanceSymbol);
  instance.init();
  return instance;
}
Handsontable.Core = function (rootElement) {
  let userSettings = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  return new Core(rootElement, userSettings, rootInstanceSymbol);
};
Handsontable.DefaultSettings = metaSchemaFactory();
Handsontable.hooks = Hooks.getSingleton();
Handsontable.CellCoords = CellCoords;
Handsontable.CellRange = CellRange;
Handsontable.packageName = 'handsontable';
Handsontable.buildDate = "30/07/2024 11:21:58";
Handsontable.version = "14.5.0";
Handsontable.languages = {
  dictionaryKeys,
  getLanguageDictionary,
  getLanguagesDictionaries,
  registerLanguageDictionary,
  getTranslatedPhrase
};
export { CellCoords, CellRange };
export default Handsontable;