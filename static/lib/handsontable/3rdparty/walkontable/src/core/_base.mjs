import "core-js/modules/es.error.cause.js";
import "core-js/modules/es.array.push.js";
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
import { fastInnerText } from "../../../../helpers/dom/element.mjs";
import { randomString } from "../../../../helpers/string.mjs";
import EventManager from "../../../../eventManager.mjs";
import Scroll from "../scroll.mjs";
import CellCoords from "../cell/coords.mjs";
import CellRange from "../cell/range.mjs";
/**
 * @abstract
 * @class Walkontable
 */
export default class CoreAbstract {
  get eventManager() {
    return new EventManager(this);
  }

  /**
   * @param {HTMLTableElement} table Main table.
   * @param {Settings} settings The Walkontable settings.
   */
  constructor(table, settings) {
    _defineProperty(this, "wtTable", void 0);
    _defineProperty(this, "wtScroll", void 0);
    _defineProperty(this, "wtViewport", void 0);
    _defineProperty(this, "wtOverlays", void 0);
    _defineProperty(this, "selectionManager", void 0);
    _defineProperty(this, "wtEvent", void 0);
    /**
     * The walkontable instance id.
     *
     * @public
     * @type {Readonly<string>}
     */
    _defineProperty(this, "guid", `wt_${randomString()}`);
    _defineProperty(this, "drawInterrupted", false);
    _defineProperty(this, "drawn", false);
    /**
     * The DOM bindings.
     *
     * @public
     * @type {DomBindings}
     */
    _defineProperty(this, "domBindings", void 0);
    /**
     * Settings.
     *
     * @public
     * @type {Settings}
     */
    _defineProperty(this, "wtSettings", void 0);
    this.domBindings = {
      rootTable: table,
      rootDocument: table.ownerDocument,
      rootWindow: table.ownerDocument.defaultView
    };
    this.wtSettings = settings;
    this.wtScroll = new Scroll(this.createScrollDao());
  }
  findOriginalHeaders() {
    const originalHeaders = [];

    // find original headers
    if (this.wtTable.THEAD.childNodes.length && this.wtTable.THEAD.childNodes[0].childNodes.length) {
      for (let c = 0, clen = this.wtTable.THEAD.childNodes[0].childNodes.length; c < clen; c++) {
        originalHeaders.push(this.wtTable.THEAD.childNodes[0].childNodes[c].innerHTML);
      }
      if (!this.wtSettings.getSetting('columnHeaders').length) {
        this.wtSettings.update('columnHeaders', [function (column, TH) {
          fastInnerText(TH, originalHeaders[column]);
        }]);
      }
    }
  }

  /**
   * Creates and returns the CellCoords object.
   *
   * @param {*} row The row index.
   * @param {*} column The column index.
   * @returns {CellCoords}
   */
  createCellCoords(row, column) {
    return new CellCoords(row, column, this.wtSettings.getSetting('rtlMode'));
  }

  /**
   * Creates and returns the CellRange object.
   *
   * @param {CellCoords} highlight The highlight coordinates.
   * @param {CellCoords} from The from coordinates.
   * @param {CellCoords} to The to coordinates.
   * @returns {CellRange}
   */
  createCellRange(highlight, from, to) {
    return new CellRange(highlight, from, to, this.wtSettings.getSetting('rtlMode'));
  }

  /**
   * Force rerender of Walkontable.
   *
   * @param {boolean} [fastDraw=false] When `true`, try to refresh only the positions of borders without rerendering
   *                                   the data. It will only work if Table.draw() does not force
   *                                   rendering anyway.
   * @returns {Walkontable}
   */
  draw() {
    let fastDraw = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;
    this.drawInterrupted = false;
    if (!this.wtTable.isVisible()) {
      // draw interrupted because TABLE is not visible
      this.drawInterrupted = true;
    } else {
      this.wtTable.draw(fastDraw);
    }
    return this;
  }

  /**
   * Returns the TD at coords. If topmost is set to true, returns TD from the topmost overlay layer,
   * if not set or set to false, returns TD from the master table.
   *
   * @param {CellCoords} coords The cell coordinates.
   * @param {boolean} [topmost=false] If set to `true`, it returns the TD element from the topmost overlay. For example,
   *                                  if the wanted cell is in the range of fixed rows, it will return a TD element
   *                                  from the top overlay.
   * @returns {HTMLElement}
   */
  getCell(coords) {
    let topmost = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
    if (!topmost) {
      return this.wtTable.getCell(coords);
    }
    const totalRows = this.wtSettings.getSetting('totalRows');
    const fixedRowsTop = this.wtSettings.getSetting('fixedRowsTop');
    const fixedRowsBottom = this.wtSettings.getSetting('fixedRowsBottom');
    const fixedColumnsStart = this.wtSettings.getSetting('fixedColumnsStart');
    if (coords.row < fixedRowsTop && coords.col < fixedColumnsStart) {
      return this.wtOverlays.topInlineStartCornerOverlay.clone.wtTable.getCell(coords);
    } else if (coords.row < fixedRowsTop) {
      return this.wtOverlays.topOverlay.clone.wtTable.getCell(coords);
    } else if (coords.col < fixedColumnsStart && coords.row >= totalRows - fixedRowsBottom) {
      if (this.wtOverlays.bottomInlineStartCornerOverlay && this.wtOverlays.bottomInlineStartCornerOverlay.clone) {
        return this.wtOverlays.bottomInlineStartCornerOverlay.clone.wtTable.getCell(coords);
      }
    } else if (coords.col < fixedColumnsStart) {
      return this.wtOverlays.inlineStartOverlay.clone.wtTable.getCell(coords);
    } else if (coords.row < totalRows && coords.row >= totalRows - fixedRowsBottom) {
      if (this.wtOverlays.bottomOverlay && this.wtOverlays.bottomOverlay.clone) {
        return this.wtOverlays.bottomOverlay.clone.wtTable.getCell(coords);
      }
    }
    return this.wtTable.getCell(coords);
  }

  /**
   * Scrolls the viewport to a cell (rerenders if needed).
   *
   * @param {CellCoords} coords The cell coordinates to scroll to.
   * @param {boolean} [snapToTop] If `true`, viewport is scrolled to show the cell on the top of the table.
   * @param {boolean} [snapToRight] If `true`, viewport is scrolled to show the cell on the right of the table.
   * @param {boolean} [snapToBottom] If `true`, viewport is scrolled to show the cell on the bottom of the table.
   * @param {boolean} [snapToLeft] If `true`, viewport is scrolled to show the cell on the left of the table.
   * @returns {boolean}
   */
  scrollViewport(coords, snapToTop, snapToRight, snapToBottom, snapToLeft) {
    if (coords.col < 0 || coords.row < 0) {
      return false;
    }
    return this.wtScroll.scrollViewport(coords, snapToTop, snapToRight, snapToBottom, snapToLeft);
  }

  /**
   * Scrolls the viewport to a column (rerenders if needed).
   *
   * @param {number} column Visual column index.
   * @param {boolean} [snapToRight] If `true`, viewport is scrolled to show the cell on the right of the table.
   * @param {boolean} [snapToLeft] If `true`, viewport is scrolled to show the cell on the left of the table.
   * @returns {boolean}
   */
  scrollViewportHorizontally(column, snapToRight, snapToLeft) {
    if (column < 0) {
      return false;
    }
    return this.wtScroll.scrollViewportHorizontally(column, snapToRight, snapToLeft);
  }

  /**
   * Scrolls the viewport to a row (rerenders if needed).
   *
   * @param {number} row Visual row index.
   * @param {boolean} [snapToTop] If `true`, viewport is scrolled to show the cell on the top of the table.
   * @param {boolean} [snapToBottom] If `true`, viewport is scrolled to show the cell on the bottom of the table.
   * @returns {boolean}
   */
  scrollViewportVertically(row, snapToTop, snapToBottom) {
    if (row < 0) {
      return false;
    }
    return this.wtScroll.scrollViewportVertically(row, snapToTop, snapToBottom);
  }

  /**
   * @returns {Array}
   */
  getViewport() {
    return [this.wtTable.getFirstVisibleRow(), this.wtTable.getFirstVisibleColumn(), this.wtTable.getLastVisibleRow(), this.wtTable.getLastVisibleColumn()];
  }

  /**
   * Destroy instance.
   */
  destroy() {
    this.wtOverlays.destroy();
    this.wtEvent.destroy();
  }

  /**
   * Create data access object for scroll.
   *
   * @protected
   * @returns {ScrollDao}
   */
  createScrollDao() {
    const wot = this;
    return {
      get drawn() {
        return wot.drawn; // TODO refactoring: consider about injecting `isDrawn` function : ()=>return wot.drawn. (it'll enables remove dao layer)
      },
      get topOverlay() {
        return wot.wtOverlays.topOverlay; // TODO refactoring: move outside dao, use IOC
      },
      get inlineStartOverlay() {
        return wot.wtOverlays.inlineStartOverlay; // TODO refactoring: move outside dao, use IOC
      },
      get wtTable() {
        return wot.wtTable; // TODO refactoring: move outside dao, use IOC
      },
      get wtViewport() {
        return wot.wtViewport; // TODO refactoring: move outside dao, use IOC
      },
      get wtSettings() {
        return wot.wtSettings;
      },
      get rootWindow() {
        return wot.domBindings.rootWindow; // TODO refactoring: move outside dao
      },
      // TODO refactoring, consider about using injecting wtSettings into scroll (it'll enables remove dao layer)
      get totalRows() {
        return wot.wtSettings.getSetting('totalRows');
      },
      get totalColumns() {
        return wot.wtSettings.getSetting('totalColumns');
      },
      get fixedRowsTop() {
        return wot.wtSettings.getSetting('fixedRowsTop');
      },
      get fixedRowsBottom() {
        return wot.wtSettings.getSetting('fixedRowsBottom');
      },
      get fixedColumnsStart() {
        return wot.wtSettings.getSetting('fixedColumnsStart');
      }
    };
  }
  // TODO refactoring: it will be much better to not use DAO objects. They are needed for now to provide
  // dynamically access to related objects
  /**
   * Create data access object for wtTable.
   *
   * @protected
   * @returns {TableDao}
   */
  getTableDao() {
    const wot = this;
    return {
      get wot() {
        return wot;
      },
      get parentTableOffset() {
        return wot.cloneSource.wtTable.tableOffset; // TODO rethink: cloneSource exists only in Clone type.
      },
      get cloneSource() {
        return wot.cloneSource; // TODO rethink: cloneSource exists only in Clone type.
      },
      get workspaceWidth() {
        return wot.wtViewport.getWorkspaceWidth();
      },
      get wtViewport() {
        return wot.wtViewport; // TODO refactoring: move outside dao, use IOC
      },
      get wtOverlays() {
        return wot.wtOverlays; // TODO refactoring: move outside dao, use IOC
      },
      get selectionManager() {
        return wot.selectionManager; // TODO refactoring: move outside dao, use IOC
      },
      get drawn() {
        return wot.drawn;
      },
      set drawn(v) {
        // TODO rethink: this breaks assumes of data access object, however it is required until invent better way to handle WOT state.
        wot.drawn = v;
      },
      get wtTable() {
        return wot.wtTable; // TODO refactoring: it provides itself
      },
      get startColumnRendered() {
        return wot.wtViewport.columnsRenderCalculator.startColumn;
      },
      get startColumnVisible() {
        return wot.wtViewport.columnsVisibleCalculator.startColumn;
      },
      get startColumnPartiallyVisible() {
        return wot.wtViewport.columnsPartiallyVisibleCalculator.startColumn;
      },
      get endColumnRendered() {
        return wot.wtViewport.columnsRenderCalculator.endColumn;
      },
      get endColumnVisible() {
        return wot.wtViewport.columnsVisibleCalculator.endColumn;
      },
      get endColumnPartiallyVisible() {
        return wot.wtViewport.columnsPartiallyVisibleCalculator.endColumn;
      },
      get countColumnsRendered() {
        return wot.wtViewport.columnsRenderCalculator.count;
      },
      get countColumnsVisible() {
        return wot.wtViewport.columnsVisibleCalculator.count;
      },
      get startRowRendered() {
        return wot.wtViewport.rowsRenderCalculator.startRow;
      },
      get startRowVisible() {
        return wot.wtViewport.rowsVisibleCalculator.startRow;
      },
      get startRowPartiallyVisible() {
        return wot.wtViewport.rowsPartiallyVisibleCalculator.startRow;
      },
      get endRowRendered() {
        return wot.wtViewport.rowsRenderCalculator.endRow;
      },
      get endRowVisible() {
        return wot.wtViewport.rowsVisibleCalculator.endRow;
      },
      get endRowPartiallyVisible() {
        return wot.wtViewport.rowsPartiallyVisibleCalculator.endRow;
      },
      get countRowsRendered() {
        return wot.wtViewport.rowsRenderCalculator.count;
      },
      get countRowsVisible() {
        return wot.wtViewport.rowsVisibleCalculator.count;
      },
      get columnHeaders() {
        return wot.wtSettings.getSetting('columnHeaders');
      },
      get rowHeaders() {
        return wot.wtSettings.getSetting('rowHeaders');
      }
    };
  }
}