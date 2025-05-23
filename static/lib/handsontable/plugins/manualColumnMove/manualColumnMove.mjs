import "core-js/modules/es.error.cause.js";
import "core-js/modules/es.array.push.js";
function _classPrivateMethodInitSpec(e, a) { _checkPrivateRedeclaration(e, a), a.add(e); }
function _classPrivateFieldInitSpec(e, t, a) { _checkPrivateRedeclaration(e, t), t.set(e, a); }
function _checkPrivateRedeclaration(e, t) { if (t.has(e)) throw new TypeError("Cannot initialize the same private elements twice on an object"); }
function _classPrivateFieldSet(s, a, r) { return s.set(_assertClassBrand(s, a), r), r; }
function _classPrivateFieldGet(s, a) { return s.get(_assertClassBrand(s, a)); }
function _assertClassBrand(e, t, n) { if ("function" == typeof e ? e === t : e.has(t)) return arguments.length < 3 ? t : n; throw new TypeError("Private element is not present on this object"); }
import { BasePlugin } from "../base/index.mjs";
import Hooks from "../../pluginHooks.mjs";
import { arrayReduce } from "../../helpers/array.mjs";
import { addClass, removeClass, offset, hasClass, outerWidth } from "../../helpers/dom/element.mjs";
import { offsetRelativeTo } from "../../helpers/dom/event.mjs";
import { rangeEach } from "../../helpers/number.mjs";
import BacklightUI from "./ui/backlight.mjs";
import GuidelineUI from "./ui/guideline.mjs";
Hooks.getSingleton().register('beforeColumnMove');
Hooks.getSingleton().register('afterColumnMove');
export const PLUGIN_KEY = 'manualColumnMove';
export const PLUGIN_PRIORITY = 120;
const CSS_PLUGIN = 'ht__manualColumnMove';
const CSS_SHOW_UI = 'show-ui';
const CSS_ON_MOVING = 'on-moving--columns';
const CSS_AFTER_SELECTION = 'after-selection--columns';

/* eslint-disable jsdoc/require-description-complete-sentence */

/**
 * @plugin ManualColumnMove
 * @class ManualColumnMove
 *
 * @description
 * This plugin allows to change columns order. To make columns order persistent the {@link Options#persistentState}
 * plugin should be enabled.
 *
 * API:
 * - `moveColumn` - move single column to the new position.
 * - `moveColumns` - move many columns (as an array of indexes) to the new position.
 * - `dragColumn` - drag single column to the new position.
 * - `dragColumns` - drag many columns (as an array of indexes) to the new position.
 *
 * [Documentation](@/guides/columns/column-moving/column-moving.md) explain differences between drag and move actions.
 * Please keep in mind that if you want apply visual changes,
 * you have to call manually the `render` method on the instance of Handsontable.
 *
 * The plugin creates additional components to make moving possibly using user interface:
 * - backlight - highlight of selected columns.
 * - guideline - line which shows where columns has been moved.
 *
 * @class ManualColumnMove
 * @plugin ManualColumnMove
 */
var _backlight = /*#__PURE__*/new WeakMap();
var _guideline = /*#__PURE__*/new WeakMap();
var _columnsToMove = /*#__PURE__*/new WeakMap();
var _countCols = /*#__PURE__*/new WeakMap();
var _pressed = /*#__PURE__*/new WeakMap();
var _target = /*#__PURE__*/new WeakMap();
var _cachedDropIndex = /*#__PURE__*/new WeakMap();
var _hoveredColumn = /*#__PURE__*/new WeakMap();
var _rootElementOffset = /*#__PURE__*/new WeakMap();
var _hasRowHeaders = /*#__PURE__*/new WeakMap();
var _fixedColumnsStart = /*#__PURE__*/new WeakMap();
var _ManualColumnMove_brand = /*#__PURE__*/new WeakSet();
export class ManualColumnMove extends BasePlugin {
  constructor() {
    super(...arguments);
    /**
     * Change the behavior of selection / dragging.
     *
     * @param {MouseEvent} event `mousedown` event properties.
     * @param {CellCoords} coords Visual cell coordinates where was fired event.
     * @param {HTMLElement} TD Cell represented as HTMLElement.
     * @param {object} controller An object with properties `row`, `column` and `cell`. Each property contains
     *                            a boolean value that allows or disallows changing the selection for that particular area.
     */
    _classPrivateMethodInitSpec(this, _ManualColumnMove_brand);
    /**
     * Backlight UI object.
     *
     * @type {object}
     */
    _classPrivateFieldInitSpec(this, _backlight, new BacklightUI(this.hot));
    /**
     * Guideline UI object.
     *
     * @type {object}
     */
    _classPrivateFieldInitSpec(this, _guideline, new GuidelineUI(this.hot));
    /**
     * @type {number[]}
     */
    _classPrivateFieldInitSpec(this, _columnsToMove, []);
    /**
     * @type {number}
     */
    _classPrivateFieldInitSpec(this, _countCols, 0);
    /**
     * @type {boolean}
     */
    _classPrivateFieldInitSpec(this, _pressed, false);
    /**
     * @type {object}
     */
    _classPrivateFieldInitSpec(this, _target, {});
    /**
     * @type {number}
     */
    _classPrivateFieldInitSpec(this, _cachedDropIndex, void 0);
    /**
     * @type {number}
     */
    _classPrivateFieldInitSpec(this, _hoveredColumn, void 0);
    /**
     * @type {number}
     */
    _classPrivateFieldInitSpec(this, _rootElementOffset, void 0);
    /**
     * @type {boolean}
     */
    _classPrivateFieldInitSpec(this, _hasRowHeaders, void 0);
    /**
     * @type {number}
     */
    _classPrivateFieldInitSpec(this, _fixedColumnsStart, void 0);
  }
  static get PLUGIN_KEY() {
    return PLUGIN_KEY;
  }
  static get PLUGIN_PRIORITY() {
    return PLUGIN_PRIORITY;
  }
  /**
   * Checks if the plugin is enabled in the handsontable settings. This method is executed in {@link Hooks#beforeInit}
   * hook and if it returns `true` then the {@link ManualColumnMove#enablePlugin} method is called.
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
    this.addHook('beforeOnCellMouseDown', function () {
      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }
      return _assertClassBrand(_ManualColumnMove_brand, _this, _onBeforeOnCellMouseDown).call(_this, ...args);
    });
    this.addHook('beforeOnCellMouseOver', function () {
      for (var _len2 = arguments.length, args = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
        args[_key2] = arguments[_key2];
      }
      return _assertClassBrand(_ManualColumnMove_brand, _this, _onBeforeOnCellMouseOver).call(_this, ...args);
    });
    this.addHook('afterScrollVertically', () => _assertClassBrand(_ManualColumnMove_brand, this, _onAfterScrollVertically).call(this));
    this.addHook('afterLoadData', function () {
      for (var _len3 = arguments.length, args = new Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
        args[_key3] = arguments[_key3];
      }
      return _assertClassBrand(_ManualColumnMove_brand, _this, _onAfterLoadData).call(_this, ...args);
    });
    this.buildPluginUI();
    this.registerEvents();

    // TODO: move adding plugin classname to BasePlugin.
    addClass(this.hot.rootElement, CSS_PLUGIN);
    super.enablePlugin();
  }

  /**
   * Updates the plugin's state.
   *
   * This method is executed when [`updateSettings()`](@/api/core.md#updatesettings) is invoked with any of the following configuration options:
   *  - [`manualColumnMove`](@/api/options.md#manualcolumnmove)
   */
  updatePlugin() {
    this.disablePlugin();
    this.enablePlugin();
    this.moveBySettingsOrLoad();
    super.updatePlugin();
  }

  /**
   * Disables the plugin functionality for this Handsontable instance.
   */
  disablePlugin() {
    removeClass(this.hot.rootElement, CSS_PLUGIN);
    this.unregisterEvents();
    _classPrivateFieldGet(_backlight, this).destroy();
    _classPrivateFieldGet(_guideline, this).destroy();
    super.disablePlugin();
  }

  /**
   * Moves a single column.
   *
   * @param {number} column Visual column index to be moved.
   * @param {number} finalIndex Visual column index, being a start index for the moved columns. Points to where the elements will be placed after the moving action.
   * To check the visualization of the final index, please take a look at [documentation](@/guides/columns/column-moving/column-moving.md#drag-and-move-actions-of-manualcolumnmove-plugin).
   * @fires Hooks#beforeColumnMove
   * @fires Hooks#afterColumnMove
   * @returns {boolean}
   */
  moveColumn(column, finalIndex) {
    return this.moveColumns([column], finalIndex);
  }

  /**
   * Moves a multiple columns.
   *
   * @param {Array} columns Array of visual column indexes to be moved.
   * @param {number} finalIndex Visual column index, being a start index for the moved columns. Points to where the elements will be placed after the moving action.
   * To check the visualization of the final index, please take a look at [documentation](@/guides/columns/column-moving/column-moving.md#drag-and-move-actions-of-manualcolumnmove-plugin).
   * @fires Hooks#beforeColumnMove
   * @fires Hooks#afterColumnMove
   * @returns {boolean}
   */
  moveColumns(columns, finalIndex) {
    const dropIndex = _classPrivateFieldGet(_cachedDropIndex, this);
    const movePossible = this.isMovePossible(columns, finalIndex);
    const beforeMoveHook = this.hot.runHooks('beforeColumnMove', columns, finalIndex, dropIndex, movePossible);
    _classPrivateFieldSet(_cachedDropIndex, this, undefined);
    if (beforeMoveHook === false) {
      return;
    }
    if (movePossible) {
      this.hot.columnIndexMapper.moveIndexes(columns, finalIndex);
    }
    const movePerformed = movePossible && this.isColumnOrderChanged(columns, finalIndex);
    this.hot.runHooks('afterColumnMove', columns, finalIndex, dropIndex, movePossible, movePerformed);
    return movePerformed;
  }

  /**
   * Drag a single column to drop index position.
   *
   * @param {number} column Visual column index to be dragged.
   * @param {number} dropIndex Visual column index, being a drop index for the moved columns. Points to where we are going to drop the moved elements.
   * To check visualization of drop index please take a look at [documentation](@/guides/columns/column-moving/column-moving.md#drag-and-move-actions-of-manualcolumnmove-plugin).
   * @fires Hooks#beforeColumnMove
   * @fires Hooks#afterColumnMove
   * @returns {boolean}
   */
  dragColumn(column, dropIndex) {
    return this.dragColumns([column], dropIndex);
  }

  /**
   * Drag multiple columns to drop index position.
   *
   * @param {Array} columns Array of visual column indexes to be dragged.
   * @param {number} dropIndex Visual column index, being a drop index for the moved columns. Points to where we are going to drop the moved elements.
   * To check visualization of drop index please take a look at [documentation](@/guides/columns/column-moving/column-moving.md#drag-and-move-actions-of-manualcolumnmove-plugin).
   * @fires Hooks#beforeColumnMove
   * @fires Hooks#afterColumnMove
   * @returns {boolean}
   */
  dragColumns(columns, dropIndex) {
    const finalIndex = this.countFinalIndex(columns, dropIndex);
    _classPrivateFieldSet(_cachedDropIndex, this, dropIndex);
    return this.moveColumns(columns, finalIndex);
  }

  /**
   * Indicates if it's possible to move columns to the desired position. Some of the actions aren't
   * possible, i.e. You can’t move more than one element to the last position.
   *
   * @param {Array} movedColumns Array of visual column indexes to be moved.
   * @param {number} finalIndex Visual column index, being a start index for the moved columns. Points to where the elements will be placed after the moving action.
   * To check the visualization of the final index, please take a look at [documentation](@/guides/columns/column-moving/column-moving.md#drag-and-move-actions-of-manualcolumnmove-plugin).
   * @returns {boolean}
   */
  isMovePossible(movedColumns, finalIndex) {
    const length = this.hot.columnIndexMapper.getNotTrimmedIndexesLength();

    // An attempt to transfer more columns to start destination than is possible (only when moving from the top to the bottom).
    const tooHighDestinationIndex = movedColumns.length + finalIndex > length;
    const tooLowDestinationIndex = finalIndex < 0;
    const tooLowMovedColumnIndex = movedColumns.some(movedColumn => movedColumn < 0);
    const tooHighMovedColumnIndex = movedColumns.some(movedColumn => movedColumn >= length);
    if (tooHighDestinationIndex || tooLowDestinationIndex || tooLowMovedColumnIndex || tooHighMovedColumnIndex) {
      return false;
    }
    return true;
  }

  /**
   * Indicates if order of columns was changed.
   *
   * @private
   * @param {Array} movedColumns Array of visual column indexes to be moved.
   * @param {number} finalIndex Visual column index, being a start index for the moved columns. Points to where the elements will be placed after the moving action.
   * To check the visualization of the final index, please take a look at [documentation](@/guides/columns/column-moving/column-moving.md#drag-and-move-actions-of-manualcolumnmove-plugin).
   * @returns {boolean}
   */
  isColumnOrderChanged(movedColumns, finalIndex) {
    return movedColumns.some((column, nrOfMovedElement) => column - nrOfMovedElement !== finalIndex);
  }

  /**
   * Count the final column index from the drop index.
   *
   * @private
   * @param {Array} movedColumns Array of visual column indexes to be moved.
   * @param {number} dropIndex Visual column index, being a drop index for the moved columns.
   * @returns {number} Visual column index, being a start index for the moved columns.
   */
  countFinalIndex(movedColumns, dropIndex) {
    const numberOfColumnsLowerThanDropIndex = arrayReduce(movedColumns, (numberOfColumns, currentColumnIndex) => {
      if (currentColumnIndex < dropIndex) {
        numberOfColumns += 1;
      }
      return numberOfColumns;
    }, 0);
    return dropIndex - numberOfColumnsLowerThanDropIndex;
  }

  /**
   * Gets the sum of the widths of columns in the provided range.
   *
   * @private
   * @param {number} fromColumn Visual column index.
   * @param {number} toColumn Visual column index.
   * @returns {number}
   */
  getColumnsWidth(fromColumn, toColumn) {
    const columnMapper = this.hot.columnIndexMapper;
    let columnsWidth = 0;
    for (let visualColumnIndex = fromColumn; visualColumnIndex <= toColumn; visualColumnIndex += 1) {
      // We can't use just `getColWidth` (even without indexes translation) as it doesn't return proper values
      // when column is stretched.
      const renderableIndex = columnMapper.getRenderableFromVisualIndex(visualColumnIndex);
      if (visualColumnIndex < 0) {
        columnsWidth += this.hot.view._wt.wtViewport.getRowHeaderWidth() || 0;
      } else if (renderableIndex !== null) {
        columnsWidth += this.hot.view._wt.wtTable.getStretchedColumnWidth(renderableIndex) || 0;
      }
    }
    return columnsWidth;
  }

  /**
   * Loads initial settings when persistent state is saved or when plugin was initialized as an array.
   *
   * @private
   */
  moveBySettingsOrLoad() {
    const pluginSettings = this.hot.getSettings()[PLUGIN_KEY];
    if (Array.isArray(pluginSettings)) {
      this.moveColumns(pluginSettings, 0);
    } else if (pluginSettings !== undefined) {
      const persistentState = this.persistentStateLoad();
      if (persistentState.length) {
        this.moveColumns(persistentState, 0);
      }
    }
  }

  /**
   * Checks if the provided column is in the fixedColumnsTop section.
   *
   * @private
   * @param {number} column Visual column index to check.
   * @returns {boolean}
   */
  isFixedColumnsStart(column) {
    return column < this.hot.getSettings().fixedColumnsStart;
  }

  /**
   * Saves the manual column positions to the persistent state (the {@link Options#persistentState} option has to be enabled).
   *
   * @private
   * @fires Hooks#persistentStateSave
   */
  persistentStateSave() {
    this.hot.runHooks('persistentStateSave', 'manualColumnMove', this.hot.columnIndexMapper.getIndexesSequence()); // The `PersistentState` plugin should be refactored.
  }

  /**
   * Loads the manual column positions from the persistent state (the {@link Options#persistentState} option has to be enabled).
   *
   * @private
   * @fires Hooks#persistentStateLoad
   * @returns {Array} Stored state.
   */
  persistentStateLoad() {
    const storedState = {};
    this.hot.runHooks('persistentStateLoad', 'manualColumnMove', storedState);
    return storedState.value ? storedState.value : [];
  }

  /**
   * Prepares an array of indexes based on actual selection.
   *
   * @private
   * @param {number} start The start index.
   * @param {number} end The end index.
   * @returns {Array}
   */
  prepareColumnsToMoving(start, end) {
    const selectedColumns = [];
    rangeEach(start, end, i => {
      selectedColumns.push(i);
    });
    return selectedColumns;
  }

  /**
   * Update the UI visual position.
   *
   * @private
   */
  refreshPositions() {
    const firstVisible = this.hot.view.getFirstFullyVisibleColumn();
    if (this.isFixedColumnsStart(_classPrivateFieldGet(_hoveredColumn, this)) && firstVisible > 0) {
      this.hot.scrollViewportTo({
        col: this.hot.columnIndexMapper.getNearestNotHiddenIndex(firstVisible - 1, -1)
      });
    }
    const wtTable = this.hot.view._wt.wtTable;
    const scrollableElement = this.hot.view._wt.wtOverlays.scrollableElement;
    const scrollStart = typeof scrollableElement.scrollX === 'number' ? scrollableElement.scrollX : scrollableElement.scrollLeft;
    let tdOffsetStart = this.hot.view.THEAD.offsetLeft + this.getColumnsWidth(0, _classPrivateFieldGet(_hoveredColumn, this) - 1);
    const hiderWidth = wtTable.hider.offsetWidth;
    const tbodyOffsetLeft = wtTable.TBODY.offsetLeft;
    const backlightElemMarginStart = _classPrivateFieldGet(_backlight, this).getOffset().start;
    const backlightElemWidth = _classPrivateFieldGet(_backlight, this).getSize().width;
    let rowHeaderWidth = 0;
    let mouseOffsetStart = 0;
    if (this.hot.isRtl()) {
      const rootWindow = this.hot.rootWindow;
      const containerWidth = outerWidth(this.hot.rootElement);
      const gridMostRightPos = rootWindow.innerWidth - _classPrivateFieldGet(_rootElementOffset, this) - containerWidth;
      mouseOffsetStart = rootWindow.innerWidth - _classPrivateFieldGet(_target, this).eventPageX - gridMostRightPos - (scrollableElement.scrollX === undefined ? scrollStart : 0);
    } else {
      mouseOffsetStart = _classPrivateFieldGet(_target, this).eventPageX - (_classPrivateFieldGet(_rootElementOffset, this) - (scrollableElement.scrollX === undefined ? scrollStart : 0));
    }
    if (_classPrivateFieldGet(_hasRowHeaders, this)) {
      rowHeaderWidth = this.hot.view._wt.wtOverlays.inlineStartOverlay.clone.wtTable.getColumnHeader(-1).offsetWidth;
    }
    if (this.isFixedColumnsStart(_classPrivateFieldGet(_hoveredColumn, this))) {
      tdOffsetStart += scrollStart;
    }
    tdOffsetStart += rowHeaderWidth;
    if (_classPrivateFieldGet(_hoveredColumn, this) < 0) {
      // if hover on rowHeader
      if (_classPrivateFieldGet(_fixedColumnsStart, this) > 0) {
        _classPrivateFieldGet(_target, this).col = 0;
      } else {
        _classPrivateFieldGet(_target, this).col = firstVisible > 0 ? firstVisible - 1 : firstVisible;
      }
    } else if (_classPrivateFieldGet(_target, this).TD.offsetWidth / 2 + tdOffsetStart <= mouseOffsetStart) {
      const newCoordsCol = _classPrivateFieldGet(_hoveredColumn, this) >= _classPrivateFieldGet(_countCols, this) ? _classPrivateFieldGet(_countCols, this) - 1 : _classPrivateFieldGet(_hoveredColumn, this);

      // if hover on right part of TD
      _classPrivateFieldGet(_target, this).col = newCoordsCol + 1;
      // unfortunately first column is bigger than rest
      tdOffsetStart += _classPrivateFieldGet(_target, this).TD.offsetWidth;
    } else {
      // elsewhere on table
      _classPrivateFieldGet(_target, this).col = _classPrivateFieldGet(_hoveredColumn, this);
    }
    let backlightStart = mouseOffsetStart;
    let guidelineStart = tdOffsetStart;
    if (mouseOffsetStart + backlightElemWidth + backlightElemMarginStart >= hiderWidth) {
      // prevent display backlight on the right side of the table
      backlightStart = hiderWidth - backlightElemWidth - backlightElemMarginStart;
    } else if (mouseOffsetStart + backlightElemMarginStart < tbodyOffsetLeft + rowHeaderWidth) {
      // prevent display backlight on the left side of the table
      backlightStart = tbodyOffsetLeft + rowHeaderWidth + Math.abs(backlightElemMarginStart);
    }
    if (tdOffsetStart >= hiderWidth - 1) {
      // prevent display guideline outside the table
      guidelineStart = hiderWidth - 1;
    } else if (guidelineStart === 0) {
      // guideline has got `margin-left: -1px` as default
      guidelineStart = 1;
    } else if (scrollableElement.scrollX !== undefined && _classPrivateFieldGet(_hoveredColumn, this) < _classPrivateFieldGet(_fixedColumnsStart, this)) {
      guidelineStart -= _classPrivateFieldGet(_rootElementOffset, this) <= scrollableElement.scrollX ? _classPrivateFieldGet(_rootElementOffset, this) : 0;
    }
    _classPrivateFieldGet(_backlight, this).setPosition(null, backlightStart);
    _classPrivateFieldGet(_guideline, this).setPosition(null, guidelineStart);
  }

  /**
   * Binds the events used by the plugin.
   *
   * @private
   */
  registerEvents() {
    const {
      documentElement
    } = this.hot.rootDocument;
    this.eventManager.addEventListener(documentElement, 'mousemove', event => _assertClassBrand(_ManualColumnMove_brand, this, _onMouseMove).call(this, event));
    this.eventManager.addEventListener(documentElement, 'mouseup', () => _assertClassBrand(_ManualColumnMove_brand, this, _onMouseUp).call(this));
  }

  /**
   * Unbinds the events used by the plugin.
   *
   * @private
   */
  unregisterEvents() {
    this.eventManager.clear();
  }
  /**
   * Builds the plugin's UI.
   *
   * @private
   */
  buildPluginUI() {
    _classPrivateFieldGet(_backlight, this).build();
    _classPrivateFieldGet(_guideline, this).build();
  }

  /**
   * Callback for the `afterLoadData` hook.
   *
   * @private
   */

  /**
   * Destroys the plugin instance.
   */
  destroy() {
    _classPrivateFieldGet(_backlight, this).destroy();
    _classPrivateFieldGet(_guideline, this).destroy();
    super.destroy();
  }
}
function _onBeforeOnCellMouseDown(event, coords, TD, controller) {
  const wtTable = this.hot.view._wt.wtTable;
  const isHeaderSelection = this.hot.selection.isSelectedByColumnHeader();
  const selection = this.hot.getSelectedRangeLast();
  // This block action shouldn't be handled below.
  const isSortingElement = hasClass(event.target, 'sortAction');
  if (!selection || !isHeaderSelection || _classPrivateFieldGet(_pressed, this) || event.button !== 0 || isSortingElement) {
    _classPrivateFieldSet(_pressed, this, false);
    _classPrivateFieldGet(_columnsToMove, this).length = 0;
    removeClass(this.hot.rootElement, [CSS_ON_MOVING, CSS_SHOW_UI]);
    return;
  }
  const guidelineIsNotReady = _classPrivateFieldGet(_guideline, this).isBuilt() && !_classPrivateFieldGet(_guideline, this).isAppended();
  const backlightIsNotReady = _classPrivateFieldGet(_backlight, this).isBuilt() && !_classPrivateFieldGet(_backlight, this).isAppended();
  if (guidelineIsNotReady && backlightIsNotReady) {
    _classPrivateFieldGet(_guideline, this).appendTo(wtTable.hider);
    _classPrivateFieldGet(_backlight, this).appendTo(wtTable.hider);
  }
  const {
    from,
    to
  } = selection;
  const start = Math.min(from.col, to.col);
  const end = Math.max(from.col, to.col);
  if (coords.row < 0 && coords.col >= start && coords.col <= end) {
    controller.column = true;
    _classPrivateFieldSet(_pressed, this, true);
    const eventOffsetX = TD.firstChild ? offsetRelativeTo(event, TD.firstChild).x : event.offsetX;
    _classPrivateFieldGet(_target, this).eventPageX = event.pageX;
    _classPrivateFieldSet(_hoveredColumn, this, coords.col);
    _classPrivateFieldGet(_target, this).TD = TD;
    _classPrivateFieldGet(_target, this).col = coords.col;
    _classPrivateFieldSet(_columnsToMove, this, this.prepareColumnsToMoving(start, end));
    _classPrivateFieldSet(_hasRowHeaders, this, !!this.hot.getSettings().rowHeaders);
    _classPrivateFieldSet(_countCols, this, this.hot.countCols());
    _classPrivateFieldSet(_fixedColumnsStart, this, this.hot.getSettings().fixedColumnsStart);
    _classPrivateFieldSet(_rootElementOffset, this, offset(this.hot.rootElement).left);
    const countColumnsFrom = _classPrivateFieldGet(_hasRowHeaders, this) ? -1 : 0;
    const topPos = wtTable.holder.scrollTop + wtTable.getColumnHeaderHeight(0) + 1;
    const fixedColumnsStart = coords.col < _classPrivateFieldGet(_fixedColumnsStart, this);
    const horizontalScrollPosition = this.hot.view._wt.wtOverlays.inlineStartOverlay.getOverlayOffset();
    const offsetX = Math.abs(eventOffsetX - (this.hot.isRtl() ? TD.offsetWidth : 0));
    const inlineOffset = this.getColumnsWidth(start, coords.col - 1) + offsetX;
    const inlinePos = this.getColumnsWidth(countColumnsFrom, start - 1) + (fixedColumnsStart ? horizontalScrollPosition : 0) + inlineOffset;
    _classPrivateFieldGet(_backlight, this).setPosition(topPos, inlinePos);
    _classPrivateFieldGet(_backlight, this).setSize(this.getColumnsWidth(start, end), wtTable.hider.offsetHeight - topPos);
    _classPrivateFieldGet(_backlight, this).setOffset(null, -inlineOffset);
    addClass(this.hot.rootElement, CSS_ON_MOVING);
  } else {
    removeClass(this.hot.rootElement, CSS_AFTER_SELECTION);
    _classPrivateFieldSet(_pressed, this, false);
    _classPrivateFieldGet(_columnsToMove, this).length = 0;
  }
}
/**
 * 'mouseMove' event callback. Fired when pointer move on document.documentElement.
 *
 * @param {MouseEvent} event `mousemove` event properties.
 */
function _onMouseMove(event) {
  if (!_classPrivateFieldGet(_pressed, this)) {
    return;
  }
  _classPrivateFieldGet(_target, this).eventPageX = event.pageX;
  this.refreshPositions();
}
/**
 * 'beforeOnCellMouseOver' hook callback. Fired when pointer was over cell.
 *
 * @param {MouseEvent} event `mouseover` event properties.
 * @param {CellCoords} coords Visual cell coordinates where was fired event.
 * @param {HTMLElement} TD Cell represented as HTMLElement.
 * @param {object} controller An object with properties `row`, `column` and `cell`. Each property contains
 *                            a boolean value that allows or disallows changing the selection for that particular area.
 */
function _onBeforeOnCellMouseOver(event, coords, TD, controller) {
  const selectedRange = this.hot.getSelectedRangeLast();
  if (!selectedRange || !_classPrivateFieldGet(_pressed, this)) {
    return;
  }
  if (_classPrivateFieldGet(_columnsToMove, this).indexOf(coords.col) > -1) {
    removeClass(this.hot.rootElement, CSS_SHOW_UI);
  } else {
    addClass(this.hot.rootElement, CSS_SHOW_UI);
  }
  controller.row = true;
  controller.column = true;
  controller.cell = true;
  _classPrivateFieldSet(_hoveredColumn, this, coords.col);
  _classPrivateFieldGet(_target, this).TD = TD;
}
/**
 * `onMouseUp` hook callback.
 */
function _onMouseUp() {
  const target = _classPrivateFieldGet(_target, this).col;
  const columnsLen = _classPrivateFieldGet(_columnsToMove, this).length;
  _classPrivateFieldSet(_hoveredColumn, this, undefined);
  _classPrivateFieldSet(_pressed, this, false);
  removeClass(this.hot.rootElement, [CSS_ON_MOVING, CSS_SHOW_UI, CSS_AFTER_SELECTION]);
  if (this.hot.selection.isSelectedByColumnHeader()) {
    addClass(this.hot.rootElement, CSS_AFTER_SELECTION);
  }
  if (columnsLen < 1 || target === undefined) {
    return;
  }
  const firstMovedVisualColumn = _classPrivateFieldGet(_columnsToMove, this)[0];
  const firstMovedPhysicalColumn = this.hot.toPhysicalColumn(firstMovedVisualColumn);
  const movePerformed = this.dragColumns(_classPrivateFieldGet(_columnsToMove, this), target);
  _classPrivateFieldGet(_columnsToMove, this).length = 0;
  if (movePerformed === true) {
    this.persistentStateSave();
    this.hot.render();
    this.hot.view.adjustElementsSize();
    const selectionStart = this.hot.toVisualColumn(firstMovedPhysicalColumn);
    const selectionEnd = selectionStart + columnsLen - 1;
    this.hot.selectColumns(selectionStart, selectionEnd);
  }
}
/**
 * `afterScrollHorizontally` hook callback. Fired the table was scrolled horizontally.
 */
function _onAfterScrollVertically() {
  const wtTable = this.hot.view._wt.wtTable;
  const headerHeight = wtTable.getColumnHeaderHeight(0) + 1;
  const scrollTop = wtTable.holder.scrollTop;
  const posTop = headerHeight + scrollTop;
  _classPrivateFieldGet(_backlight, this).setPosition(posTop);
  _classPrivateFieldGet(_backlight, this).setSize(null, wtTable.hider.offsetHeight - posTop);
}
function _onAfterLoadData() {
  this.moveBySettingsOrLoad();
}