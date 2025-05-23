"use strict";

exports.__esModule = true;
require("core-js/modules/es.error.cause.js");
require("core-js/modules/es.array.push.js");
require("core-js/modules/esnext.set.difference.v2.js");
require("core-js/modules/esnext.set.intersection.v2.js");
require("core-js/modules/esnext.set.is-disjoint-from.v2.js");
require("core-js/modules/esnext.set.is-subset-of.v2.js");
require("core-js/modules/esnext.set.is-superset-of.v2.js");
require("core-js/modules/esnext.set.symmetric-difference.v2.js");
require("core-js/modules/esnext.set.union.v2.js");
var _base = require("../base");
var _element = require("../../helpers/dom/element");
var _number = require("../../helpers/number");
var _array = require("../../helpers/array");
var _object = require("../../helpers/object");
var _mixed = require("../../helpers/mixed");
var _predefinedItems = require("../contextMenu/predefinedItems");
var _pluginHooks = _interopRequireDefault(require("../../pluginHooks"));
var _hideRow = _interopRequireDefault(require("./contextMenuItem/hideRow"));
var _showRow = _interopRequireDefault(require("./contextMenuItem/showRow"));
var _translations = require("../../translations");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
function _classPrivateMethodInitSpec(e, a) { _checkPrivateRedeclaration(e, a), a.add(e); }
function _classPrivateFieldInitSpec(e, t, a) { _checkPrivateRedeclaration(e, t), t.set(e, a); }
function _checkPrivateRedeclaration(e, t) { if (t.has(e)) throw new TypeError("Cannot initialize the same private elements twice on an object"); }
function _classPrivateFieldGet(s, a) { return s.get(_assertClassBrand(s, a)); }
function _classPrivateFieldSet(s, a, r) { return s.set(_assertClassBrand(s, a), r), r; }
function _assertClassBrand(e, t, n) { if ("function" == typeof e ? e === t : e.has(t)) return arguments.length < 3 ? t : n; throw new TypeError("Private element is not present on this object"); }
_pluginHooks.default.getSingleton().register('beforeHideRows');
_pluginHooks.default.getSingleton().register('afterHideRows');
_pluginHooks.default.getSingleton().register('beforeUnhideRows');
_pluginHooks.default.getSingleton().register('afterUnhideRows');
const PLUGIN_KEY = exports.PLUGIN_KEY = 'hiddenRows';
const PLUGIN_PRIORITY = exports.PLUGIN_PRIORITY = 320;

/* eslint-disable jsdoc/require-description-complete-sentence */

/**
 * @plugin HiddenRows
 * @class HiddenRows
 *
 * @description
 * The `HiddenRows` plugin lets you [hide specified rows](@/guides/rows/row-hiding/row-hiding.md).
 *
 * "Hiding a row" means that the hidden row doesn't get rendered as a DOM element.
 *
 * The `HiddenRows` plugin doesn't modify the source data,
 * and doesn't participate in data transformation
 * (the shape of the data returned by the [`getData*()` methods](@/api/core.md#getdata) stays intact).
 *
 * You can set the following configuration options:
 *
 * | Option | Required | Type | Default | Description |
 * |---|---|---|---|---|
 * | `rows` | No | Array | - | [Hides specified rows by default](@/guides/rows/row-hiding/row-hiding.md#step-1-specify-rows-hidden-by-default) |
 * | `indicators` | No | Boolean | `false` | [Shows UI indicators](@/guides/rows/row-hiding/row-hiding.md#step-2-show-ui-indicators) |
 * | `copyPasteEnabled` | No | Boolean | `true` | [Sets up copy/paste behavior](@/guides/rows/row-hiding/row-hiding.md#step-4-set-up-copy-and-paste-behavior) |
 *
 * @example
 *
 * ::: only-for javascript
 * ```js
 * const container = document.getElementById('example');
 * const hot = new Handsontable(container, {
 *   data: getData(),
 *   hiddenRows: {
 *     copyPasteEnabled: true,
 *     indicators: true,
 *     rows: [1, 2, 5]
 *   }
 * });
 *
 * // access the `HiddenRows` plugin's instance
 * const hiddenRowsPlugin = hot.getPlugin('hiddenRows');
 *
 * // hide a single row
 * hiddenRowsPlugin.hideRow(1);
 *
 * // hide multiple rows
 * hiddenRowsPlugin.hideRow(1, 2, 9);
 *
 * // hide multiple rows as an array
 * hiddenRowsPlugin.hideRows([1, 2, 9]);
 *
 * // unhide a single row
 * hiddenRowsPlugin.showRow(1);
 *
 * // unhide multiple rows
 * hiddenRowsPlugin.showRow(1, 2, 9);
 *
 * // unhide multiple rows as an array
 * hiddenRowsPlugin.showRows([1, 2, 9]);
 *
 * // to see your changes, re-render your Handsontable instance
 * hot.render();
 * ```
 * :::
 *
 * ::: only-for react
 * ```jsx
 * const hotRef = useRef(null);
 *
 * ...
 *
 * <HotTable
 *   ref={hotRef}
 *   data={getData()}
 *   hiddenRows={{
 *     copyPasteEnabled: true,
 *     indicators: true,
 *     rows: [1, 2, 5]
 *   }}
 * />
 *
 * // access the `HiddenRows` plugin's instance
 * const hot = hotRef.current.hotInstance;
 * const hiddenRowsPlugin = hot.getPlugin('hiddenRows');
 *
 * // hide a single row
 * hiddenRowsPlugin.hideRow(1);
 *
 * // hide multiple rows
 * hiddenRowsPlugin.hideRow(1, 2, 9);
 *
 * // hide multiple rows as an array
 * hiddenRowsPlugin.hideRows([1, 2, 9]);
 *
 * // unhide a single row
 * hiddenRowsPlugin.showRow(1);
 *
 * // unhide multiple rows
 * hiddenRowsPlugin.showRow(1, 2, 9);
 *
 * // unhide multiple rows as an array
 * hiddenRowsPlugin.showRows([1, 2, 9]);
 *
 * // to see your changes, re-render your Handsontable instance
 * hot.render();
 * ```
 * :::
 */
var _settings = /*#__PURE__*/new WeakMap();
var _hiddenRowsMap = /*#__PURE__*/new WeakMap();
var _HiddenRows_brand = /*#__PURE__*/new WeakSet();
class HiddenRows extends _base.BasePlugin {
  constructor() {
    super(...arguments);
    /**
     * Adds the additional row height for the hidden row indicators.
     *
     * @param {number|undefined} height Row height.
     * @param {number} row Visual row index.
     * @returns {number}
     */
    _classPrivateMethodInitSpec(this, _HiddenRows_brand);
    /**
     * Cached settings from Handsontable settings.
     *
     * @private
     * @type {object}
     */
    _classPrivateFieldInitSpec(this, _settings, {});
    /**
     * Map of hidden rows by the plugin.
     *
     * @private
     * @type {HidingMap|null}
     */
    _classPrivateFieldInitSpec(this, _hiddenRowsMap, null);
  }
  static get PLUGIN_KEY() {
    return PLUGIN_KEY;
  }
  static get PLUGIN_PRIORITY() {
    return PLUGIN_PRIORITY;
  }
  /**
   * Checks if the plugin is enabled in the handsontable settings. This method is executed in {@link Hooks#beforeInit}
   * hook and if it returns `true` then the {@link HiddenRows#enablePlugin} method is called.
   *
   * @returns {boolean}
   */
  isEnabled() {
    return !!this.hot.getSettings()[PLUGIN_KEY];
  }

  /**
   * Enables the plugin functionality for this Handsontable instance.
   */
  enablePlugin() {
    var _this = this;
    if (this.enabled) {
      return;
    }
    const pluginSettings = this.hot.getSettings()[PLUGIN_KEY];
    if ((0, _object.isObject)(pluginSettings)) {
      _classPrivateFieldSet(_settings, this, pluginSettings);
      if ((0, _mixed.isUndefined)(pluginSettings.copyPasteEnabled)) {
        pluginSettings.copyPasteEnabled = true;
      }
    }
    _classPrivateFieldSet(_hiddenRowsMap, this, new _translations.HidingMap());
    _classPrivateFieldGet(_hiddenRowsMap, this).addLocalHook('init', () => _assertClassBrand(_HiddenRows_brand, this, _onMapInit).call(this));
    this.hot.rowIndexMapper.registerMap(this.pluginName, _classPrivateFieldGet(_hiddenRowsMap, this));
    this.addHook('afterContextMenuDefaultOptions', function () {
      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }
      return _assertClassBrand(_HiddenRows_brand, _this, _onAfterContextMenuDefaultOptions).call(_this, ...args);
    });
    this.addHook('afterGetCellMeta', (row, col, cellProperties) => _assertClassBrand(_HiddenRows_brand, this, _onAfterGetCellMeta).call(this, row, col, cellProperties));
    this.addHook('modifyRowHeight', (height, row) => _assertClassBrand(_HiddenRows_brand, this, _onModifyRowHeight).call(this, height, row));
    this.addHook('afterGetRowHeader', function () {
      for (var _len2 = arguments.length, args = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
        args[_key2] = arguments[_key2];
      }
      return _assertClassBrand(_HiddenRows_brand, _this, _onAfterGetRowHeader).call(_this, ...args);
    });
    this.addHook('modifyCopyableRange', ranges => _assertClassBrand(_HiddenRows_brand, this, _onModifyCopyableRange).call(this, ranges));
    super.enablePlugin();
  }

  /**
   * Updates the plugin's state.
   *
   * This method is executed when [`updateSettings()`](@/api/core.md#updatesettings) is invoked with any of the following configuration options:
   *  - [`hiddenRows`](@/api/options.md#hiddenrows)
   */
  updatePlugin() {
    this.disablePlugin();
    this.enablePlugin();
    super.updatePlugin();
  }

  /**
   * Disables the plugin functionality for this Handsontable instance.
   */
  disablePlugin() {
    this.hot.rowIndexMapper.unregisterMap(this.pluginName);
    _classPrivateFieldSet(_settings, this, {});
    super.disablePlugin();
    this.resetCellsMeta();
  }

  /**
   * Shows the rows provided in the array.
   *
   * @param {number[]} rows Array of visual row indexes.
   */
  showRows(rows) {
    const currentHideConfig = this.getHiddenRows();
    const isValidConfig = this.isValidConfig(rows);
    let destinationHideConfig = currentHideConfig;
    const hidingMapValues = _classPrivateFieldGet(_hiddenRowsMap, this).getValues().slice();
    const isAnyRowShowed = rows.length > 0;
    if (isValidConfig && isAnyRowShowed) {
      const physicalRows = rows.map(visualRow => this.hot.toPhysicalRow(visualRow));

      // Preparing new values for hiding map.
      (0, _array.arrayEach)(physicalRows, physicalRow => {
        hidingMapValues[physicalRow] = false;
      });

      // Preparing new hiding config.
      destinationHideConfig = (0, _array.arrayReduce)(hidingMapValues, (hiddenIndexes, isHidden, physicalIndex) => {
        if (isHidden) {
          hiddenIndexes.push(this.hot.toVisualRow(physicalIndex));
        }
        return hiddenIndexes;
      }, []);
    }
    const continueHiding = this.hot.runHooks('beforeUnhideRows', currentHideConfig, destinationHideConfig, isValidConfig && isAnyRowShowed);
    if (continueHiding === false) {
      return;
    }
    if (isValidConfig && isAnyRowShowed) {
      _classPrivateFieldGet(_hiddenRowsMap, this).setValues(hidingMapValues);
    }
    this.hot.runHooks('afterUnhideRows', currentHideConfig, destinationHideConfig, isValidConfig && isAnyRowShowed, isValidConfig && destinationHideConfig.length < currentHideConfig.length);
  }

  /**
   * Shows the row provided as row index (counting from 0).
   *
   * @param {...number} row Visual row index.
   */
  showRow() {
    for (var _len3 = arguments.length, row = new Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
      row[_key3] = arguments[_key3];
    }
    this.showRows(row);
  }

  /**
   * Hides the rows provided in the array.
   *
   * @param {number[]} rows Array of visual row indexes.
   */
  hideRows(rows) {
    const currentHideConfig = this.getHiddenRows();
    const isConfigValid = this.isValidConfig(rows);
    let destinationHideConfig = currentHideConfig;
    if (isConfigValid) {
      destinationHideConfig = Array.from(new Set(currentHideConfig.concat(rows)));
    }
    const continueHiding = this.hot.runHooks('beforeHideRows', currentHideConfig, destinationHideConfig, isConfigValid);
    if (continueHiding === false) {
      return;
    }
    if (isConfigValid) {
      this.hot.batchExecution(() => {
        (0, _array.arrayEach)(rows, visualRow => {
          _classPrivateFieldGet(_hiddenRowsMap, this).setValueAtIndex(this.hot.toPhysicalRow(visualRow), true);
        });
      }, true);
    }
    this.hot.runHooks('afterHideRows', currentHideConfig, destinationHideConfig, isConfigValid, isConfigValid && destinationHideConfig.length > currentHideConfig.length);
  }

  /**
   * Hides the row provided as row index (counting from 0).
   *
   * @param {...number} row Visual row index.
   */
  hideRow() {
    for (var _len4 = arguments.length, row = new Array(_len4), _key4 = 0; _key4 < _len4; _key4++) {
      row[_key4] = arguments[_key4];
    }
    this.hideRows(row);
  }

  /**
   * Returns an array of visual indexes of hidden rows.
   *
   * @returns {number[]}
   */
  getHiddenRows() {
    return (0, _array.arrayMap)(_classPrivateFieldGet(_hiddenRowsMap, this).getHiddenIndexes(), physicalRowIndex => {
      return this.hot.toVisualRow(physicalRowIndex);
    });
  }

  /**
   * Checks if the provided row is hidden.
   *
   * @param {number} row Visual row index.
   * @returns {boolean}
   */
  isHidden(row) {
    return _classPrivateFieldGet(_hiddenRowsMap, this).getValueAtIndex(this.hot.toPhysicalRow(row)) || false;
  }

  /**
   * Checks whether all of the provided row indexes are within the bounds of the table.
   *
   * @param {Array} hiddenRows List of hidden visual row indexes.
   * @returns {boolean}
   */
  isValidConfig(hiddenRows) {
    const nrOfRows = this.hot.countRows();
    if (Array.isArray(hiddenRows) && hiddenRows.length > 0) {
      return hiddenRows.every(visualRow => Number.isInteger(visualRow) && visualRow >= 0 && visualRow < nrOfRows);
    }
    return false;
  }

  /**
   * Resets all rendered cells meta.
   *
   * @private
   */
  resetCellsMeta() {
    (0, _array.arrayEach)(this.hot.getCellsMeta(), meta => {
      if (meta) {
        meta.skipRowOnPaste = false;
      }
    });
  }
  /**
   * Destroys the plugin instance.
   */
  destroy() {
    _classPrivateFieldSet(_settings, this, null);
    _classPrivateFieldSet(_hiddenRowsMap, this, null);
    super.destroy();
  }
}
exports.HiddenRows = HiddenRows;
function _onModifyRowHeight(height, row) {
  // Hook is triggered internally only for the visible rows. Conditional will be handled for the API
  // calls of the `getRowHeight` function on not visible indexes.
  if (this.isHidden(row)) {
    return 0;
  }
  return height;
}
/**
 * Sets the copy-related cell meta.
 *
 * @param {number} row Visual row index.
 * @param {number} column Visual column index.
 * @param {object} cellProperties Object containing the cell properties.
 */
function _onAfterGetCellMeta(row, column, cellProperties) {
  if (_classPrivateFieldGet(_settings, this).copyPasteEnabled === false && this.isHidden(row)) {
    // Cell property handled by the `Autofill` and the `CopyPaste` plugins.
    cellProperties.skipRowOnPaste = true;
  }
  if (this.isHidden(row - 1)) {
    cellProperties.className = cellProperties.className || '';
    if (cellProperties.className.indexOf('afterHiddenRow') === -1) {
      cellProperties.className += ' afterHiddenRow';
    }
  } else if (cellProperties.className) {
    const classArr = cellProperties.className.split(' ');
    if (classArr.length > 0) {
      const containAfterHiddenRow = classArr.indexOf('afterHiddenRow');
      if (containAfterHiddenRow > -1) {
        classArr.splice(containAfterHiddenRow, 1);
      }
      cellProperties.className = classArr.join(' ');
    }
  }
}
/**
 * Modifies the copyable range, accordingly to the provided config.
 *
 * @param {Array} ranges An array of objects defining copyable cells.
 * @returns {Array}
 */
function _onModifyCopyableRange(ranges) {
  // Ranges shouldn't be modified when `copyPasteEnabled` option is set to `true` (by default).
  if (_classPrivateFieldGet(_settings, this).copyPasteEnabled) {
    return ranges;
  }
  const newRanges = [];
  const pushRange = (startRow, endRow, startCol, endCol) => {
    newRanges.push({
      startRow,
      endRow,
      startCol,
      endCol
    });
  };
  (0, _array.arrayEach)(ranges, range => {
    let isHidden = true;
    let rangeStart = 0;
    (0, _number.rangeEach)(range.startRow, range.endRow, visualRow => {
      if (this.isHidden(visualRow)) {
        if (!isHidden) {
          pushRange(rangeStart, visualRow - 1, range.startCol, range.endCol);
        }
        isHidden = true;
      } else {
        if (isHidden) {
          rangeStart = visualRow;
        }
        if (visualRow === range.endRow) {
          pushRange(rangeStart, visualRow, range.startCol, range.endCol);
        }
        isHidden = false;
      }
    });
  });
  return newRanges;
}
/**
 * Adds the needed classes to the headers.
 *
 * @param {number} row Visual row index.
 * @param {HTMLElement} TH Header's TH element.
 */
function _onAfterGetRowHeader(row, TH) {
  if (!_classPrivateFieldGet(_settings, this).indicators || row < 0) {
    return;
  }
  const classList = [];
  if (row >= 1 && this.isHidden(row - 1)) {
    classList.push('afterHiddenRow');
  }
  if (row < this.hot.countRows() - 1 && this.isHidden(row + 1)) {
    classList.push('beforeHiddenRow');
  }
  (0, _element.addClass)(TH, classList);
}
/**
 * Add Show-hide rows to context menu.
 *
 * @param {object} options An array of objects containing information about the pre-defined Context Menu items.
 */
function _onAfterContextMenuDefaultOptions(options) {
  options.items.push({
    name: _predefinedItems.SEPARATOR
  }, (0, _hideRow.default)(this), (0, _showRow.default)(this));
}
/**
 * On map initialized hook callback.
 */
function _onMapInit() {
  if (Array.isArray(_classPrivateFieldGet(_settings, this).rows)) {
    this.hideRows(_classPrivateFieldGet(_settings, this).rows);
  }
}