"use strict";

exports.__esModule = true;
require("core-js/modules/es.error.cause.js");
require("core-js/modules/es.array.push.js");
var _element = require("../../../helpers/dom/element");
var _function = require("../../../helpers/function");
var _column = _interopRequireDefault(require("./filter/column"));
var _row = _interopRequireDefault(require("./filter/row"));
var _renderer = require("./renderer");
var _column2 = _interopRequireDefault(require("./utils/column"));
var _row2 = _interopRequireDefault(require("./utils/row"));
var _overlay = require("./overlay");
var _a11y = require("../../../helpers/a11y");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
/**
 * @todo These mixes are never added to the class Table, however their members are used here.
 * @todo Continue: Potentially it works only, because some of these mixes are added to every inherited class.
 * @todo Refactoring, move code from `if(this.isMaster)` into MasterTable, and others like that.
 * @mixes stickyColumnsStart
 * @mixes stickyRowsBottom
 * @mixes stickyRowsTop
 * @mixes calculatedRows
 * @mixes calculatedColumns
 * @abstract
 */
class Table {
  /**
   *
   * @abstract
   * @param {TableDao} dataAccessObject The data access object.
   * @param {FacadeGetter} facadeGetter Function which return proper facade.
   * @param {DomBindings} domBindings Bindings into DOM.
   * @param {Settings} wtSettings The Walkontable settings.
   * @param {'master'|CLONE_TYPES_ENUM} name Overlay name.
   */
  constructor(dataAccessObject, facadeGetter, domBindings, wtSettings, name) {
    /**
     * The walkontable settings.
     *
     * @protected
     * @type {Settings}
     */
    _defineProperty(this, "wtSettings", null);
    _defineProperty(this, "domBindings", void 0);
    _defineProperty(this, "TBODY", null);
    _defineProperty(this, "THEAD", null);
    _defineProperty(this, "COLGROUP", null);
    /**
     * Indicates if the table has height bigger than 0px.
     *
     * @type {boolean}
     */
    _defineProperty(this, "hasTableHeight", true);
    /**
     * Indicates if the table has width bigger than 0px.
     *
     * @type {boolean}
     */
    _defineProperty(this, "hasTableWidth", true);
    /**
     * Indicates if the table is visible. By visible, it means that the holder
     * element has CSS 'display' property different than 'none'.
     *
     * @type {boolean}
     */
    _defineProperty(this, "isTableVisible", false);
    _defineProperty(this, "tableOffset", 0);
    _defineProperty(this, "holderOffset", 0);
    this.domBindings = domBindings;
    /**
     * Indicates if this instance is of type `MasterTable` (i.e. It is NOT an overlay).
     *
     * @type {boolean}
     */
    this.isMaster = name === 'master';
    this.name = name;
    this.dataAccessObject = dataAccessObject;
    this.facadeGetter = facadeGetter;
    this.wtSettings = wtSettings;

    // legacy support
    this.instance = this.dataAccessObject.wot; // TODO refactoring: it might be removed here, and provides legacy support through facade.
    this.wot = this.dataAccessObject.wot;
    this.TABLE = domBindings.rootTable;
    (0, _element.removeTextNodes)(this.TABLE);

    // TODO refactoring, to recognize the legitimacy of moving them into domBidings
    this.spreader = this.createSpreader(this.TABLE);
    this.hider = this.createHider(this.spreader);
    this.holder = this.createHolder(this.hider);
    this.wtRootElement = this.holder.parentNode;
    if (this.isMaster) {
      this.alignOverlaysWithTrimmingContainer(); // todo wow, It calls method from child class (MasterTable).
    }
    this.fixTableDomTree();
    this.rowFilter = null; // TODO refactoring, eliminate all (re)creations of this object, then updates state when needed.
    this.columnFilter = null; // TODO refactoring, eliminate all (re)creations of this object, then updates state when needed.
    this.correctHeaderWidth = false;
    const origRowHeaderWidth = this.wtSettings.getSettingPure('rowHeaderWidth');

    // Fix for jumping row headers (https://github.com/handsontable/handsontable/issues/3850)
    this.wtSettings.update('rowHeaderWidth', () => this._modifyRowHeaderWidth(origRowHeaderWidth));
    this.rowUtils = new _row2.default(this.dataAccessObject, this.wtSettings); // TODO refactoring, It can be passed through IOC.
    this.columnUtils = new _column2.default(this.dataAccessObject, this.wtSettings); // TODO refactoring, It can be passed through IOC.

    this.tableRenderer = new _renderer.Renderer({
      // TODO refactoring, It can be passed through IOC.
      TABLE: this.TABLE,
      THEAD: this.THEAD,
      COLGROUP: this.COLGROUP,
      TBODY: this.TBODY,
      rowUtils: this.rowUtils,
      columnUtils: this.columnUtils,
      cellRenderer: this.wtSettings.getSettingPure('cellRenderer')
    });
  }

  /**
   * Returns a boolean that is true if this Table represents a specific overlay, identified by the overlay name.
   * For MasterTable, it returns false.
   *
   * @param {string} overlayTypeName The overlay type.
   * @returns {boolean}
   */
  is(overlayTypeName) {
    // todo refactoring: eliminate all protected and private usages
    return this.name === overlayTypeName;
  }

  /**
   *
   */
  fixTableDomTree() {
    const rootDocument = this.domBindings.rootDocument;
    this.TBODY = this.TABLE.querySelector('tbody');
    if (!this.TBODY) {
      this.TBODY = rootDocument.createElement('tbody');
      this.TABLE.appendChild(this.TBODY);
    }
    this.THEAD = this.TABLE.querySelector('thead');
    if (!this.THEAD) {
      this.THEAD = rootDocument.createElement('thead');
      this.TABLE.insertBefore(this.THEAD, this.TBODY);
    }
    this.COLGROUP = this.TABLE.querySelector('colgroup');
    if (!this.COLGROUP) {
      this.COLGROUP = rootDocument.createElement('colgroup');
      this.TABLE.insertBefore(this.COLGROUP, this.THEAD);
    }
  }

  /**
   * @param {HTMLTableElement} table An element to process.
   * @returns {HTMLElement}
   */
  createSpreader(table) {
    const parent = table.parentNode;
    let spreader;
    if (!parent || parent.nodeType !== Node.ELEMENT_NODE || !(0, _element.hasClass)(parent, 'wtHolder')) {
      spreader = this.domBindings.rootDocument.createElement('div');
      spreader.className = 'wtSpreader';
      if (parent) {
        // if TABLE is detached (e.g. in Jasmine test), it has no parentNode so we cannot attach holder to it
        parent.insertBefore(spreader, table);
      }
      spreader.appendChild(table);
    }
    spreader.style.position = 'relative';
    if (this.wtSettings.getSetting('ariaTags')) {
      (0, _element.setAttribute)(spreader, [(0, _a11y.A11Y_PRESENTATION)()]);
    }
    return spreader;
  }

  /**
   * @param {HTMLElement} spreader An element to the hider element is injected.
   * @returns {HTMLElement}
   */
  createHider(spreader) {
    const parent = spreader.parentNode;
    let hider;
    if (!parent || parent.nodeType !== Node.ELEMENT_NODE || !(0, _element.hasClass)(parent, 'wtHolder')) {
      hider = this.domBindings.rootDocument.createElement('div');
      hider.className = 'wtHider';
      if (parent) {
        // if TABLE is detached (e.g. in Jasmine test), it has no parentNode so we cannot attach holder to it
        parent.insertBefore(hider, spreader);
      }
      hider.appendChild(spreader);
    }
    if (this.wtSettings.getSetting('ariaTags')) {
      (0, _element.setAttribute)(hider, [(0, _a11y.A11Y_PRESENTATION)()]);
    }
    return hider;
  }

  /**
   *
   * @param {HTMLElement} hider An element to the holder element is injected.
   * @returns {HTMLElement}
   */
  createHolder(hider) {
    const parent = hider.parentNode;
    let holder;
    if (!parent || parent.nodeType !== Node.ELEMENT_NODE || !(0, _element.hasClass)(parent, 'wtHolder')) {
      holder = this.domBindings.rootDocument.createElement('div');
      holder.style.position = 'relative';
      holder.className = 'wtHolder';
      if (parent) {
        // if TABLE is detached (e.g. in Jasmine test), it has no parentNode so we cannot attach holder to it
        parent.insertBefore(holder, hider);
      }
      if (this.isMaster) {
        holder.parentNode.className += 'ht_master handsontable';
        holder.parentNode.setAttribute('dir', this.wtSettings.getSettingPure('rtlMode') ? 'rtl' : 'ltr');
        if (this.wtSettings.getSetting('ariaTags')) {
          (0, _element.setAttribute)(holder.parentNode, [(0, _a11y.A11Y_PRESENTATION)()]);
        }
      }
      holder.appendChild(hider);
    }
    if (this.wtSettings.getSetting('ariaTags')) {
      (0, _element.setAttribute)(holder, [(0, _a11y.A11Y_PRESENTATION)()]);
    }
    return holder;
  }

  /**
   * Redraws the table.
   *
   * @param {boolean} [fastDraw=false] If TRUE, will try to avoid full redraw and only update the border positions.
   *                                   If FALSE or UNDEFINED, will perform a full redraw.
   * @returns {Table}
   */
  draw() {
    let fastDraw = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;
    const {
      wtSettings
    } = this;
    const {
      wtOverlays,
      wtViewport
    } = this.dataAccessObject;
    const totalRows = wtSettings.getSetting('totalRows');
    const totalColumns = wtSettings.getSetting('totalColumns');
    const rowHeaders = wtSettings.getSetting('rowHeaders');
    const rowHeadersCount = rowHeaders.length;
    const columnHeaders = wtSettings.getSetting('columnHeaders');
    const columnHeadersCount = columnHeaders.length;
    let runFastDraw = fastDraw;
    if (this.isMaster) {
      wtOverlays.beforeDraw();
      this.holderOffset = (0, _element.offset)(this.holder);
      runFastDraw = wtViewport.createCalculators(runFastDraw);
      if (rowHeadersCount && !wtSettings.getSetting('fixedColumnsStart')) {
        const leftScrollPos = wtOverlays.inlineStartOverlay.getScrollPosition();
        const previousState = this.correctHeaderWidth;
        this.correctHeaderWidth = leftScrollPos !== 0;
        if (previousState !== this.correctHeaderWidth) {
          runFastDraw = false;
        }
      }
    }
    if (runFastDraw) {
      if (this.isMaster) {
        wtOverlays.refresh(true);
      }
    } else {
      if (this.isMaster) {
        this.tableOffset = (0, _element.offset)(this.TABLE);
      } else {
        this.tableOffset = this.dataAccessObject.parentTableOffset;
      }
      const startRow = totalRows > 0 ? this.getFirstRenderedRow() : 0;
      const startColumn = totalColumns > 0 ? this.getFirstRenderedColumn() : 0;
      this.rowFilter = new _row.default(startRow, totalRows, columnHeadersCount);
      this.columnFilter = new _column.default(startColumn, totalColumns, rowHeadersCount);
      let performRedraw = true;

      // Only master table rendering can be skipped
      if (this.isMaster) {
        this.alignOverlaysWithTrimmingContainer(); // todo It calls method from child class (MasterTable).
        const skipRender = {};
        this.wtSettings.getSetting('beforeDraw', true, skipRender);
        performRedraw = skipRender.skipRender !== true;
      }
      if (performRedraw) {
        this.tableRenderer.setHeaderContentRenderers(rowHeaders, columnHeaders);
        if (this.is(_overlay.CLONE_BOTTOM) || this.is(_overlay.CLONE_BOTTOM_INLINE_START_CORNER)) {
          // do NOT render headers on the bottom or bottom-left corner overlay
          this.tableRenderer.setHeaderContentRenderers(rowHeaders, []);
        }
        this.resetOversizedRows();
        this.tableRenderer.setActiveOverlayName(this.name).setViewportSize(this.getRenderedRowsCount(), this.getRenderedColumnsCount()).setFilters(this.rowFilter, this.columnFilter).render();
        let workspaceWidth;
        if (this.isMaster) {
          workspaceWidth = this.dataAccessObject.workspaceWidth;
          wtViewport.containerWidth = null;
          this.markOversizedColumnHeaders();
        }
        this.adjustColumnHeaderHeights();
        if (this.isMaster || this.is(_overlay.CLONE_BOTTOM)) {
          this.markOversizedRows();
        }
        if (this.isMaster) {
          if (!this.wtSettings.getSetting('externalRowCalculator')) {
            wtViewport.createVisibleCalculators();
          }
          wtOverlays.refresh(false);
          wtOverlays.applyToDOM();
          const hiderWidth = (0, _element.outerWidth)(this.hider);
          const tableWidth = (0, _element.outerWidth)(this.TABLE);
          if (hiderWidth !== 0 && tableWidth !== hiderWidth) {
            // Recalculate the column widths, if width changes made in the overlays removed the scrollbar, thus changing the viewport width.
            this.columnUtils.calculateWidths();
            this.tableRenderer.renderer.colGroup.render();
          }
          if (workspaceWidth !== wtViewport.getWorkspaceWidth()) {
            // workspace width changed though to shown/hidden vertical scrollbar. Let's reapply stretching
            wtViewport.containerWidth = null;
            this.columnUtils.calculateWidths();
            this.tableRenderer.renderer.colGroup.render();
          }
          this.wtSettings.getSetting('onDraw', true);
        } else if (this.is(_overlay.CLONE_BOTTOM)) {
          this.dataAccessObject.cloneSource.wtOverlays.adjustElementsSize();
        }
      }
    }
    let positionChanged = false;
    if (this.isMaster) {
      positionChanged = wtOverlays.topOverlay.resetFixedPosition();
      if (wtOverlays.bottomOverlay.clone) {
        positionChanged = wtOverlays.bottomOverlay.resetFixedPosition() || positionChanged;
      }
      positionChanged = wtOverlays.inlineStartOverlay.resetFixedPosition() || positionChanged;
      if (wtOverlays.topInlineStartCornerOverlay) {
        wtOverlays.topInlineStartCornerOverlay.resetFixedPosition();
      }
      if (wtOverlays.bottomInlineStartCornerOverlay && wtOverlays.bottomInlineStartCornerOverlay.clone) {
        wtOverlays.bottomInlineStartCornerOverlay.resetFixedPosition();
      }
    }
    if (positionChanged) {
      // It refreshes the cells borders caused by a 1px shift (introduced by overlays which add or
      // remove `innerBorderTop` and `innerBorderInlineStart` CSS classes to the DOM element. This happens
      // when there is a switch between rendering from 0 to N rows/columns and vice versa).
      wtOverlays.refreshAll(); // `refreshAll()` internally already calls `refreshSelections()` method
      wtOverlays.adjustElementsSize();
    } else {
      this.dataAccessObject.selectionManager.setActiveOverlay(this.facadeGetter()).render(runFastDraw);
    }
    if (this.isMaster) {
      wtOverlays.afterDraw();
    }
    this.dataAccessObject.drawn = true;
    return this;
  }

  /**
   * @param {number} col The visual column index.
   */
  markIfOversizedColumnHeader(col) {
    const sourceColIndex = this.columnFilter.renderedToSource(col);
    let level = this.wtSettings.getSetting('columnHeaders').length;
    const defaultRowHeight = this.wtSettings.getSetting('defaultRowHeight');
    let previousColHeaderHeight;
    let currentHeader;
    let currentHeaderHeight;
    const columnHeaderHeightSetting = this.wtSettings.getSetting('columnHeaderHeight') || [];
    while (level) {
      level -= 1;
      previousColHeaderHeight = this.getColumnHeaderHeight(level);
      currentHeader = this.getColumnHeader(sourceColIndex, level);
      if (!currentHeader) {
        /* eslint-disable no-continue */
        continue;
      }
      currentHeaderHeight = (0, _element.innerHeight)(currentHeader);
      if (!previousColHeaderHeight && defaultRowHeight < currentHeaderHeight || previousColHeaderHeight < currentHeaderHeight) {
        this.dataAccessObject.wtViewport.oversizedColumnHeaders[level] = currentHeaderHeight;
      }
      if (Array.isArray(columnHeaderHeightSetting)) {
        if (columnHeaderHeightSetting[level] !== null && columnHeaderHeightSetting[level] !== undefined) {
          this.dataAccessObject.wtViewport.oversizedColumnHeaders[level] = columnHeaderHeightSetting[level];
        }
      } else if (!isNaN(columnHeaderHeightSetting)) {
        this.dataAccessObject.wtViewport.oversizedColumnHeaders[level] = columnHeaderHeightSetting;
      }
      if (this.dataAccessObject.wtViewport.oversizedColumnHeaders[level] < (columnHeaderHeightSetting[level] || columnHeaderHeightSetting)) {
        this.dataAccessObject.wtViewport.oversizedColumnHeaders[level] = columnHeaderHeightSetting[level] || columnHeaderHeightSetting; // eslint-disable-line max-len
      }
    }
  }

  /**
   *
   */
  adjustColumnHeaderHeights() {
    const {
      wtSettings
    } = this;
    const children = this.THEAD.childNodes;
    const oversizedColumnHeaders = this.dataAccessObject.wtViewport.oversizedColumnHeaders;
    const columnHeaders = wtSettings.getSetting('columnHeaders');
    for (let i = 0, len = columnHeaders.length; i < len; i++) {
      if (oversizedColumnHeaders[i]) {
        if (!children[i] || children[i].childNodes.length === 0) {
          return;
        }
        children[i].childNodes[0].style.height = `${oversizedColumnHeaders[i]}px`;
      }
    }
  }

  /**
   * Resets cache of row heights. The cache should be cached for each render cycle in a case
   * when new cell values have content which increases/decreases cell height.
   */
  resetOversizedRows() {
    const {
      wtSettings
    } = this;
    const {
      wtViewport
    } = this.dataAccessObject;
    if (!this.isMaster && !this.is(_overlay.CLONE_BOTTOM)) {
      return;
    }
    if (!wtSettings.getSetting('externalRowCalculator')) {
      const rowsToRender = this.getRenderedRowsCount();

      // Reset the oversized row cache for rendered rows
      for (let visibleRowIndex = 0; visibleRowIndex < rowsToRender; visibleRowIndex++) {
        const sourceRow = this.rowFilter.renderedToSource(visibleRowIndex);
        if (wtViewport.oversizedRows && wtViewport.oversizedRows[sourceRow]) {
          wtViewport.oversizedRows[sourceRow] = undefined;
        }
      }
    }
  }

  /**
   * Get cell element at coords.
   * Negative coords.row or coords.col are used to retrieve header cells. If there are multiple header levels, the
   * negative value corresponds to the distance from the working area. For example, when there are 3 levels of column
   * headers, coords.col=-1 corresponds to the most inner header element, while coords.col=-3 corresponds to the
   * outmost header element.
   *
   * In case an element for the coords is not rendered, the method returns an error code.
   * To produce the error code, the input parameters are validated in the order in which they
   * are given. Thus, if both the row and the column coords are out of the rendered bounds,
   * the method returns the error code for the row.
   *
   * @param {CellCoords} coords The cell coordinates.
   * @returns {HTMLElement|number} HTMLElement on success or Number one of the exit codes on error:
   *  -1 row before viewport
   *  -2 row after viewport
   *  -3 column before viewport
   *  -4 column after viewport.
   */
  getCell(coords) {
    let row = coords.row;
    let column = coords.col;
    const hookResult = this.wtSettings.getSetting('onModifyGetCellCoords', row, column);
    if (hookResult && Array.isArray(hookResult)) {
      [row, column] = hookResult;
    }
    if (this.isRowBeforeRenderedRows(row)) {
      // row before rendered rows
      return -1;
    } else if (this.isRowAfterRenderedRows(row)) {
      // row after rendered rows
      return -2;
    } else if (this.isColumnBeforeRenderedColumns(column)) {
      // column before rendered columns
      return -3;
    } else if (this.isColumnAfterRenderedColumns(column)) {
      // column after rendered columns
      return -4;
    }
    const TR = this.getRow(row);
    if (!TR && row >= 0) {
      throw new Error('TR was expected to be rendered but is not');
    }
    const TD = TR.childNodes[this.columnFilter.sourceColumnToVisibleRowHeadedColumn(column)];
    if (!TD && column >= 0) {
      throw new Error('TD or TH was expected to be rendered but is not');
    }
    return TD;
  }

  /**
   * Get the DOM element of the row with the provided index.
   *
   * @param {number} rowIndex Row index.
   * @returns {HTMLTableRowElement|boolean} Return the row's DOM element or `false` if the row with the provided
   * index doesn't exist.
   */
  getRow(rowIndex) {
    let renderedRowIndex = null;
    let parentElement = null;
    if (rowIndex < 0) {
      var _this$rowFilter;
      renderedRowIndex = (_this$rowFilter = this.rowFilter) === null || _this$rowFilter === void 0 ? void 0 : _this$rowFilter.sourceRowToVisibleColHeadedRow(rowIndex);
      parentElement = this.THEAD;
    } else {
      var _this$rowFilter2;
      renderedRowIndex = (_this$rowFilter2 = this.rowFilter) === null || _this$rowFilter2 === void 0 ? void 0 : _this$rowFilter2.sourceToRendered(rowIndex);
      parentElement = this.TBODY;
    }
    if (renderedRowIndex !== undefined && parentElement !== undefined) {
      if (parentElement.childNodes.length < renderedRowIndex + 1) {
        return false;
      } else {
        return parentElement.childNodes[renderedRowIndex];
      }
    } else {
      return false;
    }
  }

  /**
   * GetColumnHeader.
   *
   * @param {number} col Column index.
   * @param {number} [level=0] Header level (0 = most distant to the table).
   * @returns {object} HTMLElement on success or undefined on error.
   */
  getColumnHeader(col) {
    let level = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
    const TR = this.THEAD.childNodes[level];
    return TR === null || TR === void 0 ? void 0 : TR.childNodes[this.columnFilter.sourceColumnToVisibleRowHeadedColumn(col)];
  }

  /**
   * Gets all columns headers (TH elements) from the table.
   *
   * @param {number} column A source column index.
   * @returns {HTMLTableCellElement[]}
   */
  getColumnHeaders(column) {
    const THs = [];
    const visibleColumn = this.columnFilter.sourceColumnToVisibleRowHeadedColumn(column);
    this.THEAD.childNodes.forEach(TR => {
      const TH = TR.childNodes[visibleColumn];
      if (TH) {
        THs.push(TH);
      }
    });
    return THs;
  }

  /**
   * GetRowHeader.
   *
   * @param {number} row Row index.
   * @param {number} [level=0] Header level (0 = most distant to the table).
   * @returns {HTMLElement} HTMLElement on success or Number one of the exit codes on error: `null table doesn't have
   *   row headers`.
   */
  getRowHeader(row) {
    let level = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
    const rowHeadersCount = this.wtSettings.getSetting('rowHeaders').length;
    if (level >= rowHeadersCount) {
      return;
    }
    const renderedRow = this.rowFilter.sourceToRendered(row);
    const visibleRow = renderedRow < 0 ? this.rowFilter.sourceRowToVisibleColHeadedRow(row) : renderedRow;
    const parentElement = renderedRow < 0 ? this.THEAD : this.TBODY;
    const TR = parentElement.childNodes[visibleRow];
    return TR === null || TR === void 0 ? void 0 : TR.childNodes[level];
  }

  /**
   * Gets all rows headers (TH elements) from the table.
   *
   * @param {number} row A source row index.
   * @returns {HTMLTableCellElement[]}
   */
  getRowHeaders(row) {
    const THs = [];
    const rowHeadersCount = this.wtSettings.getSetting('rowHeaders').length;
    for (let renderedRowIndex = 0; renderedRowIndex < rowHeadersCount; renderedRowIndex++) {
      const TR = this.TBODY.childNodes[this.rowFilter.sourceToRendered(row)];
      const TH = TR === null || TR === void 0 ? void 0 : TR.childNodes[renderedRowIndex];
      if (TH) {
        THs.push(TH);
      }
    }
    return THs;
  }

  /**
   * Returns cell coords object for a given TD (or a child element of a TD element).
   *
   * @param {HTMLTableCellElement} TD A cell DOM element (or a child of one).
   * @returns {CellCoords|null} The coordinates of the provided TD element (or the closest TD element) or null, if the
   *   provided element is not applicable.
   */
  getCoords(TD) {
    let cellElement = TD;
    if (cellElement.nodeName !== 'TD' && cellElement.nodeName !== 'TH') {
      cellElement = (0, _element.closest)(cellElement, ['TD', 'TH']);
    }
    if (cellElement === null) {
      return null;
    }
    const TR = cellElement.parentNode;
    const CONTAINER = TR.parentNode;
    let row = (0, _element.index)(TR);
    let col = cellElement.cellIndex;
    if ((0, _element.overlayContainsElement)(_overlay.CLONE_TOP_INLINE_START_CORNER, cellElement, this.wtRootElement) || (0, _element.overlayContainsElement)(_overlay.CLONE_TOP, cellElement, this.wtRootElement)) {
      if (CONTAINER.nodeName === 'THEAD') {
        row -= CONTAINER.childNodes.length;
      }
    } else if ((0, _element.overlayContainsElement)(_overlay.CLONE_BOTTOM_INLINE_START_CORNER, cellElement, this.wtRootElement) || (0, _element.overlayContainsElement)(_overlay.CLONE_BOTTOM, cellElement, this.wtRootElement)) {
      const totalRows = this.wtSettings.getSetting('totalRows');
      row = totalRows - CONTAINER.childNodes.length + row;
    } else if (CONTAINER === this.THEAD) {
      row = this.rowFilter.visibleColHeadedRowToSourceRow(row);
    } else {
      row = this.rowFilter.renderedToSource(row);
    }
    if ((0, _element.overlayContainsElement)(_overlay.CLONE_TOP_INLINE_START_CORNER, cellElement, this.wtRootElement) || (0, _element.overlayContainsElement)(_overlay.CLONE_INLINE_START, cellElement, this.wtRootElement) || (0, _element.overlayContainsElement)(_overlay.CLONE_BOTTOM_INLINE_START_CORNER, cellElement, this.wtRootElement)) {
      col = this.columnFilter.offsettedTH(col);
    } else {
      col = this.columnFilter.visibleRowHeadedColumnToSourceColumn(col);
    }
    return this.wot.createCellCoords(row, col);
  }

  /**
   * Check if any of the rendered rows is higher than expected, and if so, cache them.
   */
  markOversizedRows() {
    if (this.wtSettings.getSetting('externalRowCalculator')) {
      return;
    }
    let rowCount = this.TBODY.childNodes.length;
    const expectedTableHeight = rowCount * this.wtSettings.getSetting('defaultRowHeight');
    const actualTableHeight = (0, _element.innerHeight)(this.TBODY) - 1;
    let previousRowHeight;
    let rowInnerHeight;
    let sourceRowIndex;
    let currentTr;
    let rowHeader;
    if (expectedTableHeight === actualTableHeight && !this.wtSettings.getSetting('fixedRowsBottom')) {
      // If the actual table height equals rowCount * default single row height, no row is oversized -> no need to iterate over them
      return;
    }
    while (rowCount) {
      rowCount -= 1;
      sourceRowIndex = this.rowFilter.renderedToSource(rowCount);
      previousRowHeight = this.getRowHeight(sourceRowIndex);
      currentTr = this.getTrForRow(sourceRowIndex);
      rowHeader = currentTr.querySelector('th');
      if (rowHeader) {
        rowInnerHeight = (0, _element.innerHeight)(rowHeader);
      } else {
        rowInnerHeight = (0, _element.innerHeight)(currentTr) - 1;
      }
      if (!previousRowHeight && this.wtSettings.getSetting('defaultRowHeight') < rowInnerHeight || previousRowHeight < rowInnerHeight) {
        rowInnerHeight += 1;
        this.dataAccessObject.wtViewport.oversizedRows[sourceRowIndex] = rowInnerHeight;
      }
    }
  }

  /**
   * @param {number} row The visual row index.
   * @returns {HTMLTableElement}
   */
  getTrForRow(row) {
    return this.TBODY.childNodes[this.rowFilter.sourceToRendered(row)];
  }

  /**
   * Checks if the column index (negative value from -1 to N) is rendered.
   *
   * @param {number} column The column index (negative value from -1 to N).
   * @returns {boolean}
   */
  isColumnHeaderRendered(column) {
    if (column >= 0) {
      return false;
    }
    const rowHeaders = this.wtSettings.getSetting('rowHeaders');
    const rowHeadersCount = rowHeaders.length;
    return Math.abs(column) <= rowHeadersCount;
  }

  /**
   * Checks if the row index (negative value from -1 to N) is rendered.
   *
   * @param {number} row The row index (negative value from -1 to N).
   * @returns {boolean}
   */
  isRowHeaderRendered(row) {
    if (row >= 0) {
      return false;
    }
    const columnHeaders = this.wtSettings.getSetting('columnHeaders');
    const columnHeadersCount = columnHeaders.length;
    return Math.abs(row) <= columnHeadersCount;
  }

  /* eslint-disable jsdoc/require-description-complete-sentence */
  /**
   * Check if the given row index is lower than the index of the first row that
   * is currently rendered and return TRUE in that case, or FALSE otherwise.
   *
   * Negative row index is used to check the columns' headers.
   *
   *  Headers
   *           +--------------+                                     │
   *       -3  │    │    │    │                                     │
   *           +--------------+                                     │
   *       -2  │    │    │    │                                     │ TRUE
   *           +--------------+                                     │
   *       -1  │    │    │    │                                     │
   *  Cells  +==================+                                   │
   *        0  ┇    ┇    ┇    ┇ <--- For fixedRowsTop: 1            │
   *           +--------------+      the master overlay do       ---+ first rendered row (index 1)
   *        1  │ A2 │ B2 │ C2 │      not render the first row.      │
   *           +--------------+                                     │ FALSE
   *        2  │ A3 │ B3 │ C3 │                                     │
   *           +--------------+                                  ---+ last rendered row
   *                                                                │
   *                                                                │ FALSE
   *
   * @param {number} row The visual row index.
   * @memberof Table#
   * @function isRowBeforeRenderedRows
   * @returns {boolean}
   */
  /* eslint-enable jsdoc/require-description-complete-sentence */
  isRowBeforeRenderedRows(row) {
    const first = this.getFirstRenderedRow();

    // Check the headers only in case when the first rendered row is -1 or 0.
    // This is an indication that the overlay is placed on the most top position.
    if (row < 0 && first <= 0) {
      return !this.isRowHeaderRendered(row);
    }
    return row < first;
  }

  /* eslint-disable jsdoc/require-description-complete-sentence */
  /**
   * Check if the given column index is greater than the index of the last column that
   * is currently rendered and return TRUE in that case, or FALSE otherwise.
   *
   * The negative row index is used to check the columns' headers. However,
   * keep in mind that for negative indexes, the method always returns FALSE as
   * it is not possible to render headers partially. The "after" index can not be
   * lower than -1.
   *
   *  Headers
   *           +--------------+                                     │
   *       -3  │    │    │    │                                     │
   *           +--------------+                                     │
   *       -2  │    │    │    │                                     │ FALSE
   *           +--------------+                                     │
   *       -1  │    │    │    │                                     │
   *  Cells  +==================+                                   │
   *        0  ┇    ┇    ┇    ┇ <--- For fixedRowsTop: 1            │
   *           +--------------+      the master overlay do       ---+ first rendered row (index 1)
   *        1  │ A2 │ B2 │ C2 │      not render the first rows      │
   *           +--------------+                                     │ FALSE
   *        2  │ A3 │ B3 │ C3 │                                     │
   *           +--------------+                                  ---+ last rendered row
   *                                                                │
   *                                                                │ TRUE
   *
   * @param {number} row The visual row index.
   * @memberof Table#
   * @function isRowAfterRenderedRows
   * @returns {boolean}
   */
  /* eslint-enable jsdoc/require-description-complete-sentence */
  isRowAfterRenderedRows(row) {
    return row > this.getLastRenderedRow();
  }

  /* eslint-disable jsdoc/require-description-complete-sentence */
  /**
   * Check if the given column index is lower than the index of the first column that
   * is currently rendered and return TRUE in that case, or FALSE otherwise.
   *
   * Negative column index is used to check the rows' headers.
   *
   *                            For fixedColumnsStart: 1 the master overlay
   *                            do not render this first columns.
   *  Headers    -3   -2   -1    |
   *           +----+----+----║┄ ┄ +------+------+
   *           │    │    │    ║    │  B1  │  C1  │
   *           +--------------║┄ ┄ --------------│
   *           │    │    │    ║    │  B2  │  C2  │
   *           +--------------║┄ ┄ --------------│
   *           │    │    │    ║    │  B3  │  C3  │
   *           +----+----+----║┄ ┄ +------+------+
   *                               ╷             ╷
   *      -------------------------+-------------+---------------->
   *          TRUE             first    FALSE   last         FALSE
   *                           rendered         rendered
   *                           column           column
   *
   * @param {number} column The visual column index.
   * @memberof Table#
   * @function isColumnBeforeRenderedColumns
   * @returns {boolean}
   */
  /* eslint-enable jsdoc/require-description-complete-sentence */
  isColumnBeforeRenderedColumns(column) {
    const first = this.getFirstRenderedColumn();

    // Check the headers only in case when the first rendered column is -1 or 0.
    // This is an indication that the overlay is placed on the most left position.
    if (column < 0 && first <= 0) {
      return !this.isColumnHeaderRendered(column);
    }
    return column < first;
  }

  /* eslint-disable jsdoc/require-description-complete-sentence */
  /**
   * Check if the given column index is greater than the index of the last column that
   * is currently rendered and return TRUE in that case, or FALSE otherwise.
   *
   * The negative column index is used to check the rows' headers. However,
   * keep in mind that for negative indexes, the method always returns FALSE as
   * it is not possible to render headers partially. The "after" index can not be
   * lower than -1.
   *
   *                            For fixedColumnsStart: 1 the master overlay
   *                            do not render this first columns.
   *  Headers    -3   -2   -1    |
   *           +----+----+----║┄ ┄ +------+------+
   *           │    │    │    ║    │  B1  │  C1  │
   *           +--------------║┄ ┄ --------------│
   *           │    │    │    ║    │  B2  │  C2  │
   *           +--------------║┄ ┄ --------------│
   *           │    │    │    ║    │  B3  │  C3  │
   *           +----+----+----║┄ ┄ +------+------+
   *                               ╷             ╷
   *      -------------------------+-------------+---------------->
   *          FALSE             first    FALSE   last         TRUE
   *                           rendered         rendered
   *                           column           column
   *
   * @param {number} column The visual column index.
   * @memberof Table#
   * @function isColumnAfterRenderedColumns
   * @returns {boolean}
   */
  /* eslint-enable jsdoc/require-description-complete-sentence */
  isColumnAfterRenderedColumns(column) {
    return this.columnFilter && column > this.getLastRenderedColumn();
  }
  isColumnAfterViewport(column) {
    return this.columnFilter && column > this.getLastVisibleColumn();
  }
  isRowAfterViewport(row) {
    return this.rowFilter && row > this.getLastVisibleRow();
  }
  isColumnBeforeViewport(column) {
    return this.columnFilter && this.columnFilter.sourceToRendered(column) < 0 && column >= 0;
  }
  isLastRowFullyVisible() {
    return this.getLastVisibleRow() === this.getLastRenderedRow();
  }
  isLastColumnFullyVisible() {
    return this.getLastVisibleColumn() === this.getLastRenderedColumn();
  }
  allRowsInViewport() {
    return this.wtSettings.getSetting('totalRows') === this.getVisibleRowsCount();
  }
  allColumnsInViewport() {
    return this.wtSettings.getSetting('totalColumns') === this.getVisibleColumnsCount();
  }

  /**
   * Checks if any of the row's cells content exceeds its initial height, and if so, returns the oversized height.
   *
   * @param {number} sourceRow The physical row index.
   * @returns {number}
   */
  getRowHeight(sourceRow) {
    return this.rowUtils.getHeight(sourceRow);
  }

  /**
   * @param {number} level The column level.
   * @returns {number}
   */
  getColumnHeaderHeight(level) {
    return this.columnUtils.getHeaderHeight(level);
  }

  /**
   * @param {number} sourceColumn The physical column index.
   * @returns {number}
   */
  getColumnWidth(sourceColumn) {
    return this.columnUtils.getWidth(sourceColumn);
  }

  /**
   * @param {number} sourceColumn The physical column index.
   * @returns {number}
   */
  getStretchedColumnWidth(sourceColumn) {
    return this.columnUtils.getStretchedColumnWidth(sourceColumn);
  }

  /**
   * Checks if the table has defined size. It returns `true` when the table has width and height
   * set bigger than `0px`.
   *
   * @returns {boolean}
   */
  hasDefinedSize() {
    return this.hasTableHeight && this.hasTableWidth;
  }

  /**
   * Gets table's width. The returned width is the width of the rendered cells that fit in the
   * current viewport. The value may change depends on the viewport position (scroll position).
   *
   * @returns {number}
   */
  getWidth() {
    return (0, _element.outerWidth)(this.TABLE);
  }

  /**
   * Gets table's height. The returned height is the height of the rendered cells that fit in the
   * current viewport. The value may change depends on the viewport position (scroll position).
   *
   * @returns {number}
   */
  getHeight() {
    return (0, _element.outerHeight)(this.TABLE);
  }

  /**
   * Gets table's total width. The returned width is the width of all rendered cells (including headers)
   * that can be displayed in the table.
   *
   * @returns {number}
   */
  getTotalWidth() {
    const width = (0, _element.outerWidth)(this.hider);

    // when the overlay's table does not have any cells the hider returns 0, get then width from the table element
    return width !== 0 ? width : this.getWidth();
  }

  /**
   * Gets table's total height. The returned height is the height of all rendered cells (including headers)
   * that can be displayed in the table.
   *
   * @returns {number}
   */
  getTotalHeight() {
    const height = (0, _element.outerHeight)(this.hider);

    // when the overlay's table does not have any cells the hider returns 0, get then height from the table element
    return height !== 0 ? height : this.getHeight();
  }

  /**
   * Checks if the table is visible. It returns `true` when the holder element (or its parents)
   * has CSS 'display' property different than 'none'.
   *
   * @returns {boolean}
   */
  isVisible() {
    return (0, _element.isVisible)(this.TABLE);
  }

  /**
   * Modify row header widths provided by user in class contructor.
   *
   * @private
   * @param {Function} rowHeaderWidthFactory The function which can provide default width values for rows..
   * @returns {number}
   */
  _modifyRowHeaderWidth(rowHeaderWidthFactory) {
    let widths = (0, _function.isFunction)(rowHeaderWidthFactory) ? rowHeaderWidthFactory() : null;
    if (Array.isArray(widths)) {
      widths = [...widths];
      widths[widths.length - 1] = this._correctRowHeaderWidth(widths[widths.length - 1]);
    } else {
      widths = this._correctRowHeaderWidth(widths);
    }
    return widths;
  }

  /**
   * Correct row header width if necessary.
   *
   * @private
   * @param {number} width The width to process.
   * @returns {number}
   */
  _correctRowHeaderWidth(width) {
    let rowHeaderWidth = width;
    if (typeof width !== 'number') {
      rowHeaderWidth = this.wtSettings.getSetting('defaultColumnWidth');
    }
    if (this.correctHeaderWidth) {
      rowHeaderWidth += 1;
    }
    return rowHeaderWidth;
  }
}
var _default = exports.default = Table;