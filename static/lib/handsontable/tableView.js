"use strict";

exports.__esModule = true;
require("core-js/modules/es.error.cause.js");
require("core-js/modules/es.array.push.js");
var _element = require("./helpers/dom/element");
var _eventManager = _interopRequireDefault(require("./eventManager"));
var _event = require("./helpers/dom/event");
var _src = _interopRequireDefault(require("./3rdparty/walkontable/src"));
var _mouseEventHandler = require("./selection/mouseEventHandler");
var _rootInstance = require("./utils/rootInstance");
var _a11y = require("./helpers/a11y");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
function _classPrivateMethodInitSpec(e, a) { _checkPrivateRedeclaration(e, a), a.add(e); }
function _classPrivateFieldInitSpec(e, t, a) { _checkPrivateRedeclaration(e, t), t.set(e, a); }
function _checkPrivateRedeclaration(e, t) { if (t.has(e)) throw new TypeError("Cannot initialize the same private elements twice on an object"); }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
function _classPrivateFieldGet(s, a) { return s.get(_assertClassBrand(s, a)); }
function _classPrivateFieldSet(s, a, r) { return s.set(_assertClassBrand(s, a), r), r; }
function _assertClassBrand(e, t, n) { if ("function" == typeof e ? e === t : e.has(t)) return arguments.length < 3 ? t : n; throw new TypeError("Private element is not present on this object"); }
/**
 * @class TableView
 * @private
 */
var _columnHeadersCount = /*#__PURE__*/new WeakMap();
var _rowHeadersCount = /*#__PURE__*/new WeakMap();
var _selectionMouseDown = /*#__PURE__*/new WeakMap();
var _mouseDown = /*#__PURE__*/new WeakMap();
var _table = /*#__PURE__*/new WeakMap();
var _lastWidth = /*#__PURE__*/new WeakMap();
var _lastHeight = /*#__PURE__*/new WeakMap();
var _TableView_brand = /*#__PURE__*/new WeakSet();
class TableView {
  /**
   * @param {Hanstontable} hotInstance Instance of {@link Handsontable}.
   */
  constructor(hotInstance) {
    /**
     * Return the value of the `aria-colcount` attribute.
     *
     * @returns {number} The value of the `aria-colcount` attribute.
     */
    _classPrivateMethodInitSpec(this, _TableView_brand);
    /**
     * Instance of {@link Handsontable}.
     *
     * @private
     * @type {Handsontable}
     */
    _defineProperty(this, "hot", void 0);
    /**
     * Instance of {@link EventManager}.
     *
     * @private
     * @type {EventManager}
     */
    _defineProperty(this, "eventManager", void 0);
    /**
     * Current Handsontable's GridSettings object.
     *
     * @private
     * @type {GridSettings}
     */
    _defineProperty(this, "settings", void 0);
    /**
     * Main <THEAD> element.
     *
     * @private
     * @type {HTMLTableSectionElement}
     */
    _defineProperty(this, "THEAD", void 0);
    /**
     * Main <TBODY> element.
     *
     * @private
     * @type {HTMLTableSectionElement}
     */
    _defineProperty(this, "TBODY", void 0);
    /**
     * Main Walkontable instance.
     *
     * @private
     * @type {Walkontable}
     */
    _defineProperty(this, "_wt", void 0);
    /**
     * Main Walkontable instance.
     *
     * @type {Walkontable}
     */
    _defineProperty(this, "activeWt", void 0);
    /**
     * The total number of the column header renderers applied to the table through the
     * `afterGetColumnHeaderRenderers` hook.
     *
     * @type {number}
     */
    _classPrivateFieldInitSpec(this, _columnHeadersCount, 0);
    /**
     * The total number of the row header renderers applied to the table through the
     * `afterGetRowHeaderRenderers` hook.
     *
     * @type {number}
     */
    _classPrivateFieldInitSpec(this, _rowHeadersCount, 0);
    /**
     * The flag determines if the `adjustElementsSize` method call was made during
     * the render suspending. If true, the method has to be triggered once after render
     * resuming.
     *
     * @private
     * @type {boolean}
     */
    _defineProperty(this, "postponedAdjustElementsSize", false);
    /**
     * Defines if the text should be selected during mousemove.
     *
     * @type {boolean}
     */
    _classPrivateFieldInitSpec(this, _selectionMouseDown, false);
    /**
     * @type {boolean}
     */
    _classPrivateFieldInitSpec(this, _mouseDown, void 0);
    /**
     * Main <TABLE> element.
     *
     * @type {HTMLTableElement}
     */
    _classPrivateFieldInitSpec(this, _table, void 0);
    /**
     * Cached width of the rootElement.
     *
     * @type {number}
     */
    _classPrivateFieldInitSpec(this, _lastWidth, 0);
    /**
     * Cached height of the rootElement.
     *
     * @type {number}
     */
    _classPrivateFieldInitSpec(this, _lastHeight, 0);
    this.hot = hotInstance;
    this.eventManager = new _eventManager.default(this.hot);
    this.settings = this.hot.getSettings();
    this.createElements();
    this.registerEvents();
    this.initializeWalkontable();
  }

  /**
   * Renders WalkontableUI.
   */
  render() {
    if (!this.hot.isRenderSuspended()) {
      this.hot.runHooks('beforeRender', this.hot.forceFullRender);
      if (this.postponedAdjustElementsSize) {
        this.postponedAdjustElementsSize = false;
        this.adjustElementsSize(true);
      }
      this._wt.draw(!this.hot.forceFullRender);
      this.hot.runHooks('afterRender', this.hot.forceFullRender);
      this.hot.forceFullRender = false;
      this.hot.renderCall = false;
    }
  }

  /**
   * Adjust overlays elements size and master table size.
   */
  adjustElementsSize() {
    if (this.hot.isRenderSuspended()) {
      this.postponedAdjustElementsSize = true;
    } else {
      this._wt.wtOverlays.adjustElementsSize();
    }
  }

  /**
   * Returns td object given coordinates.
   *
   * @param {CellCoords} coords Renderable cell coordinates.
   * @param {boolean} topmost Indicates whether the cell should be calculated from the topmost.
   * @returns {HTMLTableCellElement|null}
   */
  getCellAtCoords(coords, topmost) {
    const td = this._wt.getCell(coords, topmost);
    if (td < 0) {
      // there was an exit code (cell is out of bounds)
      return null;
    }
    return td;
  }

  /**
   * Scroll viewport to a cell.
   *
   * @param {CellCoords} coords Renderable cell coordinates.
   * @param {boolean} [snapToTop] If `true`, viewport is scrolled to show the cell on the top of the table.
   * @param {boolean} [snapToRight] If `true`, viewport is scrolled to show the cell on the right side of the table.
   * @param {boolean} [snapToBottom] If `true`, viewport is scrolled to show the cell on the bottom side of the table.
   * @param {boolean} [snapToLeft] If `true`, viewport is scrolled to show the cell on the left side of the table.
   * @returns {boolean}
   */
  scrollViewport(coords, snapToTop, snapToRight, snapToBottom, snapToLeft) {
    return this._wt.scrollViewport(coords, snapToTop, snapToRight, snapToBottom, snapToLeft);
  }

  /**
   * Scroll viewport to a column.
   *
   * @param {number} column Renderable column index.
   * @param {boolean} [snapToRight] If `true`, viewport is scrolled to show the cell on the right side of the table.
   * @param {boolean} [snapToLeft] If `true`, viewport is scrolled to show the cell on the left side of the table.
   * @returns {boolean}
   */
  scrollViewportHorizontally(column, snapToRight, snapToLeft) {
    return this._wt.scrollViewportHorizontally(column, snapToRight, snapToLeft);
  }

  /**
   * Scroll viewport to a row.
   *
   * @param {number} row Renderable row index.
   * @param {boolean} [snapToTop] If `true`, viewport is scrolled to show the cell on the top of the table.
   * @param {boolean} [snapToBottom] If `true`, viewport is scrolled to show the cell on the bottom side of the table.
   * @returns {boolean}
   */
  scrollViewportVertically(row, snapToTop, snapToBottom) {
    return this._wt.scrollViewportVertically(row, snapToTop, snapToBottom);
  }

  /**
   * Prepares DOMElements and adds correct className to the root element.
   *
   * @private
   */
  createElements() {
    const {
      rootElement,
      rootDocument
    } = this.hot;
    const originalStyle = rootElement.getAttribute('style');
    if (originalStyle) {
      rootElement.setAttribute('data-originalstyle', originalStyle); // needed to retrieve original style in jsFiddle link generator in HT examples. may be removed in future versions
    }
    (0, _element.addClass)(rootElement, 'handsontable');
    _classPrivateFieldSet(_table, this, rootDocument.createElement('TABLE'));
    (0, _element.addClass)(_classPrivateFieldGet(_table, this), 'htCore');
    if (this.hot.getSettings().tableClassName) {
      (0, _element.addClass)(_classPrivateFieldGet(_table, this), this.hot.getSettings().tableClassName);
    }
    if (this.settings.ariaTags) {
      (0, _element.setAttribute)(_classPrivateFieldGet(_table, this), [(0, _a11y.A11Y_PRESENTATION)()]);
      (0, _element.setAttribute)(rootElement, [(0, _a11y.A11Y_TREEGRID)(), (0, _a11y.A11Y_ROWCOUNT)(-1), (0, _a11y.A11Y_COLCOUNT)(this.hot.countCols()), (0, _a11y.A11Y_MULTISELECTABLE)()]);
    }
    this.THEAD = rootDocument.createElement('THEAD');
    _classPrivateFieldGet(_table, this).appendChild(this.THEAD);
    this.TBODY = rootDocument.createElement('TBODY');
    _classPrivateFieldGet(_table, this).appendChild(this.TBODY);
    this.hot.table = _classPrivateFieldGet(_table, this);
    this.hot.container.insertBefore(_classPrivateFieldGet(_table, this), this.hot.container.firstChild);
  }

  /**
   * Attaches necessary listeners.
   *
   * @private
   */
  registerEvents() {
    const {
      rootElement,
      rootDocument,
      selection,
      rootWindow
    } = this.hot;
    const documentElement = rootDocument.documentElement;
    this.eventManager.addEventListener(rootElement, 'mousedown', event => {
      _classPrivateFieldSet(_selectionMouseDown, this, true);
      if (!this.isTextSelectionAllowed(event.target)) {
        (0, _element.clearTextSelection)(rootWindow);
        event.preventDefault();
        rootWindow.focus(); // make sure that window that contains HOT is active. Important when HOT is in iframe.
      }
    });
    this.eventManager.addEventListener(rootElement, 'mouseup', () => {
      _classPrivateFieldSet(_selectionMouseDown, this, false);
    });
    this.eventManager.addEventListener(rootElement, 'mousemove', event => {
      if (_classPrivateFieldGet(_selectionMouseDown, this) && !this.isTextSelectionAllowed(event.target)) {
        // Clear selection only when fragmentSelection is enabled, otherwise clearing selection breaks the IME editor.
        if (this.settings.fragmentSelection) {
          (0, _element.clearTextSelection)(rootWindow);
        }
        event.preventDefault();
      }
    });
    this.eventManager.addEventListener(documentElement, 'keyup', event => {
      // TODO: is it the best place and way to finish cell selection?
      if (selection.isInProgress() && !event.shiftKey) {
        selection.finish();
      }
    });
    this.eventManager.addEventListener(documentElement, 'mouseup', event => {
      if (selection.isInProgress() && (0, _event.isLeftClick)(event)) {
        selection.finish();
      }
      _classPrivateFieldSet(_mouseDown, this, false);
      const isOutsideInputElement = (0, _element.isOutsideInput)(rootDocument.activeElement);
      if ((0, _element.isInput)(rootDocument.activeElement) && !isOutsideInputElement) {
        return;
      }
      if (isOutsideInputElement || !selection.isSelected() && !selection.isSelectedByAnyHeader() && !rootElement.contains(event.target) && !(0, _event.isRightClick)(event)) {
        this.hot.unlisten();
      }
    });
    this.eventManager.addEventListener(documentElement, 'contextmenu', event => {
      if (selection.isInProgress() && (0, _event.isRightClick)(event)) {
        selection.finish();
        _classPrivateFieldSet(_mouseDown, this, false);
      }
    });
    this.eventManager.addEventListener(documentElement, 'touchend', () => {
      if (selection.isInProgress()) {
        selection.finish();
      }
      _classPrivateFieldSet(_mouseDown, this, false);
    });
    this.eventManager.addEventListener(documentElement, 'mousedown', event => {
      const originalTarget = event.target;
      const eventX = event.x || event.clientX;
      const eventY = event.y || event.clientY;
      let next = event.target;
      if (_classPrivateFieldGet(_mouseDown, this) || !rootElement || !this.hot.view) {
        return; // it must have been started in a cell
      }

      // immediate click on "holder" means click on the right side of vertical scrollbar
      const {
        holder
      } = this._wt.wtTable;
      if (next === holder) {
        const scrollbarWidth = (0, _element.getScrollbarWidth)(rootDocument);
        if (rootDocument.elementFromPoint(eventX + scrollbarWidth, eventY) !== holder || rootDocument.elementFromPoint(eventX, eventY + scrollbarWidth) !== holder) {
          return;
        }
      } else {
        while (next !== documentElement) {
          if (next === null) {
            if (event.isTargetWebComponent) {
              break;
            }

            // click on something that was a row but now is detached (possibly because your click triggered a rerender)
            return;
          }
          if (next === rootElement) {
            // click inside container
            return;
          }
          next = next.parentNode;
        }
      }

      // function did not return until here, we have an outside click!
      const outsideClickDeselects = typeof this.settings.outsideClickDeselects === 'function' ? this.settings.outsideClickDeselects(originalTarget) : this.settings.outsideClickDeselects;
      if (outsideClickDeselects) {
        this.hot.deselectCell();
      } else {
        this.hot.destroyEditor(false, false);
      }
    });
    let parentWindow = (0, _element.getParentWindow)(rootWindow);
    while (parentWindow !== null) {
      this.eventManager.addEventListener(parentWindow.document.documentElement, 'click', () => {
        this.hot.unlisten();
      });
      parentWindow = (0, _element.getParentWindow)(parentWindow);
    }
    this.eventManager.addEventListener(_classPrivateFieldGet(_table, this), 'selectstart', event => {
      if (this.settings.fragmentSelection || (0, _element.isInput)(event.target)) {
        return;
      }
      // https://github.com/handsontable/handsontable/issues/160
      // Prevent text from being selected when performing drag down.
      event.preventDefault();
    });
  }

  /**
   * Translate renderable cell coordinates to visual coordinates.
   *
   * @param {CellCoords} coords The cell coordinates.
   * @returns {CellCoords}
   */
  translateFromRenderableToVisualCoords(_ref) {
    let {
      row,
      col
    } = _ref;
    // TODO: To consider an idea to reusing the CellCoords instance instead creating new one.
    return this.hot._createCellCoords(...this.translateFromRenderableToVisualIndex(row, col));
  }

  /**
   * Translate renderable row and column indexes to visual row and column indexes.
   *
   * @param {number} renderableRow Renderable row index.
   * @param {number} renderableColumn Renderable columnIndex.
   * @returns {number[]}
   */
  translateFromRenderableToVisualIndex(renderableRow, renderableColumn) {
    // TODO: Some helper may be needed.
    // We perform translation for indexes (without headers).
    let visualRow = renderableRow >= 0 ? this.hot.rowIndexMapper.getVisualFromRenderableIndex(renderableRow) : renderableRow;
    let visualColumn = renderableColumn >= 0 ? this.hot.columnIndexMapper.getVisualFromRenderableIndex(renderableColumn) : renderableColumn;
    if (visualRow === null) {
      visualRow = renderableRow;
    }
    if (visualColumn === null) {
      visualColumn = renderableColumn;
    }
    return [visualRow, visualColumn];
  }

  /**
   * Returns the number of renderable indexes.
   *
   * @private
   * @param {IndexMapper} indexMapper The IndexMapper instance for specific axis.
   * @param {number} maxElements Maximum number of elements (rows or columns).
   *
   * @returns {number|*}
   */
  countRenderableIndexes(indexMapper, maxElements) {
    const consideredElements = Math.min(indexMapper.getNotTrimmedIndexesLength(), maxElements);
    // Don't take hidden indexes into account. We are looking just for renderable indexes.
    const firstNotHiddenIndex = indexMapper.getNearestNotHiddenIndex(consideredElements - 1, -1);

    // There are no renderable indexes.
    if (firstNotHiddenIndex === null) {
      return 0;
    }
    return indexMapper.getRenderableFromVisualIndex(firstNotHiddenIndex) + 1;
  }

  /**
   * Returns the number of renderable columns.
   *
   * @returns {number}
   */
  countRenderableColumns() {
    return this.countRenderableIndexes(this.hot.columnIndexMapper, this.settings.maxCols);
  }

  /**
   * Returns the number of renderable rows.
   *
   * @returns {number}
   */
  countRenderableRows() {
    return this.countRenderableIndexes(this.hot.rowIndexMapper, this.settings.maxRows);
  }

  /**
   * Returns number of not hidden row indexes counting from the passed starting index.
   * The counting direction can be controlled by `incrementBy` argument.
   *
   * @param {number} visualIndex The visual index from which the counting begins.
   * @param {number} incrementBy If `-1` then counting is backwards or forward when `1`.
   * @returns {number}
   */
  countNotHiddenRowIndexes(visualIndex, incrementBy) {
    return this.countNotHiddenIndexes(visualIndex, incrementBy, this.hot.rowIndexMapper, this.countRenderableRows());
  }

  /**
   * Returns number of not hidden column indexes counting from the passed starting index.
   * The counting direction can be controlled by `incrementBy` argument.
   *
   * @param {number} visualIndex The visual index from which the counting begins.
   * @param {number} incrementBy If `-1` then counting is backwards or forward when `1`.
   * @returns {number}
   */
  countNotHiddenColumnIndexes(visualIndex, incrementBy) {
    return this.countNotHiddenIndexes(visualIndex, incrementBy, this.hot.columnIndexMapper, this.countRenderableColumns());
  }

  /**
   * Returns number of not hidden indexes counting from the passed starting index.
   * The counting direction can be controlled by `incrementBy` argument.
   *
   * @param {number} visualIndex The visual index from which the counting begins.
   * @param {number} incrementBy If `-1` then counting is backwards or forward when `1`.
   * @param {IndexMapper} indexMapper The IndexMapper instance for specific axis.
   * @param {number} renderableIndexesCount Total count of renderable indexes for specific axis.
   * @returns {number}
   */
  countNotHiddenIndexes(visualIndex, incrementBy, indexMapper, renderableIndexesCount) {
    if (isNaN(visualIndex) || visualIndex < 0) {
      return 0;
    }
    const firstVisibleIndex = indexMapper.getNearestNotHiddenIndex(visualIndex, incrementBy);
    const renderableIndex = indexMapper.getRenderableFromVisualIndex(firstVisibleIndex);
    if (!Number.isInteger(renderableIndex)) {
      return 0;
    }
    let notHiddenIndexes = 0;
    if (incrementBy < 0) {
      // Zero-based numbering for renderable indexes corresponds to a number of not hidden indexes.
      notHiddenIndexes = renderableIndex + 1;
    } else if (incrementBy > 0) {
      notHiddenIndexes = renderableIndexesCount - renderableIndex;
    }
    return notHiddenIndexes;
  }

  /**
   * The function returns the number of not hidden column indexes that fit between the first and
   * last fixed column in the left (or right in RTL mode) overlay.
   *
   * @returns {number}
   */
  countNotHiddenFixedColumnsStart() {
    const countCols = this.hot.countCols();
    const visualFixedColumnsStart = Math.min(parseInt(this.settings.fixedColumnsStart, 10), countCols) - 1;
    return this.countNotHiddenColumnIndexes(visualFixedColumnsStart, -1);
  }

  /**
   * The function returns the number of not hidden row indexes that fit between the first and
   * last fixed row in the top overlay.
   *
   * @returns {number}
   */
  countNotHiddenFixedRowsTop() {
    const countRows = this.hot.countRows();
    const visualFixedRowsTop = Math.min(parseInt(this.settings.fixedRowsTop, 10), countRows) - 1;
    return this.countNotHiddenRowIndexes(visualFixedRowsTop, -1);
  }

  /**
   * The function returns the number of not hidden row indexes that fit between the first and
   * last fixed row in the bottom overlay.
   *
   * @returns {number}
   */
  countNotHiddenFixedRowsBottom() {
    const countRows = this.hot.countRows();
    const visualFixedRowsBottom = Math.max(countRows - parseInt(this.settings.fixedRowsBottom, 10), 0);
    return this.countNotHiddenRowIndexes(visualFixedRowsBottom, 1);
  }

  /**
   * The function returns the number of renderable column indexes within the passed range of the visual indexes.
   *
   * @param {number} columnStart The column visual start index.
   * @param {number} columnEnd The column visual end index.
   * @returns {number}
   */
  countRenderableColumnsInRange(columnStart, columnEnd) {
    let count = 0;
    for (let column = columnStart; column <= columnEnd; column++) {
      if (this.hot.columnIndexMapper.getRenderableFromVisualIndex(column) !== null) {
        count += 1;
      }
    }
    return count;
  }

  /**
   * The function returns the number of renderable row indexes within the passed range of the visual indexes.
   *
   * @param {number} rowStart The row visual start index.
   * @param {number} rowEnd The row visual end index.
   * @returns {number}
   */
  countRenderableRowsInRange(rowStart, rowEnd) {
    let count = 0;
    for (let row = rowStart; row <= rowEnd; row++) {
      if (this.hot.rowIndexMapper.getRenderableFromVisualIndex(row) !== null) {
        count += 1;
      }
    }
    return count;
  }

  /**
   * Checks if at least one cell than belongs to the main table is not covered by the top, left or
   * bottom overlay.
   *
   * @returns {boolean}
   */
  isMainTableNotFullyCoveredByOverlays() {
    const fixedAllRows = this.countNotHiddenFixedRowsTop() + this.countNotHiddenFixedRowsBottom();
    const fixedAllColumns = this.countNotHiddenFixedColumnsStart();
    return this.hot.countRenderedRows() > fixedAllRows && this.hot.countRenderedCols() > fixedAllColumns;
  }

  /**
   * Defines default configuration and initializes WalkOnTable instance.
   *
   * @private
   */
  initializeWalkontable() {
    const walkontableConfig = {
      ariaTags: this.settings.ariaTags,
      rtlMode: this.hot.isRtl(),
      externalRowCalculator: this.hot.getPlugin('autoRowSize') && this.hot.getPlugin('autoRowSize').isEnabled(),
      table: _classPrivateFieldGet(_table, this),
      isDataViewInstance: () => (0, _rootInstance.isRootInstance)(this.hot),
      preventOverflow: () => this.settings.preventOverflow,
      preventWheel: () => this.settings.preventWheel,
      stretchH: () => this.settings.stretchH,
      data: (renderableRow, renderableColumn) => {
        return this.hot.getDataAtCell(...this.translateFromRenderableToVisualIndex(renderableRow, renderableColumn));
      },
      totalRows: () => this.countRenderableRows(),
      totalColumns: () => this.countRenderableColumns(),
      // Number of renderable columns for the left overlay.
      fixedColumnsStart: () => this.countNotHiddenFixedColumnsStart(),
      // Number of renderable rows for the top overlay.
      fixedRowsTop: () => this.countNotHiddenFixedRowsTop(),
      // Number of renderable rows for the bottom overlay.
      fixedRowsBottom: () => this.countNotHiddenFixedRowsBottom(),
      // Enable the inline start overlay when conditions are met.
      shouldRenderInlineStartOverlay: () => {
        return this.settings.fixedColumnsStart > 0 || walkontableConfig.rowHeaders().length > 0;
      },
      // Enable the top overlay when conditions are met.
      shouldRenderTopOverlay: () => {
        return this.settings.fixedRowsTop > 0 || walkontableConfig.columnHeaders().length > 0;
      },
      // Enable the bottom overlay when conditions are met.
      shouldRenderBottomOverlay: () => {
        return this.settings.fixedRowsBottom > 0;
      },
      minSpareRows: () => this.settings.minSpareRows,
      renderAllRows: this.settings.renderAllRows,
      renderAllColumns: this.settings.renderAllColumns,
      rowHeaders: () => {
        const headerRenderers = [];
        if (this.hot.hasRowHeaders()) {
          headerRenderers.push((renderableRowIndex, TH) => {
            // TODO: Some helper may be needed.
            // We perform translation for row indexes (without row headers).
            const visualRowIndex = renderableRowIndex >= 0 ? this.hot.rowIndexMapper.getVisualFromRenderableIndex(renderableRowIndex) : renderableRowIndex;
            this.appendRowHeader(visualRowIndex, TH);
          });
        }
        this.hot.runHooks('afterGetRowHeaderRenderers', headerRenderers);
        _classPrivateFieldSet(_rowHeadersCount, this, headerRenderers.length);
        if (this.hot.getSettings().ariaTags) {
          // Update the aria-colcount attribute.
          // Only needs to be done once after initialization/data update.
          if (_assertClassBrand(_TableView_brand, this, _getAriaColcount).call(this) === this.hot.countCols()) {
            _assertClassBrand(_TableView_brand, this, _updateAriaColcount).call(this, _classPrivateFieldGet(_rowHeadersCount, this));
          }
        }
        return headerRenderers;
      },
      columnHeaders: () => {
        const headerRenderers = [];
        if (this.hot.hasColHeaders()) {
          headerRenderers.push((renderedColumnIndex, TH) => {
            // TODO: Some helper may be needed.
            // We perform translation for columns indexes (without column headers).
            const visualColumnsIndex = renderedColumnIndex >= 0 ? this.hot.columnIndexMapper.getVisualFromRenderableIndex(renderedColumnIndex) : renderedColumnIndex;
            this.appendColHeader(visualColumnsIndex, TH);
          });
        }
        this.hot.runHooks('afterGetColumnHeaderRenderers', headerRenderers);
        _classPrivateFieldSet(_columnHeadersCount, this, headerRenderers.length);
        return headerRenderers;
      },
      columnWidth: renderedColumnIndex => {
        const visualIndex = this.hot.columnIndexMapper.getVisualFromRenderableIndex(renderedColumnIndex);

        // It's not a bug that we can't find visual index for some handled by method indexes. The function is called also
        // for indexes that are not displayed (indexes that are beyond the grid's boundaries), i.e. when `fixedColumnsStart` > `startCols` (wrong config?) or
        // scrolling and dataset is empty (scroll should handle that?).
        return this.hot.getColWidth(visualIndex === null ? renderedColumnIndex : visualIndex);
      },
      rowHeight: renderedRowIndex => {
        const visualIndex = this.hot.rowIndexMapper.getVisualFromRenderableIndex(renderedRowIndex);
        return this.hot.getRowHeight(visualIndex === null ? renderedRowIndex : visualIndex);
      },
      rowHeightByOverlayName: (renderedRowIndex, overlayType) => {
        const visualIndex = this.hot.rowIndexMapper.getVisualFromRenderableIndex(renderedRowIndex);
        const visualRowIndex = visualIndex === null ? renderedRowIndex : visualIndex;
        return this.hot.runHooks('modifyRowHeightByOverlayName', this.hot.getRowHeight(visualRowIndex), visualRowIndex, overlayType);
      },
      cellRenderer: (renderedRowIndex, renderedColumnIndex, TD) => {
        const [visualRowIndex, visualColumnIndex] = this.translateFromRenderableToVisualIndex(renderedRowIndex, renderedColumnIndex);

        // Coords may be modified. For example, by the `MergeCells` plugin. It should affect cell value and cell meta.
        const modifiedCellCoords = this.hot.runHooks('modifyGetCellCoords', visualRowIndex, visualColumnIndex);
        let visualRowToCheck = visualRowIndex;
        let visualColumnToCheck = visualColumnIndex;
        if (Array.isArray(modifiedCellCoords)) {
          [visualRowToCheck, visualColumnToCheck] = modifiedCellCoords;
        }
        const cellProperties = this.hot.getCellMeta(visualRowToCheck, visualColumnToCheck);
        const prop = this.hot.colToProp(visualColumnToCheck);
        let value = this.hot.getDataAtRowProp(visualRowToCheck, prop);
        if (this.hot.hasHook('beforeValueRender')) {
          value = this.hot.runHooks('beforeValueRender', value, cellProperties);
        }
        this.hot.runHooks('beforeRenderer', TD, visualRowIndex, visualColumnIndex, prop, value, cellProperties);
        this.hot.getCellRenderer(cellProperties)(this.hot, TD, visualRowIndex, visualColumnIndex, prop, value, cellProperties);
        this.hot.runHooks('afterRenderer', TD, visualRowIndex, visualColumnIndex, prop, value, cellProperties);
      },
      selections: this.hot.selection.highlight,
      hideBorderOnMouseDownOver: () => this.settings.fragmentSelection,
      onWindowResize: () => {
        if (this.hot && !this.hot.isDestroyed) {
          this.hot.refreshDimensions();
        }
      },
      onContainerElementResize: () => {
        if (this.hot && !this.hot.isDestroyed && (0, _element.isVisible)(this.hot.rootElement)) {
          this.hot.refreshDimensions();
        }
      },
      onCellMouseDown: (event, coords, TD, wt) => {
        const visualCoords = this.translateFromRenderableToVisualCoords(coords);
        const controller = {
          row: false,
          column: false,
          cell: false
        };
        this.hot.listen();
        this.activeWt = wt;
        _classPrivateFieldSet(_mouseDown, this, true);
        this.hot.runHooks('beforeOnCellMouseDown', event, visualCoords, TD, controller);
        if ((0, _event.isImmediatePropagationStopped)(event)) {
          return;
        }
        (0, _mouseEventHandler.handleMouseEvent)(event, {
          coords: visualCoords,
          selection: this.hot.selection,
          controller,
          cellCoordsFactory: (row, column) => this.hot._createCellCoords(row, column)
        });
        this.hot.runHooks('afterOnCellMouseDown', event, visualCoords, TD);
        this.activeWt = this._wt;
      },
      onCellContextMenu: (event, coords, TD, wt) => {
        const visualCoords = this.translateFromRenderableToVisualCoords(coords);
        this.activeWt = wt;
        _classPrivateFieldSet(_mouseDown, this, false);
        if (this.hot.selection.isInProgress()) {
          this.hot.selection.finish();
        }
        this.hot.runHooks('beforeOnCellContextMenu', event, visualCoords, TD);
        if ((0, _event.isImmediatePropagationStopped)(event)) {
          return;
        }
        this.hot.runHooks('afterOnCellContextMenu', event, visualCoords, TD);
        this.activeWt = this._wt;
      },
      onCellMouseOut: (event, coords, TD, wt) => {
        const visualCoords = this.translateFromRenderableToVisualCoords(coords);
        this.activeWt = wt;
        this.hot.runHooks('beforeOnCellMouseOut', event, visualCoords, TD);
        if ((0, _event.isImmediatePropagationStopped)(event)) {
          return;
        }
        this.hot.runHooks('afterOnCellMouseOut', event, visualCoords, TD);
        this.activeWt = this._wt;
      },
      onCellMouseOver: (event, coords, TD, wt) => {
        const visualCoords = this.translateFromRenderableToVisualCoords(coords);
        const controller = {
          row: false,
          column: false,
          cell: false
        };
        this.activeWt = wt;
        this.hot.runHooks('beforeOnCellMouseOver', event, visualCoords, TD, controller);
        if ((0, _event.isImmediatePropagationStopped)(event)) {
          return;
        }
        if (_classPrivateFieldGet(_mouseDown, this)) {
          (0, _mouseEventHandler.handleMouseEvent)(event, {
            coords: visualCoords,
            selection: this.hot.selection,
            controller,
            cellCoordsFactory: (row, column) => this.hot._createCellCoords(row, column)
          });
        }
        this.hot.runHooks('afterOnCellMouseOver', event, visualCoords, TD);
        this.activeWt = this._wt;
      },
      onCellMouseUp: (event, coords, TD, wt) => {
        const visualCoords = this.translateFromRenderableToVisualCoords(coords);
        this.activeWt = wt;
        this.hot.runHooks('beforeOnCellMouseUp', event, visualCoords, TD);

        // TODO: The second condition check is a workaround. Callback corresponding the method `updateSettings`
        // disable plugin and enable it again. Disabling plugin closes the menu. Thus, calling the
        // `updateSettings` in a body of any callback executed right after some context-menu action
        // breaks the table (#7231).
        if ((0, _event.isImmediatePropagationStopped)(event) || this.hot.isDestroyed) {
          return;
        }
        this.hot.runHooks('afterOnCellMouseUp', event, visualCoords, TD);
        this.activeWt = this._wt;
      },
      onCellCornerMouseDown: event => {
        event.preventDefault();
        this.hot.runHooks('afterOnCellCornerMouseDown', event);
      },
      onCellCornerDblClick: event => {
        event.preventDefault();
        this.hot.runHooks('afterOnCellCornerDblClick', event);
      },
      beforeDraw: (force, skipRender) => this.beforeRender(force, skipRender),
      onDraw: force => this.afterRender(force),
      onBeforeViewportScrollVertically: renderableRow => {
        const rowMapper = this.hot.rowIndexMapper;
        const areColumnHeadersSelected = renderableRow < 0;
        let visualRow = renderableRow;
        if (!areColumnHeadersSelected) {
          visualRow = rowMapper.getVisualFromRenderableIndex(renderableRow);

          // for an empty data return index as is
          if (visualRow === null) {
            return renderableRow;
          }
        }
        visualRow = this.hot.runHooks('beforeViewportScrollVertically', visualRow);
        this.hot.runHooks('beforeViewportScroll');
        if (!areColumnHeadersSelected) {
          return rowMapper.getRenderableFromVisualIndex(visualRow);
        }
        return visualRow;
      },
      onBeforeViewportScrollHorizontally: renderableColumn => {
        const columnMapper = this.hot.columnIndexMapper;
        const areRowHeadersSelected = renderableColumn < 0;
        let visualColumn = renderableColumn;
        if (!areRowHeadersSelected) {
          visualColumn = columnMapper.getVisualFromRenderableIndex(renderableColumn);

          // for an empty data return index as is
          if (visualColumn === null) {
            return renderableColumn;
          }
        }
        visualColumn = this.hot.runHooks('beforeViewportScrollHorizontally', visualColumn);
        this.hot.runHooks('beforeViewportScroll');
        if (!areRowHeadersSelected) {
          return columnMapper.getRenderableFromVisualIndex(visualColumn);
        }
        return visualColumn;
      },
      onScrollVertically: () => {
        this.hot.runHooks('afterScrollVertically');
        this.hot.runHooks('afterScroll');
      },
      onScrollHorizontally: () => {
        this.hot.runHooks('afterScrollHorizontally');
        this.hot.runHooks('afterScroll');
      },
      onBeforeRemoveCellClassNames: () => this.hot.runHooks('beforeRemoveCellClassNames'),
      onBeforeHighlightingRowHeader: (renderableRow, headerLevel, highlightMeta) => {
        const rowMapper = this.hot.rowIndexMapper;
        const areColumnHeadersSelected = renderableRow < 0;
        let visualRow = renderableRow;
        if (!areColumnHeadersSelected) {
          visualRow = rowMapper.getVisualFromRenderableIndex(renderableRow);
        }
        const newVisualRow = this.hot.runHooks('beforeHighlightingRowHeader', visualRow, headerLevel, highlightMeta);
        if (!areColumnHeadersSelected) {
          return rowMapper.getRenderableFromVisualIndex(rowMapper.getNearestNotHiddenIndex(newVisualRow, 1));
        }
        return newVisualRow;
      },
      onBeforeHighlightingColumnHeader: (renderableColumn, headerLevel, highlightMeta) => {
        const columnMapper = this.hot.columnIndexMapper;
        const areRowHeadersSelected = renderableColumn < 0;
        let visualColumn = renderableColumn;
        if (!areRowHeadersSelected) {
          visualColumn = columnMapper.getVisualFromRenderableIndex(renderableColumn);
        }
        const newVisualColumn = this.hot.runHooks('beforeHighlightingColumnHeader', visualColumn, headerLevel, highlightMeta);
        if (!areRowHeadersSelected) {
          return columnMapper.getRenderableFromVisualIndex(columnMapper.getNearestNotHiddenIndex(newVisualColumn, 1));
        }
        return newVisualColumn;
      },
      onAfterDrawSelection: (currentRow, currentColumn, layerLevel) => {
        let cornersOfSelection;
        const [visualRowIndex, visualColumnIndex] = this.translateFromRenderableToVisualIndex(currentRow, currentColumn);
        const selectedRange = this.hot.selection.getSelectedRange();
        const selectionRangeSize = selectedRange.size();
        if (selectionRangeSize > 0) {
          const selectionForLayer = selectedRange.peekByIndex(layerLevel !== null && layerLevel !== void 0 ? layerLevel : 0);
          cornersOfSelection = [selectionForLayer.from.row, selectionForLayer.from.col, selectionForLayer.to.row, selectionForLayer.to.col];
        }
        return this.hot.runHooks('afterDrawSelection', visualRowIndex, visualColumnIndex, cornersOfSelection, layerLevel);
      },
      onBeforeDrawBorders: (corners, borderClassName) => {
        const [startRenderableRow, startRenderableColumn, endRenderableRow, endRenderableColumn] = corners;
        const visualCorners = [this.hot.rowIndexMapper.getVisualFromRenderableIndex(startRenderableRow), this.hot.columnIndexMapper.getVisualFromRenderableIndex(startRenderableColumn), this.hot.rowIndexMapper.getVisualFromRenderableIndex(endRenderableRow), this.hot.columnIndexMapper.getVisualFromRenderableIndex(endRenderableColumn)];
        return this.hot.runHooks('beforeDrawBorders', visualCorners, borderClassName);
      },
      onBeforeTouchScroll: () => this.hot.runHooks('beforeTouchScroll'),
      onAfterMomentumScroll: () => this.hot.runHooks('afterMomentumScroll'),
      onBeforeStretchingColumnWidth: (stretchedWidth, renderedColumnIndex) => {
        const visualColumnIndex = this.hot.columnIndexMapper.getVisualFromRenderableIndex(renderedColumnIndex);
        return this.hot.runHooks('beforeStretchingColumnWidth', stretchedWidth, visualColumnIndex);
      },
      onModifyRowHeaderWidth: rowHeaderWidth => this.hot.runHooks('modifyRowHeaderWidth', rowHeaderWidth),
      onModifyGetCellCoords: (renderableRowIndex, renderableColumnIndex, topmost) => {
        const rowMapper = this.hot.rowIndexMapper;
        const columnMapper = this.hot.columnIndexMapper;

        // Callback handle also headers. We shouldn't translate them.
        const visualColumnIndex = renderableColumnIndex >= 0 ? columnMapper.getVisualFromRenderableIndex(renderableColumnIndex) : renderableColumnIndex;
        const visualRowIndex = renderableRowIndex >= 0 ? rowMapper.getVisualFromRenderableIndex(renderableRowIndex) : renderableRowIndex;
        const visualIndexes = this.hot.runHooks('modifyGetCellCoords', visualRowIndex, visualColumnIndex, topmost);
        if (Array.isArray(visualIndexes)) {
          const [visualRowFrom, visualColumnFrom, visualRowTo, visualColumnTo] = visualIndexes;

          // Result of the hook is handled by the Walkontable (renderable indexes).
          return [visualRowFrom >= 0 ? rowMapper.getRenderableFromVisualIndex(rowMapper.getNearestNotHiddenIndex(visualRowFrom, 1)) : visualRowFrom, visualColumnFrom >= 0 ? columnMapper.getRenderableFromVisualIndex(columnMapper.getNearestNotHiddenIndex(visualColumnFrom, 1)) : visualColumnFrom, visualRowTo >= 0 ? rowMapper.getRenderableFromVisualIndex(rowMapper.getNearestNotHiddenIndex(visualRowTo, -1)) : visualRowTo, visualColumnTo >= 0 ? columnMapper.getRenderableFromVisualIndex(columnMapper.getNearestNotHiddenIndex(visualColumnTo, -1)) : visualColumnTo];
        }
      },
      viewportRowCalculatorOverride: calc => {
        let viewportOffset = this.settings.viewportRowRenderingOffset;
        if (viewportOffset === 'auto' && this.settings.fixedRowsTop) {
          viewportOffset = 10;
        }
        if (viewportOffset > 0 || viewportOffset === 'auto') {
          const renderableRows = this.countRenderableRows();
          const firstRenderedRow = calc.startRow;
          const lastRenderedRow = calc.endRow;
          if (typeof viewportOffset === 'number') {
            calc.startRow = Math.max(firstRenderedRow - viewportOffset, 0);
            calc.endRow = Math.min(lastRenderedRow + viewportOffset, renderableRows - 1);
          } else if (viewportOffset === 'auto') {
            const offset = Math.ceil(lastRenderedRow / renderableRows * 12);
            calc.startRow = Math.max(firstRenderedRow - offset, 0);
            calc.endRow = Math.min(lastRenderedRow + offset, renderableRows - 1);
          }
        }
        this.hot.runHooks('afterViewportRowCalculatorOverride', calc);
      },
      viewportColumnCalculatorOverride: calc => {
        let viewportOffset = this.settings.viewportColumnRenderingOffset;
        if (viewportOffset === 'auto' && this.settings.fixedColumnsStart) {
          viewportOffset = 10;
        }
        if (viewportOffset > 0 || viewportOffset === 'auto') {
          const renderableColumns = this.countRenderableColumns();
          const firstRenderedColumn = calc.startColumn;
          const lastRenderedColumn = calc.endColumn;
          if (typeof viewportOffset === 'number') {
            calc.startColumn = Math.max(firstRenderedColumn - viewportOffset, 0);
            calc.endColumn = Math.min(lastRenderedColumn + viewportOffset, renderableColumns - 1);
          }
          if (viewportOffset === 'auto') {
            const offset = Math.ceil(lastRenderedColumn / renderableColumns * 6);
            calc.startColumn = Math.max(firstRenderedColumn - offset, 0);
            calc.endColumn = Math.min(lastRenderedColumn + offset, renderableColumns - 1);
          }
        }
        this.hot.runHooks('afterViewportColumnCalculatorOverride', calc);
      },
      rowHeaderWidth: () => this.settings.rowHeaderWidth,
      columnHeaderHeight: () => {
        const columnHeaderHeight = this.hot.runHooks('modifyColumnHeaderHeight');
        return this.settings.columnHeaderHeight || columnHeaderHeight;
      }
    };
    this.hot.runHooks('beforeInitWalkontable', walkontableConfig);
    this._wt = new _src.default(walkontableConfig);
    this.activeWt = this._wt;
    const spreader = this._wt.wtTable.spreader;
    // We have to cache width and height after Walkontable initialization.
    const {
      width,
      height
    } = this.hot.rootElement.getBoundingClientRect();
    this.setLastSize(width, height);
    this.eventManager.addEventListener(spreader, 'mousedown', event => {
      // right mouse button exactly on spreader means right click on the right hand side of vertical scrollbar
      if (event.target === spreader && event.which === 3) {
        event.stopPropagation();
      }
    });
    this.eventManager.addEventListener(spreader, 'contextmenu', event => {
      // right mouse button exactly on spreader means right click on the right hand side of vertical scrollbar
      if (event.target === spreader && event.which === 3) {
        event.stopPropagation();
      }
    });
    this.eventManager.addEventListener(this.hot.rootDocument.documentElement, 'click', () => {
      if (this.settings.observeDOMVisibility) {
        if (this._wt.drawInterrupted) {
          this.hot.forceFullRender = true;
          this.render();
        }
      }
    });
  }

  /**
   * Checks if it's possible to create text selection in element.
   *
   * @private
   * @param {HTMLElement} el The element to check.
   * @returns {boolean}
   */
  isTextSelectionAllowed(el) {
    if ((0, _element.isInput)(el)) {
      return true;
    }
    const isChildOfTableBody = (0, _element.isChildOf)(el, this._wt.wtTable.spreader);
    if (this.settings.fragmentSelection === true && isChildOfTableBody) {
      return true;
    }
    if (this.settings.fragmentSelection === 'cell' && this.isSelectedOnlyCell() && isChildOfTableBody) {
      return true;
    }
    if (!this.settings.fragmentSelection && this.isCellEdited() && this.isSelectedOnlyCell()) {
      return true;
    }
    return false;
  }

  /**
   * Checks if user's been called mousedown.
   *
   * @private
   * @returns {boolean}
   */
  isMouseDown() {
    return _classPrivateFieldGet(_mouseDown, this);
  }

  /**
   * Check if selected only one cell.
   *
   * @private
   * @returns {boolean}
   */
  isSelectedOnlyCell() {
    var _this$hot$getSelected, _this$hot$getSelected2;
    return (_this$hot$getSelected = (_this$hot$getSelected2 = this.hot.getSelectedRangeLast()) === null || _this$hot$getSelected2 === void 0 ? void 0 : _this$hot$getSelected2.isSingleCell()) !== null && _this$hot$getSelected !== void 0 ? _this$hot$getSelected : false;
  }

  /**
   * Checks if active cell is editing.
   *
   * @private
   * @returns {boolean}
   */
  isCellEdited() {
    const activeEditor = this.hot.getActiveEditor();
    return activeEditor && activeEditor.isOpened();
  }

  /**
   * `beforeDraw` callback.
   *
   * @private
   * @param {boolean} force If `true` rendering was triggered by a change of settings or data or `false` if
   *                        rendering was triggered by scrolling or moving selection.
   * @param {object} skipRender Object with `skipRender` property, if it is set to `true ` the next rendering
   *                            cycle will be skipped.
   */
  beforeRender(force, skipRender) {
    if (force) {
      // this.hot.forceFullRender = did Handsontable request full render?
      this.hot.runHooks('beforeViewRender', this.hot.forceFullRender, skipRender);
    }
  }

  /**
   * `afterRender` callback.
   *
   * @private
   * @param {boolean} force If `true` rendering was triggered by a change of settings or data or `false` if
   *                        rendering was triggered by scrolling or moving selection.
   */
  afterRender(force) {
    if (force) {
      // this.hot.forceFullRender = did Handsontable request full render?
      this.hot.runHooks('afterViewRender', this.hot.forceFullRender);
    }
  }

  /**
   * Append row header to a TH element.
   *
   * @private
   * @param {number} visualRowIndex The visual row index.
   * @param {HTMLTableHeaderCellElement} TH The table header element.
   */
  appendRowHeader(visualRowIndex, TH) {
    if (TH.firstChild) {
      const container = TH.firstChild;
      if (!(0, _element.hasClass)(container, 'relative')) {
        (0, _element.empty)(TH);
        this.appendRowHeader(visualRowIndex, TH);
        return;
      }
      this.updateCellHeader(container.querySelector('.rowHeader'), visualRowIndex, this.hot.getRowHeader);
    } else {
      const {
        rootDocument,
        getRowHeader
      } = this.hot;
      const div = rootDocument.createElement('div');
      const span = rootDocument.createElement('span');
      div.className = 'relative';
      span.className = 'rowHeader';
      this.updateCellHeader(span, visualRowIndex, getRowHeader);
      div.appendChild(span);
      TH.appendChild(div);
    }
    this.hot.runHooks('afterGetRowHeader', visualRowIndex, TH);
  }

  /**
   * Append column header to a TH element.
   *
   * @private
   * @param {number} visualColumnIndex Visual column index.
   * @param {HTMLTableCellElement} TH The table header element.
   * @param {Function} [label] The function that returns the header label.
   * @param {number} [headerLevel=0] The index of header level counting from the top (positive
   *                                 values counting from 0 to N).
   */
  appendColHeader(visualColumnIndex, TH) {
    let label = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : this.hot.getColHeader;
    let headerLevel = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 0;
    const getColumnHeaderClassNames = () => {
      const metaHeaderClassNames = visualColumnIndex >= 0 ? this.hot.getColumnMeta(visualColumnIndex).headerClassName : null;
      return metaHeaderClassNames ? metaHeaderClassNames.split(' ') : [];
    };
    if (TH.firstChild) {
      const container = TH.firstChild;
      if ((0, _element.hasClass)(container, 'relative')) {
        this.updateCellHeader(container.querySelector('.colHeader'), visualColumnIndex, label, headerLevel);
        container.className = '';
        (0, _element.addClass)(container, ['relative', ...getColumnHeaderClassNames()]);
      } else {
        (0, _element.empty)(TH);
        this.appendColHeader(visualColumnIndex, TH, label, headerLevel);
      }
    } else {
      const {
        rootDocument
      } = this.hot;
      const div = rootDocument.createElement('div');
      const span = rootDocument.createElement('span');
      const classNames = getColumnHeaderClassNames();
      div.classList.add('relative', ...classNames);
      span.className = 'colHeader';
      if (this.settings.ariaTags) {
        (0, _element.setAttribute)(div, ...(0, _a11y.A11Y_PRESENTATION)());
        (0, _element.setAttribute)(span, ...(0, _a11y.A11Y_PRESENTATION)());
      }
      this.updateCellHeader(span, visualColumnIndex, label, headerLevel);
      div.appendChild(span);
      TH.appendChild(div);
    }
    this.hot.runHooks('afterGetColHeader', visualColumnIndex, TH, headerLevel);
  }

  /**
   * Updates header cell content.
   *
   * @private
   * @param {HTMLElement} element Element to update.
   * @param {number} index Row index or column index.
   * @param {Function} content Function which should be returns content for this cell.
   * @param {number} [headerLevel=0] The index of header level counting from the top (positive
   *                                 values counting from 0 to N).
   */
  updateCellHeader(element, index, content) {
    let headerLevel = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 0;
    let renderedIndex = index;
    const parentOverlay = this._wt.wtOverlays.getParentOverlay(element) || this._wt;

    // prevent wrong calculations from SampleGenerator
    if (element.parentNode) {
      if ((0, _element.hasClass)(element, 'colHeader')) {
        renderedIndex = parentOverlay.wtTable.columnFilter.sourceToRendered(index);
      } else if ((0, _element.hasClass)(element, 'rowHeader')) {
        renderedIndex = parentOverlay.wtTable.rowFilter.sourceToRendered(index);
      }
    }
    if (renderedIndex > -1) {
      (0, _element.fastInnerHTML)(element, content(index, headerLevel));
    } else {
      // workaround for https://github.com/handsontable/handsontable/issues/1946
      (0, _element.fastInnerText)(element, String.fromCharCode(160));
      (0, _element.addClass)(element, 'cornerHeader');
    }
  }

  /**
   * Given a element's left (or right in RTL mode) position relative to the viewport, returns maximum
   * element width until the right (or left) edge of the viewport (before scrollbar).
   *
   * @private
   * @param {number} inlineOffset The left (or right in RTL mode) offset.
   * @returns {number}
   */
  maximumVisibleElementWidth(inlineOffset) {
    const workspaceWidth = this._wt.wtViewport.getWorkspaceWidth();
    const maxWidth = workspaceWidth - inlineOffset;
    return maxWidth > 0 ? maxWidth : 0;
  }

  /**
   * Given a element's top position relative to the viewport, returns maximum element height until the bottom
   * edge of the viewport (before scrollbar).
   *
   * @private
   * @param {number} topOffset The top offset.
   * @returns {number}
   */
  maximumVisibleElementHeight(topOffset) {
    const workspaceHeight = this._wt.wtViewport.getWorkspaceHeight();
    const maxHeight = workspaceHeight - topOffset;
    return maxHeight > 0 ? maxHeight : 0;
  }

  /**
   * Sets new dimensions of the container.
   *
   * @param {number} width The table width.
   * @param {number} height The table height.
   */
  setLastSize(width, height) {
    _classPrivateFieldSet(_lastWidth, this, width);
    _classPrivateFieldSet(_lastHeight, this, height);
  }

  /**
   * Returns cached dimensions.
   *
   * @returns {object}
   */
  getLastSize() {
    return {
      width: _classPrivateFieldGet(_lastWidth, this),
      height: _classPrivateFieldGet(_lastHeight, this)
    };
  }

  /**
   * Returns the first rendered row in the DOM (usually is not visible in the table's viewport).
   *
   * @returns {number | null}
   */
  getFirstRenderedVisibleRow() {
    if (!this._wt.wtViewport.rowsRenderCalculator) {
      return null;
    }
    return this.hot.rowIndexMapper.getNearestNotHiddenIndex(this._wt.wtTable.getFirstRenderedRow(), 1);
  }

  /**
   * Returns the last rendered row in the DOM (usually is not visible in the table's viewport).
   *
   * @returns {number | null}
   */
  getLastRenderedVisibleRow() {
    if (!this._wt.wtViewport.rowsRenderCalculator) {
      return null;
    }
    return this.hot.rowIndexMapper.getNearestNotHiddenIndex(this._wt.wtTable.getLastRenderedRow(), -1);
  }

  /**
   * Returns the first rendered column in the DOM (usually is not visible in the table's viewport).
   *
   * @returns {number | null}
   */
  getFirstRenderedVisibleColumn() {
    if (!this._wt.wtViewport.columnsRenderCalculator) {
      return null;
    }
    return this.hot.columnIndexMapper.getNearestNotHiddenIndex(this._wt.wtTable.getFirstRenderedColumn(), 1);
  }

  /**
   * Returns the last rendered column in the DOM (usually is not visible in the table's viewport).
   *
   * @returns {number | null}
   */
  getLastRenderedVisibleColumn() {
    if (!this._wt.wtViewport.columnsRenderCalculator) {
      return null;
    }
    return this.hot.columnIndexMapper.getNearestNotHiddenIndex(this._wt.wtTable.getLastRenderedColumn(), -1);
  }

  /**
   * Returns the first fully visible row in the table viewport. When the table has overlays the method returns
   * the first row of the master table that is not overlapped by overlay.
   *
   * @returns {number}
   */
  getFirstFullyVisibleRow() {
    return this.hot.rowIndexMapper.getVisualFromRenderableIndex(this._wt.wtScroll.getFirstVisibleRow());
  }

  /**
   * Returns the last fully visible row in the table viewport. When the table has overlays the method returns
   * the first row of the master table that is not overlapped by overlay.
   *
   * @returns {number}
   */
  getLastFullyVisibleRow() {
    return this.hot.rowIndexMapper.getVisualFromRenderableIndex(this._wt.wtScroll.getLastVisibleRow());
  }

  /**
   * Returns the first fully visible column in the table viewport. When the table has overlays the method returns
   * the first row of the master table that is not overlapped by overlay.
   *
   * @returns {number}
   */
  getFirstFullyVisibleColumn() {
    return this.hot.columnIndexMapper.getVisualFromRenderableIndex(this._wt.wtScroll.getFirstVisibleColumn());
  }

  /**
   * Returns the last fully visible column in the table viewport. When the table has overlays the method returns
   * the first row of the master table that is not overlapped by overlay.
   *
   * @returns {number}
   */
  getLastFullyVisibleColumn() {
    return this.hot.columnIndexMapper.getVisualFromRenderableIndex(this._wt.wtScroll.getLastVisibleColumn());
  }

  /**
   * Returns the first partially visible row in the table viewport. When the table has overlays the method returns
   * the first row of the master table that is not overlapped by overlay.
   *
   * @returns {number}
   */
  getFirstPartiallyVisibleRow() {
    return this.hot.rowIndexMapper.getVisualFromRenderableIndex(this._wt.wtScroll.getFirstPartiallyVisibleRow());
  }

  /**
   * Returns the last partially visible row in the table viewport. When the table has overlays the method returns
   * the first row of the master table that is not overlapped by overlay.
   *
   * @returns {number}
   */
  getLastPartiallyVisibleRow() {
    return this.hot.rowIndexMapper.getVisualFromRenderableIndex(this._wt.wtScroll.getLastPartiallyVisibleRow());
  }

  /**
   * Returns the first partially visible column in the table viewport. When the table has overlays the method returns
   * the first row of the master table that is not overlapped by overlay.
   *
   * @returns {number}
   */
  getFirstPartiallyVisibleColumn() {
    return this.hot.columnIndexMapper.getVisualFromRenderableIndex(this._wt.wtScroll.getFirstPartiallyVisibleColumn());
  }

  /**
   * Returns the last partially visible column in the table viewport. When the table has overlays the method returns
   * the first row of the master table that is not overlapped by overlay.
   *
   * @returns {number}
   */
  getLastPartiallyVisibleColumn() {
    return this.hot.columnIndexMapper.getVisualFromRenderableIndex(this._wt.wtScroll.getLastPartiallyVisibleColumn());
  }

  /**
   * Returns the total count of the rendered column headers.
   *
   * @returns {number}
   */
  getColumnHeadersCount() {
    return _classPrivateFieldGet(_columnHeadersCount, this);
  }

  /**
   * Returns the total count of the rendered row headers.
   *
   * @returns {number}
   */
  getRowHeadersCount() {
    return _classPrivateFieldGet(_rowHeadersCount, this);
  }

  /**
   * Returns the table's viewport width. When the table has defined the size of the container,
   * and the columns do not fill the entire viewport, the viewport width is equal to the sum of
   * the columns' widths.
   *
   * @returns {number}
   */
  getViewportWidth() {
    return this._wt.wtViewport.getViewportWidth();
  }

  /**
   * Returns the table's total width including the scrollbar width.
   *
   * @returns {number}
   */
  getWorkspaceWidth() {
    return this._wt.wtViewport.getWorkspaceWidth();
  }

  /**
   * Returns the table's viewport height. When the table has defined the size of the container,
   * and the rows do not fill the entire viewport, the viewport height is equal to the sum of
   * the rows' heights.
   *
   * @returns {number}
   */
  getViewportHeight() {
    return this._wt.wtViewport.getViewportHeight();
  }

  /**
   * Returns the table's total height including the scrollbar height.
   *
   * @returns {number}
   */
  getWorkspaceHeight() {
    return this._wt.wtViewport.getWorkspaceHeight();
  }

  /**
   * Checks to what overlay the provided element belongs.
   *
   * @param {HTMLElement} element The DOM element to check.
   * @returns {'master'|'inline_start'|'top'|'top_inline_start_corner'|'bottom'|'bottom_inline_start_corner'}
   */
  getElementOverlayName(element) {
    var _this$_wt$wtOverlays$;
    return ((_this$_wt$wtOverlays$ = this._wt.wtOverlays.getParentOverlay(element)) !== null && _this$_wt$wtOverlays$ !== void 0 ? _this$_wt$wtOverlays$ : this._wt).wtTable.name;
  }

  /**
   * Gets the overlay instance by its name.
   *
   * @param {'inline_start'|'top'|'top_inline_start_corner'|'bottom'|'bottom_inline_start_corner'} overlayName The overlay name.
   * @returns {Overlay | null}
   */
  getOverlayByName(overlayName) {
    return this._wt.getOverlayByName(overlayName);
  }

  /**
   * Checks if the table is visible or not.
   *
   * @returns {boolean}
   */
  isVisible() {
    return this._wt.wtTable.isVisible();
  }
  /**
   * Destroys internal WalkOnTable's instance. Detaches all of the bonded listeners.
   *
   * @private
   */
  destroy() {
    this._wt.destroy();
    this.eventManager.destroy();
  }
}
function _getAriaColcount() {
  return parseInt(this.hot.rootElement.getAttribute((0, _a11y.A11Y_COLCOUNT)()[0]), 10);
}
/**
 * Update the `aria-colcount` attribute by the provided value.
 *
 * @param {number} delta The number of columns to add or remove to the aria tag.
 */
function _updateAriaColcount(delta) {
  const colCount = _assertClassBrand(_TableView_brand, this, _getAriaColcount).call(this) + delta;
  (0, _element.setAttribute)(this.hot.rootElement, ...(0, _a11y.A11Y_COLCOUNT)(colCount));
}
var _default = exports.default = TableView;