import "core-js/modules/es.error.cause.js";
import "core-js/modules/es.array.push.js";
function _classPrivateMethodInitSpec(e, a) { _checkPrivateRedeclaration(e, a), a.add(e); }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
function _classPrivateFieldInitSpec(e, t, a) { _checkPrivateRedeclaration(e, t), t.set(e, a); }
function _checkPrivateRedeclaration(e, t) { if (t.has(e)) throw new TypeError("Cannot initialize the same private elements twice on an object"); }
function _classPrivateFieldSet(s, a, r) { return s.set(_assertClassBrand(s, a), r), r; }
function _classPrivateFieldGet(s, a) { return s.get(_assertClassBrand(s, a)); }
function _assertClassBrand(e, t, n) { if ("function" == typeof e ? e === t : e.has(t)) return arguments.length < 3 ? t : n; throw new TypeError("Private element is not present on this object"); }
import { addClass, removeClass } from "../../helpers/dom/element.mjs";
import { isNumeric, clamp } from "../../helpers/number.mjs";
import { toSingleLine } from "../../helpers/templateLiteralTag.mjs";
import { isLeftClick, isRightClick, isTouchEvent } from "../../helpers/dom/event.mjs";
import { warn } from "../../helpers/console.mjs";
import { ACTIVE_HEADER_TYPE, HEADER_TYPE } from "../../selection/index.mjs";
import { BasePlugin } from "../base/index.mjs";
import StateManager from "./stateManager/index.mjs";
import GhostTable from "./utils/ghostTable.mjs";
export const PLUGIN_KEY = 'nestedHeaders';
export const PLUGIN_PRIORITY = 280;

/* eslint-disable jsdoc/require-description-complete-sentence */

/**
 * @plugin NestedHeaders
 * @class NestedHeaders
 *
 * @description
 * The plugin allows to create a nested header structure, using the HTML's colspan attribute.
 *
 * To make any header wider (covering multiple table columns), it's corresponding configuration array element should be
 * provided as an object with `label` and `colspan` properties. The `label` property defines the header's label,
 * while the `colspan` property defines a number of columns that the header should cover.
 * You can also set custom class names to any of the headers by providing the `headerClassName` property.
 *
 * __Note__ that the plugin supports a *nested* structure, which means, any header cannot be wider than it's "parent". In
 * other words, headers cannot overlap each other.
 * @example
 *
 * ::: only-for javascript
 * ```js
 * const container = document.getElementById('example');
 * const hot = new Handsontable(container, {
 *   data: getData(),
 *   nestedHeaders: [
 *     ['A', {label: 'B', colspan: 8, headerClassName: 'htRight'}, 'C'],
 *     ['D', {label: 'E', colspan: 4}, {label: 'F', colspan: 4}, 'G'],
 *     ['H', {label: 'I', colspan: 2}, {label: 'J', colspan: 2}, {label: 'K', colspan: 2}, {label: 'L', colspan: 2}, 'M'],
 *     ['N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W']
 *  ],
 * ```
 * :::
 *
 * ::: only-for react
 * ```jsx
 * <HotTable
 *   data={getData()}
 *   nestedHeaders={[
 *     ['A', {label: 'B', colspan: 8, headerClassName: 'htRight'}, 'C'],
 *     ['D', {label: 'E', colspan: 4}, {label: 'F', colspan: 4}, 'G'],
 *     ['H', {label: 'I', colspan: 2}, {label: 'J', colspan: 2}, {label: 'K', colspan: 2}, {label: 'L', colspan: 2}, 'M'],
 *     ['N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W']
 *  ]}
 * />
 * ```
 * :::
 */
var _stateManager = /*#__PURE__*/new WeakMap();
var _hidingIndexMapObserver = /*#__PURE__*/new WeakMap();
var _focusInitialCoords = /*#__PURE__*/new WeakMap();
var _isColumnsSelectionInProgress = /*#__PURE__*/new WeakMap();
var _NestedHeaders_brand = /*#__PURE__*/new WeakSet();
export class NestedHeaders extends BasePlugin {
  constructor() {
    super(...arguments);
    /**
     * Updates the selection focus highlight position to point to the nested header root element (TH)
     * even when the logical coordinates point in-between the header.
     */
    _classPrivateMethodInitSpec(this, _NestedHeaders_brand);
    /**
     * The state manager for the nested headers.
     *
     * @type {StateManager}
     */
    _classPrivateFieldInitSpec(this, _stateManager, new StateManager());
    /**
     * The instance of the ChangesObservable class that allows track the changes that happens in the
     * column indexes.
     *
     * @type {ChangesObservable}
     */
    _classPrivateFieldInitSpec(this, _hidingIndexMapObserver, null);
    /**
     * Holds the coords that points to the place where the column selection starts.
     *
     * @type {number|null}
     */
    _classPrivateFieldInitSpec(this, _focusInitialCoords, null);
    /**
     * Determines if there is performed the column selection.
     *
     * @type {boolean}
     */
    _classPrivateFieldInitSpec(this, _isColumnsSelectionInProgress, false);
    /**
     * Custom helper for getting widths of the nested headers.
     *
     * @private
     * @type {GhostTable}
     */
    // @TODO This should be changed after refactor handsontable/utils/ghostTable.
    _defineProperty(this, "ghostTable", new GhostTable(this.hot, (row, column) => this.getHeaderSettings(row, column)));
    /**
     * The flag which determines that the nested header settings contains overlapping headers
     * configuration.
     *
     * @type {boolean}
     */
    _defineProperty(this, "detectedOverlappedHeaders", false);
  }
  static get PLUGIN_KEY() {
    return PLUGIN_KEY;
  }
  static get PLUGIN_PRIORITY() {
    return PLUGIN_PRIORITY;
  }
  /**
   * Check if plugin is enabled.
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
    const {
      nestedHeaders
    } = this.hot.getSettings();
    if (!Array.isArray(nestedHeaders) || !Array.isArray(nestedHeaders[0])) {
      warn(toSingleLine`Your Nested Headers plugin configuration is invalid. The settings has to be\x20
                        passed as an array of arrays e.q. [['A1', { label: 'A2', colspan: 2 }]]`);
    }
    this.addHook('init', () => _assertClassBrand(_NestedHeaders_brand, this, _onInit).call(this));
    this.addHook('afterLoadData', function () {
      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }
      return _assertClassBrand(_NestedHeaders_brand, _this, _onAfterLoadData).call(_this, ...args);
    });
    this.addHook('beforeOnCellMouseDown', function () {
      for (var _len2 = arguments.length, args = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
        args[_key2] = arguments[_key2];
      }
      return _assertClassBrand(_NestedHeaders_brand, _this, _onBeforeOnCellMouseDown).call(_this, ...args);
    });
    this.addHook('afterOnCellMouseDown', function () {
      for (var _len3 = arguments.length, args = new Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
        args[_key3] = arguments[_key3];
      }
      return _assertClassBrand(_NestedHeaders_brand, _this, _onAfterOnCellMouseDown).call(_this, ...args);
    });
    this.addHook('beforeOnCellMouseOver', function () {
      for (var _len4 = arguments.length, args = new Array(_len4), _key4 = 0; _key4 < _len4; _key4++) {
        args[_key4] = arguments[_key4];
      }
      return _assertClassBrand(_NestedHeaders_brand, _this, _onBeforeOnCellMouseOver).call(_this, ...args);
    });
    this.addHook('beforeOnCellMouseUp', function () {
      for (var _len5 = arguments.length, args = new Array(_len5), _key5 = 0; _key5 < _len5; _key5++) {
        args[_key5] = arguments[_key5];
      }
      return _assertClassBrand(_NestedHeaders_brand, _this, _onBeforeOnCellMouseUp).call(_this, ...args);
    });
    this.addHook('beforeSelectionHighlightSet', function () {
      for (var _len6 = arguments.length, args = new Array(_len6), _key6 = 0; _key6 < _len6; _key6++) {
        args[_key6] = arguments[_key6];
      }
      return _assertClassBrand(_NestedHeaders_brand, _this, _onBeforeSelectionHighlightSet).call(_this, ...args);
    });
    this.addHook('modifyTransformStart', function () {
      for (var _len7 = arguments.length, args = new Array(_len7), _key7 = 0; _key7 < _len7; _key7++) {
        args[_key7] = arguments[_key7];
      }
      return _assertClassBrand(_NestedHeaders_brand, _this, _onModifyTransformStart).call(_this, ...args);
    });
    this.addHook('afterSelection', () => _assertClassBrand(_NestedHeaders_brand, this, _updateFocusHighlightPosition).call(this));
    this.addHook('afterSelectionFocusSet', () => _assertClassBrand(_NestedHeaders_brand, this, _updateFocusHighlightPosition).call(this));
    this.addHook('beforeViewportScrollHorizontally', function () {
      for (var _len8 = arguments.length, args = new Array(_len8), _key8 = 0; _key8 < _len8; _key8++) {
        args[_key8] = arguments[_key8];
      }
      return _assertClassBrand(_NestedHeaders_brand, _this, _onBeforeViewportScrollHorizontally).call(_this, ...args);
    });
    this.addHook('afterGetColumnHeaderRenderers', array => _assertClassBrand(_NestedHeaders_brand, this, _onAfterGetColumnHeaderRenderers).call(this, array));
    this.addHook('modifyColWidth', function () {
      for (var _len9 = arguments.length, args = new Array(_len9), _key9 = 0; _key9 < _len9; _key9++) {
        args[_key9] = arguments[_key9];
      }
      return _assertClassBrand(_NestedHeaders_brand, _this, _onModifyColWidth).call(_this, ...args);
    });
    this.addHook('modifyColumnHeaderValue', function () {
      for (var _len10 = arguments.length, args = new Array(_len10), _key10 = 0; _key10 < _len10; _key10++) {
        args[_key10] = arguments[_key10];
      }
      return _assertClassBrand(_NestedHeaders_brand, _this, _onModifyColumnHeaderValue).call(_this, ...args);
    });
    this.addHook('beforeHighlightingColumnHeader', function () {
      for (var _len11 = arguments.length, args = new Array(_len11), _key11 = 0; _key11 < _len11; _key11++) {
        args[_key11] = arguments[_key11];
      }
      return _assertClassBrand(_NestedHeaders_brand, _this, _onBeforeHighlightingColumnHeader).call(_this, ...args);
    });
    this.addHook('beforeCopy', function () {
      for (var _len12 = arguments.length, args = new Array(_len12), _key12 = 0; _key12 < _len12; _key12++) {
        args[_key12] = arguments[_key12];
      }
      return _assertClassBrand(_NestedHeaders_brand, _this, _onBeforeCopy).call(_this, ...args);
    });
    this.addHook('beforeSelectColumns', function () {
      for (var _len13 = arguments.length, args = new Array(_len13), _key13 = 0; _key13 < _len13; _key13++) {
        args[_key13] = arguments[_key13];
      }
      return _assertClassBrand(_NestedHeaders_brand, _this, _onBeforeSelectColumns).call(_this, ...args);
    });
    this.addHook('afterViewportColumnCalculatorOverride', function () {
      for (var _len14 = arguments.length, args = new Array(_len14), _key14 = 0; _key14 < _len14; _key14++) {
        args[_key14] = arguments[_key14];
      }
      return _assertClassBrand(_NestedHeaders_brand, _this, _onAfterViewportColumnCalculatorOverride).call(_this, ...args);
    });
    this.addHook('modifyFocusedElement', function () {
      for (var _len15 = arguments.length, args = new Array(_len15), _key15 = 0; _key15 < _len15; _key15++) {
        args[_key15] = arguments[_key15];
      }
      return _assertClassBrand(_NestedHeaders_brand, _this, _onModifyFocusedElement).call(_this, ...args);
    });
    this.hot.columnIndexMapper.addLocalHook('cacheUpdated', () => _assertClassBrand(_NestedHeaders_brand, this, _updateFocusHighlightPosition).call(this));
    this.hot.rowIndexMapper.addLocalHook('cacheUpdated', () => _assertClassBrand(_NestedHeaders_brand, this, _updateFocusHighlightPosition).call(this));
    super.enablePlugin();
    this.updatePlugin(); // @TODO: Workaround for broken plugin initialization abstraction.
  }

  /**
   * Updates the plugin's state.
   *
   * This method is executed when [`updateSettings()`](@/api/core.md#updatesettings) is invoked with any of the following configuration options:
   *  - [`nestedHeaders`](@/api/options.md#nestedheaders)
   */
  updatePlugin() {
    if (!this.hot.view) {
      // @TODO: Workaround for broken plugin initialization abstraction.
      return;
    }
    const {
      nestedHeaders
    } = this.hot.getSettings();
    _classPrivateFieldGet(_stateManager, this).setColumnsLimit(this.hot.countCols());
    if (Array.isArray(nestedHeaders)) {
      this.detectedOverlappedHeaders = _classPrivateFieldGet(_stateManager, this).setState(nestedHeaders);
    }
    if (this.detectedOverlappedHeaders) {
      warn(toSingleLine`Your Nested Headers plugin setup contains overlapping headers. This kind of configuration\x20
                        is currently not supported.`);
    }
    if (this.enabled) {
      // This line covers the case when a developer uses the external hiding maps to manipulate
      // the columns' visibility. The tree state built from the settings - which is always built
      // as if all the columns are visible, needs to be modified to be in sync with a dataset.
      this.hot.columnIndexMapper.hidingMapsCollection.getMergedValues().forEach((isColumnHidden, physicalColumnIndex) => {
        const actionName = isColumnHidden === true ? 'hide-column' : 'show-column';
        _classPrivateFieldGet(_stateManager, this).triggerColumnModification(actionName, physicalColumnIndex);
      });
    }
    if (!_classPrivateFieldGet(_hidingIndexMapObserver, this) && this.enabled) {
      _classPrivateFieldSet(_hidingIndexMapObserver, this, this.hot.columnIndexMapper.createChangesObserver('hiding').subscribe(changes => {
        changes.forEach(_ref => {
          let {
            op,
            index: columnIndex,
            newValue
          } = _ref;
          if (op === 'replace') {
            const actionName = newValue === true ? 'hide-column' : 'show-column';
            _classPrivateFieldGet(_stateManager, this).triggerColumnModification(actionName, columnIndex);
          }
        });
        this.ghostTable.buildWidthsMap();
      }));
    }
    this.ghostTable.setLayersCount(this.getLayersCount()).buildWidthsMap();
    super.updatePlugin();
  }

  /**
   * Disables the plugin functionality for this Handsontable instance.
   */
  disablePlugin() {
    this.clearColspans();
    _classPrivateFieldGet(_stateManager, this).clear();
    _classPrivateFieldGet(_hidingIndexMapObserver, this).unsubscribe();
    _classPrivateFieldSet(_hidingIndexMapObserver, this, null);
    this.ghostTable.clear();
    super.disablePlugin();
  }

  /**
   * Returns an instance of the internal state manager of the plugin.
   *
   * @private
   * @returns {StateManager}
   */
  getStateManager() {
    return _classPrivateFieldGet(_stateManager, this);
  }

  /**
   * Gets a total number of headers levels.
   *
   * @private
   * @returns {number}
   */
  getLayersCount() {
    return _classPrivateFieldGet(_stateManager, this).getLayersCount();
  }

  /**
   * Gets column settings for a specified header. The returned object contains
   * information about the header label, its colspan length, or if it is hidden
   * in the header renderers.
   *
   * @private
   * @param {number} headerLevel Header level (0 = most distant to the table).
   * @param {number} columnIndex A visual column index.
   * @returns {object}
   */
  getHeaderSettings(headerLevel, columnIndex) {
    return _classPrivateFieldGet(_stateManager, this).getHeaderSettings(headerLevel, columnIndex);
  }

  /**
   * Clear the colspans remaining after plugin usage.
   *
   * @private
   */
  clearColspans() {
    if (!this.hot.view) {
      return;
    }
    const {
      _wt: wt
    } = this.hot.view;
    const headerLevels = wt.getSetting('columnHeaders').length;
    const mainHeaders = wt.wtTable.THEAD;
    const topHeaders = wt.wtOverlays.topOverlay.clone.wtTable.THEAD;
    const topLeftCornerHeaders = wt.wtOverlays.topInlineStartCornerOverlay ? wt.wtOverlays.topInlineStartCornerOverlay.clone.wtTable.THEAD : null;
    for (let i = 0; i < headerLevels; i++) {
      const masterLevel = mainHeaders.childNodes[i];
      if (!masterLevel) {
        break;
      }
      const topLevel = topHeaders.childNodes[i];
      const topLeftCornerLevel = topLeftCornerHeaders ? topLeftCornerHeaders.childNodes[i] : null;
      for (let j = 0, masterNodes = masterLevel.childNodes.length; j < masterNodes; j++) {
        masterLevel.childNodes[j].removeAttribute('colspan');
        removeClass(masterLevel.childNodes[j], 'hiddenHeader');
        if (topLevel && topLevel.childNodes[j]) {
          topLevel.childNodes[j].removeAttribute('colspan');
          removeClass(topLevel.childNodes[j], 'hiddenHeader');
        }
        if (topLeftCornerHeaders && topLeftCornerLevel && topLeftCornerLevel.childNodes[j]) {
          topLeftCornerLevel.childNodes[j].removeAttribute('colspan');
          removeClass(topLeftCornerLevel.childNodes[j], 'hiddenHeader');
        }
      }
    }
  }

  /**
   * Generates the appropriate header renderer for a header row.
   *
   * @private
   * @param {number} headerLevel The index of header level counting from the top (positive
   *                             values counting from 0 to N).
   * @returns {Function}
   * @fires Hooks#afterGetColHeader
   */
  headerRendererFactory(headerLevel) {
    var _this2 = this;
    const fixedColumnsStart = this.hot.view._wt.getSetting('fixedColumnsStart');
    return (renderedColumnIndex, TH) => {
      var _classPrivateFieldGet2;
      const {
        columnIndexMapper,
        view
      } = this.hot;
      let visualColumnIndex = columnIndexMapper.getVisualFromRenderableIndex(renderedColumnIndex);
      if (visualColumnIndex === null) {
        visualColumnIndex = renderedColumnIndex;
      }
      TH.removeAttribute('colspan');
      removeClass(TH, 'hiddenHeader');
      const {
        colspan,
        isHidden,
        isPlaceholder,
        headerClassNames
      } = (_classPrivateFieldGet2 = _classPrivateFieldGet(_stateManager, this).getHeaderSettings(headerLevel, visualColumnIndex)) !== null && _classPrivateFieldGet2 !== void 0 ? _classPrivateFieldGet2 : {
        label: ''
      };
      if (isPlaceholder || isHidden) {
        addClass(TH, 'hiddenHeader');
      } else if (colspan > 1) {
        var _wtOverlays$topInline, _wtOverlays$inlineSta;
        const {
          wtOverlays
        } = view._wt;
        const isTopInlineStartOverlay = (_wtOverlays$topInline = wtOverlays.topInlineStartCornerOverlay) === null || _wtOverlays$topInline === void 0 ? void 0 : _wtOverlays$topInline.clone.wtTable.THEAD.contains(TH);
        const isInlineStartOverlay = (_wtOverlays$inlineSta = wtOverlays.inlineStartOverlay) === null || _wtOverlays$inlineSta === void 0 ? void 0 : _wtOverlays$inlineSta.clone.wtTable.THEAD.contains(TH);

        // Check if there is a fixed column enabled, if so then reduce colspan to fixed column width.
        const correctedColspan = isTopInlineStartOverlay || isInlineStartOverlay ? Math.min(colspan, fixedColumnsStart - renderedColumnIndex) : colspan;
        if (correctedColspan > 1) {
          TH.setAttribute('colspan', correctedColspan);
        }
      }
      this.hot.view.appendColHeader(visualColumnIndex, TH, function () {
        return _this2.getColumnHeaderValue(...arguments);
      }, headerLevel);

      // Replace the higher-order `headerClassName`s with the one provided in the plugin config, if it was provided.
      if (!isPlaceholder && !isHidden) {
        const innerHeaderDiv = TH.querySelector('div.relative');
        if (innerHeaderDiv && headerClassNames && headerClassNames.length > 0) {
          removeClass(innerHeaderDiv, this.hot.getColumnMeta(visualColumnIndex).headerClassName);
          addClass(innerHeaderDiv, headerClassNames);
        }
      }
    };
  }

  /**
   * Returns the column header value for specified column and header level index.
   *
   * @private
   * @param {number} visualColumnIndex Visual column index.
   * @param {number} headerLevel The index of header level. The header level accepts positive (0 to N)
   *                             and negative (-1 to -N) values. For positive values, 0 points to the
   *                             top most header, and for negative direction, -1 points to the most bottom
   *                             header (the header closest to the cells).
   * @returns {string} Returns the column header value to update.
   */
  getColumnHeaderValue(visualColumnIndex, headerLevel) {
    var _classPrivateFieldGet3;
    const {
      isHidden,
      isPlaceholder
    } = (_classPrivateFieldGet3 = _classPrivateFieldGet(_stateManager, this).getHeaderSettings(headerLevel, visualColumnIndex)) !== null && _classPrivateFieldGet3 !== void 0 ? _classPrivateFieldGet3 : {};
    if (isPlaceholder || isHidden) {
      return '';
    }
    return this.hot.getColHeader(visualColumnIndex, headerLevel);
  }
  /**
   * Destroys the plugin instance.
   */
  destroy() {
    _classPrivateFieldSet(_stateManager, this, null);
    if (_classPrivateFieldGet(_hidingIndexMapObserver, this) !== null) {
      _classPrivateFieldGet(_hidingIndexMapObserver, this).unsubscribe();
      _classPrivateFieldSet(_hidingIndexMapObserver, this, null);
    }
    super.destroy();
  }

  /**
   * Gets the tree data that belongs to the column headers pointed by the passed coordinates.
   *
   * @private
   * @param {CellCoords} coords The CellCoords instance.
   * @returns {object|undefined}
   */
  _getHeaderTreeNodeDataByCoords(coords) {
    if (coords.row >= 0 || coords.col < 0) {
      return;
    }
    return _classPrivateFieldGet(_stateManager, this).getHeaderTreeNodeData(coords.row, coords.col);
  }
}
function _updateFocusHighlightPosition() {
  var _this$hot;
  const selection = (_this$hot = this.hot) === null || _this$hot === void 0 ? void 0 : _this$hot.getSelectedRangeLast();
  if (!selection) {
    return;
  }
  const {
    highlight
  } = selection;
  const isNestedHeadersRange = highlight.isHeader() && highlight.col >= 0;
  if (isNestedHeadersRange) {
    const columnIndex = _classPrivateFieldGet(_stateManager, this).findLeftMostColumnIndex(highlight.row, highlight.col);
    const focusHighlight = this.hot.selection.highlight.getFocus();

    // Correct the highlight/focus selection to highlight the correct TH element
    focusHighlight.visualCellRange.highlight.col = columnIndex;
    focusHighlight.visualCellRange.from.col = columnIndex;
    focusHighlight.visualCellRange.to.col = columnIndex;
    focusHighlight.commit();
  }
}
/**
 * Allows to control to which column index the viewport will be scrolled. To ensure that the viewport
 * is scrolled to the correct column for the nested header the most left and the most right visual column
 * indexes are used.
 *
 * @param {number} visualColumn A visual column index to which the viewport will be scrolled.
 * @returns {number}
 */
function _onBeforeViewportScrollHorizontally(visualColumn) {
  const selection = this.hot.getSelectedRangeLast();
  if (!selection) {
    return visualColumn;
  }
  const {
    highlight
  } = selection;
  const isNestedHeadersRange = highlight.isHeader() && highlight.col >= 0;
  if (!isNestedHeadersRange) {
    return visualColumn;
  }
  const firstColumn = this.hot.view.getFirstFullyVisibleColumn();
  const lastColumn = this.hot.view.getLastFullyVisibleColumn();
  const mostLeftColumnIndex = _classPrivateFieldGet(_stateManager, this).findLeftMostColumnIndex(highlight.row, highlight.col);
  const mostRightColumnIndex = _classPrivateFieldGet(_stateManager, this).findRightMostColumnIndex(highlight.row, highlight.col);

  // do not scroll the viewport when the header is wider than the viewport
  if (mostLeftColumnIndex < firstColumn && mostRightColumnIndex > lastColumn) {
    return visualColumn;
  }
  return mostLeftColumnIndex < firstColumn ? mostLeftColumnIndex : mostRightColumnIndex;
}
/**
 * Allows to control which header DOM element will be used to highlight.
 *
 * @param {number} visualColumn A visual column index of the highlighted row header.
 * @param {number} headerLevel A row header level that is currently highlighted.
 * @param {object} highlightMeta An object with meta data that describes the highlight state.
 * @returns {number}
 */
function _onBeforeHighlightingColumnHeader(visualColumn, headerLevel, highlightMeta) {
  const headerNodeData = _classPrivateFieldGet(_stateManager, this).getHeaderTreeNodeData(headerLevel, visualColumn);
  if (!headerNodeData) {
    return visualColumn;
  }
  const {
    columnCursor,
    selectionType,
    selectionWidth
  } = highlightMeta;
  const {
    isRoot,
    colspan
  } = _classPrivateFieldGet(_stateManager, this).getHeaderSettings(headerLevel, visualColumn);
  if (selectionType === HEADER_TYPE) {
    if (!isRoot) {
      return headerNodeData.columnIndex;
    }
  } else if (selectionType === ACTIVE_HEADER_TYPE) {
    if (colspan > selectionWidth - columnCursor || !isRoot) {
      // Prevents adding any CSS class names to the TH element
      return null;
    }
  }
  return visualColumn;
}
/**
 * Listens the `beforeCopy` hook that allows processing the copied column headers so that the
 * merged column headers do not propagate the value for each column but only once at the beginning
 * of the column.
 *
 * @private
 * @param {Array[]} data An array of arrays which contains data to copied.
 * @param {object[]} copyableRanges An array of objects with ranges of the visual indexes (`startRow`, `startCol`, `endRow`, `endCol`)
 *                                  which will copied.
 * @param {{ columnHeadersCount: number }} copiedHeadersCount An object with keys that holds information with
 *                                                            the number of copied headers.
 */
function _onBeforeCopy(data, copyableRanges, _ref2) {
  let {
    columnHeadersCount
  } = _ref2;
  if (columnHeadersCount === 0) {
    return;
  }
  for (let rangeIndex = 0; rangeIndex < copyableRanges.length; rangeIndex++) {
    const {
      startRow,
      startCol,
      endRow,
      endCol
    } = copyableRanges[rangeIndex];
    const rowsCount = endRow - startRow + 1;
    const columnsCount = startCol - endCol + 1;

    // do not process dataset ranges and column headers where only one column is copied
    if (startRow >= 0 || columnsCount === 1) {
      break;
    }
    for (let column = startCol; column <= endCol; column++) {
      for (let row = startRow; row <= endRow; row++) {
        var _classPrivateFieldGet4;
        const zeroBasedColumnHeaderLevel = rowsCount + row;
        const zeroBasedColumnIndex = column - startCol;
        if (zeroBasedColumnIndex === 0) {
          continue; // eslint-disable-line no-continue
        }
        const isRoot = (_classPrivateFieldGet4 = _classPrivateFieldGet(_stateManager, this).getHeaderTreeNodeData(row, column)) === null || _classPrivateFieldGet4 === void 0 ? void 0 : _classPrivateFieldGet4.isRoot;
        if (isRoot === false) {
          data[zeroBasedColumnHeaderLevel][zeroBasedColumnIndex] = '';
        }
      }
    }
  }
}
/**
 * Allows blocking the column selection that is controlled by the core Selection module.
 *
 * @param {MouseEvent} event Mouse event.
 * @param {CellCoords} coords Cell coords object containing the visual coordinates of the clicked cell.
 * @param {CellCoords} TD The table cell or header element.
 * @param {object} controller An object with properties `row`, `column` and `cell`. Each property contains
 *                            a boolean value that allows or disallows changing the selection for that particular area.
 */
function _onBeforeOnCellMouseDown(event, coords, TD, controller) {
  const headerNodeData = this._getHeaderTreeNodeDataByCoords(coords);
  if (headerNodeData) {
    // Block the Selection module in controlling how the columns are selected. Pass the
    // responsibility of the column selection to this plugin (see "onAfterOnCellMouseDown" hook).
    controller.column = true;
  }
}
/**
 * Allows to control how the column selection based on the coordinates and the nested headers is made.
 *
 * @param {MouseEvent} event Mouse event.
 * @param {CellCoords} coords Cell coords object containing the visual coordinates of the clicked cell.
 */
function _onAfterOnCellMouseDown(event, coords) {
  const headerNodeData = this._getHeaderTreeNodeDataByCoords(coords);
  if (!headerNodeData) {
    return;
  }
  _classPrivateFieldSet(_focusInitialCoords, this, coords.clone());
  _classPrivateFieldSet(_isColumnsSelectionInProgress, this, true);
  const {
    selection
  } = this.hot;
  const currentSelection = selection.isSelected() ? selection.getSelectedRange().current() : null;
  const columnsToSelect = [];
  const {
    columnIndex,
    origColspan
  } = headerNodeData;

  // The Selection module doesn't allow it to extend its behavior easily. That's why here we need
  // to re-implement the "click" and "shift" behavior. As a workaround, the logic for the nested
  // headers must implement a similar logic as in the original Selection handler
  // (see src/selection/mouseEventHandler.js).
  const allowRightClickSelection = !selection.inInSelection(coords);
  if (event.shiftKey && currentSelection) {
    if (coords.col < currentSelection.from.col) {
      columnsToSelect.push(currentSelection.getTopEndCorner().col, columnIndex, coords.row);
    } else if (coords.col > currentSelection.from.col) {
      columnsToSelect.push(currentSelection.getTopStartCorner().col, columnIndex + origColspan - 1, coords.row);
    } else {
      columnsToSelect.push(columnIndex, columnIndex + origColspan - 1, coords.row);
    }
  } else if (isLeftClick(event) || isRightClick(event) && allowRightClickSelection || isTouchEvent(event)) {
    columnsToSelect.push(columnIndex, columnIndex + origColspan - 1, coords.row);
  }

  // The plugin takes control of how the columns are selected.
  selection.selectColumns(...columnsToSelect);
}
/**
 * Makes the header-selection properly select the nested headers.
 *
 * @param {MouseEvent} event Mouse event.
 * @param {CellCoords} coords Cell coords object containing the visual coordinates of the clicked cell.
 * @param {HTMLElement} TD The cell element.
 * @param {object} controller An object with properties `row`, `column` and `cell`. Each property contains
 *                            a boolean value that allows or disallows changing the selection for that particular area.
 */
function _onBeforeOnCellMouseOver(event, coords, TD, controller) {
  if (!this.hot.view.isMouseDown()) {
    return;
  }
  const headerNodeData = this._getHeaderTreeNodeDataByCoords(coords);
  if (!headerNodeData) {
    return;
  }
  const {
    columnIndex,
    origColspan
  } = headerNodeData;
  const selectedRange = this.hot.getSelectedRangeLast();
  const topStartCoords = selectedRange.getTopStartCorner();
  const bottomEndCoords = selectedRange.getBottomEndCorner();
  const {
    from
  } = selectedRange;

  // Block the Selection module in controlling how the columns and cells are selected.
  // From now on, the plugin is responsible for the selection.
  controller.column = true;
  controller.cell = true;
  const columnsToSelect = [];
  const headerLevel = clamp(coords.row, -Infinity, -1);
  if (coords.col < from.col) {
    columnsToSelect.push(bottomEndCoords.col, columnIndex, headerLevel);
  } else if (coords.col > from.col) {
    columnsToSelect.push(topStartCoords.col, columnIndex + origColspan - 1, headerLevel);
  } else {
    columnsToSelect.push(columnIndex, columnIndex + origColspan - 1, headerLevel);
  }
  this.hot.selection.selectColumns(...columnsToSelect);
}
/**
 * Switches internal flag about selection progress to `false`.
 */
function _onBeforeOnCellMouseUp() {
  _classPrivateFieldSet(_isColumnsSelectionInProgress, this, false);
}
/**
 * The hook checks and ensures that the focus position that depends on the selected columns
 * range is always positioned within the range.
 */
function _onBeforeSelectionHighlightSet() {
  const {
    navigableHeaders
  } = this.hot.getSettings();
  if (!this.hot.view.isMouseDown() || !_classPrivateFieldGet(_isColumnsSelectionInProgress, this) || !navigableHeaders) {
    return;
  }
  const selectedRange = this.hot.getSelectedRangeLast();
  const columnStart = selectedRange.getTopStartCorner().col;
  const columnEnd = selectedRange.getBottomEndCorner().col;
  const {
    columnIndex,
    origColspan
  } = _classPrivateFieldGet(_stateManager, this).getHeaderTreeNodeData(_classPrivateFieldGet(_focusInitialCoords, this).row, _classPrivateFieldGet(_focusInitialCoords, this).col);
  selectedRange.setHighlight(_classPrivateFieldGet(_focusInitialCoords, this));
  if (origColspan > selectedRange.getWidth() || columnIndex < columnStart || columnIndex + origColspan - 1 > columnEnd) {
    const headerLevel = _classPrivateFieldGet(_stateManager, this).findTopMostEntireHeaderLevel(clamp(columnStart, columnIndex, columnIndex + origColspan - 1), clamp(columnEnd, columnIndex, columnIndex + origColspan - 1));
    selectedRange.highlight.row = headerLevel;
    selectedRange.highlight.col = selectedRange.from.col;
  }
}
/**
 * `modifyTransformStart` hook is called every time the keyboard navigation is used.
 *
 * @param {object} delta The transformation delta.
 */
function _onModifyTransformStart(delta) {
  const {
    highlight
  } = this.hot.getSelectedRangeLast();
  const nextCoords = this.hot._createCellCoords(highlight.row + delta.row, highlight.col + delta.col);
  const isNestedHeadersRange = nextCoords.isHeader() && nextCoords.col >= 0;
  if (!isNestedHeadersRange) {
    return;
  }
  const visualColumnIndexStart = _classPrivateFieldGet(_stateManager, this).findLeftMostColumnIndex(nextCoords.row, nextCoords.col);
  const visualColumnIndexEnd = _classPrivateFieldGet(_stateManager, this).findRightMostColumnIndex(nextCoords.row, nextCoords.col);
  if (delta.col < 0) {
    const nextColumn = highlight.col >= visualColumnIndexStart && highlight.col <= visualColumnIndexEnd ? visualColumnIndexStart - 1 : visualColumnIndexEnd;
    const notHiddenColumnIndex = this.hot.columnIndexMapper.getNearestNotHiddenIndex(nextColumn, -1);
    if (notHiddenColumnIndex === null) {
      // There are no visible columns anymore, so move the selection out of the table edge. This will
      // be processed by the selection Transformer class as a move selection to the previous row (if autoWrapRow is enabled).
      delta.col = -this.hot.view.countRenderableColumnsInRange(0, highlight.col);
    } else {
      delta.col = -Math.max(this.hot.view.countRenderableColumnsInRange(notHiddenColumnIndex, highlight.col) - 1, 1);
    }
  } else if (delta.col > 0) {
    const nextColumn = highlight.col >= visualColumnIndexStart && highlight.col <= visualColumnIndexEnd ? visualColumnIndexEnd + 1 : visualColumnIndexStart;
    const notHiddenColumnIndex = this.hot.columnIndexMapper.getNearestNotHiddenIndex(nextColumn, 1);
    if (notHiddenColumnIndex === null) {
      // There are no visible columns anymore, so move the selection out of the table edge. This will
      // be processed by the selection Transformer class as a move selection to the next row (if autoWrapRow is enabled).
      delta.col = this.hot.view.countRenderableColumnsInRange(highlight.col, this.hot.countCols());
    } else {
      delta.col = Math.max(this.hot.view.countRenderableColumnsInRange(highlight.col, notHiddenColumnIndex) - 1, 1);
    }
  }
}
/**
 * The hook observes the column selection from the Selection API and modifies the column range to
 * ensure that the whole nested column will be covered.
 *
 * @param {CellCoords} from The coords object where the selection starts.
 * @param {CellCoords} to The coords object where the selection ends.
 */
function _onBeforeSelectColumns(from, to) {
  const headerLevel = from.row;
  const startNodeData = this._getHeaderTreeNodeDataByCoords({
    row: headerLevel,
    col: from.col
  });
  const endNodeData = this._getHeaderTreeNodeDataByCoords({
    row: headerLevel,
    col: to.col
  });
  if (to.col < from.col) {
    // Column selection from right to left
    if (startNodeData) {
      from.col = startNodeData.columnIndex + startNodeData.origColspan - 1;
    }
    if (endNodeData) {
      to.col = endNodeData.columnIndex;
    }
  } else if (to.col >= from.col) {
    // Column selection from left to right or a single column selection
    if (startNodeData) {
      from.col = startNodeData.columnIndex;
    }
    if (endNodeData) {
      to.col = endNodeData.columnIndex + endNodeData.origColspan - 1;
    }
  }
}
/**
 * `afterGetColumnHeader` hook callback - prepares the header structure.
 *
 * @param {Array} renderersArray Array of renderers.
 */
function _onAfterGetColumnHeaderRenderers(renderersArray) {
  renderersArray.length = 0;
  for (let headerLayer = 0; headerLayer < _classPrivateFieldGet(_stateManager, this).getLayersCount(); headerLayer++) {
    renderersArray.push(this.headerRendererFactory(headerLayer));
  }
}
/**
 * Make the renderer render the first nested column in its entirety.
 *
 * @param {object} calc Viewport column calculator.
 */
function _onAfterViewportColumnCalculatorOverride(calc) {
  const headerLayersCount = _classPrivateFieldGet(_stateManager, this).getLayersCount();
  let newStartColumn = calc.startColumn;
  let nonRenderable = !!headerLayersCount;
  for (let headerLayer = 0; headerLayer < headerLayersCount; headerLayer++) {
    const startColumn = _classPrivateFieldGet(_stateManager, this).findLeftMostColumnIndex(headerLayer, calc.startColumn);
    const renderedStartColumn = this.hot.columnIndexMapper.getRenderableFromVisualIndex(startColumn);

    // If any of the headers for that column index is rendered, all of them should be rendered properly, see
    // comment below.
    if (startColumn >= 0) {
      nonRenderable = false;
    }

    // `renderedStartColumn` can be `null` if the leftmost columns are hidden. In that case -> ignore that header
    // level, as it should be handled by the "parent" header
    if (isNumeric(renderedStartColumn) && renderedStartColumn < calc.startColumn) {
      newStartColumn = renderedStartColumn;
      break;
    }
  }

  // If no headers for the provided column index are renderable, start rendering from the beginning of the upmost
  // header for that position.
  calc.startColumn = nonRenderable ? _classPrivateFieldGet(_stateManager, this).getHeaderTreeNodeData(0, newStartColumn).columnIndex : newStartColumn;
}
/**
 * `modifyColWidth` hook callback - returns width from cache, when is greater than incoming from hook.
 *
 * @param {number} width Width from hook.
 * @param {number} column Visual index of an column.
 * @returns {number}
 */
function _onModifyColWidth(width, column) {
  const cachedWidth = this.ghostTable.getWidth(column);
  return width > cachedWidth ? width : cachedWidth;
}
/**
 * Listens the `modifyColumnHeaderValue` hook that overwrites the column headers values based on
 * the internal state and settings of the plugin.
 *
 * @param {string} value The column header value.
 * @param {number} visualColumnIndex The visual column index.
 * @param {number} headerLevel The index of header level. The header level accepts positive (0 to N)
 *                             and negative (-1 to -N) values. For positive values, 0 points to the
 *                             top most header, and for negative direction, -1 points to the most bottom
 *                             header (the header closest to the cells).
 * @returns {string} Returns the column header value to update.
 */
function _onModifyColumnHeaderValue(value, visualColumnIndex, headerLevel) {
  var _classPrivateFieldGet5;
  const {
    label
  } = (_classPrivateFieldGet5 = _classPrivateFieldGet(_stateManager, this).getHeaderTreeNodeData(headerLevel, visualColumnIndex)) !== null && _classPrivateFieldGet5 !== void 0 ? _classPrivateFieldGet5 : {
    label: ''
  };
  return label;
}
/**
 * `modifyFocusedElement` hook callback.
 *
 * @param {number} row Row index.
 * @param {number} column Column index.
 * @returns {HTMLTableCellElement} The `TH` element to be focused.
 */
function _onModifyFocusedElement(row, column) {
  if (row < 0) {
    return this.hot.getCell(row, _classPrivateFieldGet(_stateManager, this).findLeftMostColumnIndex(row, column), true);
  }
}
/**
 * Updates the plugin state after HoT initialization.
 */
function _onInit() {
  // @TODO: Workaround for broken plugin initialization abstraction.
  this.updatePlugin();
}
/**
 * Updates the plugin state after new dataset load.
 *
 * @param {Array[]} sourceData Array of arrays or array of objects containing data.
 * @param {boolean} initialLoad Flag that determines whether the data has been loaded
 *                              during the initialization.
 */
function _onAfterLoadData(sourceData, initialLoad) {
  if (!initialLoad) {
    this.updatePlugin();
  }
}