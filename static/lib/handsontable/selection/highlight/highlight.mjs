import "core-js/modules/es.error.cause.js";
import "core-js/modules/es.array.push.js";
function _classPrivateMethodInitSpec(e, a) { _checkPrivateRedeclaration(e, a), a.add(e); }
function _checkPrivateRedeclaration(e, t) { if (t.has(e)) throw new TypeError("Cannot initialize the same private elements twice on an object"); }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
function _assertClassBrand(e, t, n) { if ("function" == typeof e ? e === t : e.has(t)) return arguments.length < 3 ? t : n; throw new TypeError("Private element is not present on this object"); }
import { createHighlight as createActiveHighlight } from "./types/activeHeader.mjs";
import { createHighlight as createAreaLayeredHighlight } from "./types/areaLayered.mjs";
import { createHighlight as createAreaHighlight } from "./types/area.mjs";
import { createHighlight as createColumnHighlight } from "./types/column.mjs";
import { createHighlight as createFocusHighlight } from "./types/focus.mjs";
import { createHighlight as createCustomHighlight } from "./types/customSelection.mjs";
import { createHighlight as createFillHighlight } from "./types/fill.mjs";
import { createHighlight as createHeaderHighlight } from "./types/header.mjs";
import { createHighlight as createRowHighlight } from "./types/row.mjs";
import { HIGHLIGHT_ACTIVE_HEADER_TYPE, HIGHLIGHT_AREA_TYPE, HIGHLIGHT_FOCUS_TYPE, HIGHLIGHT_CUSTOM_SELECTION_TYPE, HIGHLIGHT_FILL_TYPE, HIGHLIGHT_HEADER_TYPE, HIGHLIGHT_ROW_TYPE, HIGHLIGHT_COLUMN_TYPE } from "../../3rdparty/walkontable/src/index.mjs";
import { arrayEach } from "./../../helpers/array.mjs";
export { HIGHLIGHT_ACTIVE_HEADER_TYPE as ACTIVE_HEADER_TYPE, HIGHLIGHT_AREA_TYPE as AREA_TYPE, HIGHLIGHT_FOCUS_TYPE as FOCUS_TYPE, HIGHLIGHT_CUSTOM_SELECTION_TYPE as CUSTOM_SELECTION_TYPE, HIGHLIGHT_FILL_TYPE as FILL_TYPE, HIGHLIGHT_HEADER_TYPE as HEADER_TYPE, HIGHLIGHT_ROW_TYPE as ROW_TYPE, HIGHLIGHT_COLUMN_TYPE as COLUMN_TYPE };

/**
 * Highlight class responsible for managing Walkontable Selection classes.
 *
 * With Highlight object you can manipulate four different highlight types:
 *  - `cell` can be added only to a single cell at a time and it defines currently selected cell;
 *  - `fill` can occur only once and its highlight defines selection of autofill functionality (managed by the plugin with the same name);
 *  - `areas` can be added to multiple cells at a time. This type highlights selected cell or multiple cells.
 *    The multiple cells have to be defined as an uninterrupted order (regular shape). Otherwise, the new layer of
 *    that type should be created to manage not-consecutive selection;
 *  - `header` can occur multiple times. This type is designed to highlight only headers. Like `area` type it
 *    can appear with multiple highlights (accessed under different level layers).
 *
 * @class Highlight
 * @util
 */
var _Highlight_brand = /*#__PURE__*/new WeakSet();
class Highlight {
  constructor(options) {
    /**
     * Creates (if not exist in the cache) Walkontable Selection instance.
     *
     * @param {Map} cacheMap The map where the instance will be cached.
     * @param {Function} highlightFactory The function factory.
     * @returns {VisualSelection}
     */
    _classPrivateMethodInitSpec(this, _Highlight_brand);
    /**
     * Options consumed by Highlight class and Walkontable Selection classes.
     *
     * @type {object}
     */
    _defineProperty(this, "options", void 0);
    /**
     * The property which describes which layer level of the visual selection will be modified.
     * This option is valid only for `area` and `header` highlight types which occurs multiple times on
     * the table (as a non-consecutive selection).
     *
     * An order of the layers is the same as the order of added new non-consecutive selections.
     *
     * @type {number}
     * @default 0
     */
    _defineProperty(this, "layerLevel", 0);
    /**
     * `cell` highlight object which describes attributes for the currently selected cell.
     * It can only occur only once on the table.
     *
     * @type {Selection}
     */
    _defineProperty(this, "focus", void 0);
    /**
     * `fill` highlight object which describes attributes for the borders for autofill functionality.
     * It can only occur only once on the table.
     *
     * @type {Selection}
     */
    _defineProperty(this, "fill", void 0);
    /**
     * Collection of the `area` highlights. That objects describes attributes for the borders and selection of
     * the multiple selected cells. It can occur multiple times on the table.
     *
     * @type {Map.<number, Selection>}
     */
    _defineProperty(this, "layeredAreas", new Map());
    /**
     * Collection of the `highlight` highlights. That objects describes attributes for the borders and selection of
     * the multiple selected cells. It can occur multiple times on the table.
     *
     * @type {Map.<number, Selection>}
     */
    _defineProperty(this, "areas", new Map());
    /**
     * Collection of the `header` highlights. That objects describes attributes for the selection of
     * the multiple selected rows in the table header. It can occur multiple times on the table.
     *
     * @type {Map.<number, Selection>}
     */
    _defineProperty(this, "rowHeaders", new Map());
    /**
     * Collection of the `header` highlights. That objects describes attributes for the selection of
     * the multiple selected columns in the table header. It can occur multiple times on the table.
     *
     * @type {Map.<number, Selection>}
     */
    _defineProperty(this, "columnHeaders", new Map());
    /**
     * Collection of the `active-header` highlights. That objects describes attributes for the selection of
     * the multiple selected rows in the table header. The table headers which have selected all items in
     * a row will be marked as `active-header`.
     *
     * @type {Map.<number, Selection>}
     */
    _defineProperty(this, "activeRowHeaders", new Map());
    /**
     * Collection of the `active-header` highlights. That objects describes attributes for the selection of
     * the multiple selected columns in the table header. The table headers which have selected all items in
     * a row will be marked as `active-header`.
     *
     * @type {Map.<number, Selection>}
     */
    _defineProperty(this, "activeColumnHeaders", new Map());
    /**
     * Collection of the `active-header` highlights. That objects describes attributes for the selection of
     * the selected corner in the table header. The table headers which have selected all items in
     * a row will be marked as `active-header`.
     *
     * @type {Map.<number, Selection>}
     */
    _defineProperty(this, "activeCornerHeaders", new Map());
    /**
     * Collection of the `rows` highlights. That objects describes attributes for the selection of
     * the multiple selected cells in a row. It can occur multiple times on the table.
     *
     * @type {Map.<number, Selection>}
     */
    _defineProperty(this, "rowHighlights", new Map());
    /**
     * Collection of the `columns` highlights. That objects describes attributes for the selection of
     * the multiple selected cells in a column. It can occur multiple times on the table.
     *
     * @type {Map.<number, Selection>}
     */
    _defineProperty(this, "columnHighlights", new Map());
    /**
     * Collection of the `custom-selection`, holder for example borders added through CustomBorders plugin.
     *
     * @type {Selection[]}
     */
    _defineProperty(this, "customSelections", []);
    this.options = options;
    this.focus = createFocusHighlight(options);
    this.fill = createFillHighlight(options);
  }

  /**
   * Check if highlight cell rendering is disabled for specified highlight type.
   *
   * @param {string} highlightType Highlight type. Possible values are: `cell`, `area`, `fill` or `header`.
   * @param {CellCoords} coords The CellCoords instance with defined visual coordinates.
   * @returns {boolean}
   */
  isEnabledFor(highlightType, coords) {
    let type = highlightType;

    // Legacy compatibility.
    if (highlightType === HIGHLIGHT_FOCUS_TYPE) {
      type = 'current'; // One from settings for `disableVisualSelection` up to Handsontable 0.36/Handsontable Pro 1.16.0.
    }
    let disableHighlight = this.options.disabledCellSelection(coords.row, coords.col);
    if (typeof disableHighlight === 'string') {
      disableHighlight = [disableHighlight];
    }
    return disableHighlight === false || Array.isArray(disableHighlight) && !disableHighlight.includes(type);
  }

  /**
   * Set a new layer level to make access to the desire `area` and `header` highlights.
   *
   * @param {number} [level=0] Layer level to use.
   * @returns {Highlight}
   */
  useLayerLevel() {
    let level = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;
    this.layerLevel = level;
    return this;
  }

  /**
   * Get Walkontable Selection instance created for controlling highlight of the currently
   * focused cell (or header).
   *
   * @returns {Selection}
   */
  getFocus() {
    return this.focus;
  }

  /**
   * Get Walkontable Selection instance created for controlling highlight of the autofill functionality.
   *
   * @returns {Selection}
   */
  getFill() {
    return this.fill;
  }

  /**
   * Creates (if not exist in the cache) Walkontable Selection instance created for controlling
   * `area` highlights.
   *
   * @returns {Selection}
   */
  createLayeredArea() {
    return _assertClassBrand(_Highlight_brand, this, _createHighlight).call(this, this.layeredAreas, createAreaLayeredHighlight);
  }

  /**
   * Get all Walkontable Selection instances which describes the state of the visual highlight of the cells.
   *
   * @returns {Selection[]}
   */
  getLayeredAreas() {
    return [...this.layeredAreas.values()];
  }

  /**
   * Creates (if not exist in the cache) Walkontable Selection instance created for controlling
   * `highlight` highlights.
   *
   * @returns {Selection}
   */
  createArea() {
    return _assertClassBrand(_Highlight_brand, this, _createHighlight).call(this, this.areas, createAreaHighlight);
  }

  /**
   * Get all Walkontable Selection instances which describes the state of the visual highlight of the cells.
   *
   * @returns {Selection[]}
   */
  getAreas() {
    return [...this.areas.values()];
  }

  /**
   * Creates (if not exist in the cache) Walkontable Selection instance created for controlling
   * header highlight for rows.
   *
   * @returns {Selection}
   */
  createRowHeader() {
    return _assertClassBrand(_Highlight_brand, this, _createHighlight).call(this, this.rowHeaders, createHeaderHighlight);
  }

  /**
   * Get all Walkontable Selection instances which describes the state of the visual highlight of the headers.
   *
   * @returns {Selection[]}
   */
  getRowHeaders() {
    return [...this.rowHeaders.values()];
  }

  /**
   * Creates (if not exist in the cache) Walkontable Selection instance created for controlling
   * header highlight for columns.
   *
   * @returns {Selection}
   */
  createColumnHeader() {
    return _assertClassBrand(_Highlight_brand, this, _createHighlight).call(this, this.columnHeaders, createHeaderHighlight);
  }

  /**
   * Get all Walkontable Selection instances which describes the state of the visual highlight of the headers.
   *
   * @returns {Selection[]}
   */
  getColumnHeaders() {
    return [...this.columnHeaders.values()];
  }

  /**
   * Creates (if not exist in the cache) Walkontable Selection instance created for controlling
   * highlight for active row headers.
   *
   * @returns {Selection}
   */
  createActiveRowHeader() {
    return _assertClassBrand(_Highlight_brand, this, _createHighlight).call(this, this.activeRowHeaders, createActiveHighlight);
  }

  /**
   * Get all Walkontable Selection instances which describes the state of the visual highlight of the active headers.
   *
   * @returns {Selection[]}
   */
  getActiveRowHeaders() {
    return [...this.activeRowHeaders.values()];
  }

  /**
   * Creates (if not exist in the cache) Walkontable Selection instance created for controlling
   * highlight for active column headers.
   *
   * @returns {Selection}
   */
  createActiveColumnHeader() {
    return _assertClassBrand(_Highlight_brand, this, _createHighlight).call(this, this.activeColumnHeaders, createActiveHighlight);
  }

  /**
   * Get all Walkontable Selection instances which describes the state of the visual highlight of the active headers.
   *
   * @returns {Selection[]}
   */
  getActiveColumnHeaders() {
    return [...this.activeColumnHeaders.values()];
  }

  /**
   * Creates (if not exist in the cache) Walkontable Selection instance created for controlling
   * highlight for the headers corner.
   *
   * @returns {Selection}
   */
  createActiveCornerHeader() {
    return _assertClassBrand(_Highlight_brand, this, _createHighlight).call(this, this.activeCornerHeaders, createActiveHighlight);
  }

  /**
   * Get all Walkontable Selection instances which describes the state of the visual highlight of the headers corner.
   *
   * @returns {Selection[]}
   */
  getActiveCornerHeaders() {
    return [...this.activeCornerHeaders.values()];
  }

  /**
   * Creates (if not exist in the cache) Walkontable Selection instance created for controlling
   * highlight cells in a row.
   *
   * @returns {Selection}
   */
  createRowHighlight() {
    return _assertClassBrand(_Highlight_brand, this, _createHighlight).call(this, this.rowHighlights, createRowHighlight);
  }

  /**
   * Get all Walkontable Selection instances which describes the state of the rows highlighting.
   *
   * @returns {Selection[]}
   */
  getRowHighlights() {
    return [...this.rowHighlights.values()];
  }

  /**
   * Creates (if not exist in the cache) Walkontable Selection instance created for controlling
   * highlight cells in a column.
   *
   * @returns {Selection}
   */
  createColumnHighlight() {
    return _assertClassBrand(_Highlight_brand, this, _createHighlight).call(this, this.columnHighlights, createColumnHighlight);
  }

  /**
   * Get all Walkontable Selection instances which describes the state of the columns highlighting.
   *
   * @returns {Selection[]}
   */
  getColumnHighlights() {
    return [...this.columnHighlights.values()];
  }

  /**
   * Get Walkontable Selection instance created for controlling highlight of the custom selection functionality.
   *
   * @returns {Selection}
   */
  getCustomSelections() {
    return [...this.customSelections.values()];
  }

  /**
   * Add selection to the custom selection instance. The new selection are added to the end of the selection collection.
   *
   * @param {object} selectionInstance The selection instance.
   */
  addCustomSelection(selectionInstance) {
    this.customSelections.push(createCustomHighlight({
      ...this.options,
      ...selectionInstance
    }));
  }

  /**
   * Perform cleaning visual highlights for the whole table.
   */
  clear() {
    this.focus.clear();
    this.fill.clear();
    arrayEach(this.areas.values(), highlight => void highlight.clear());
    arrayEach(this.layeredAreas.values(), highlight => void highlight.clear());
    arrayEach(this.rowHeaders.values(), highlight => void highlight.clear());
    arrayEach(this.columnHeaders.values(), highlight => void highlight.clear());
    arrayEach(this.activeRowHeaders.values(), highlight => void highlight.clear());
    arrayEach(this.activeColumnHeaders.values(), highlight => void highlight.clear());
    arrayEach(this.activeCornerHeaders.values(), highlight => void highlight.clear());
    arrayEach(this.rowHighlights.values(), highlight => void highlight.clear());
    arrayEach(this.columnHighlights.values(), highlight => void highlight.clear());
  }
  /**
   * This object can be iterate over using `for of` syntax or using internal `arrayEach` helper.
   *
   * @returns {Selection[]}
   */
  [Symbol.iterator]() {
    return [this.focus, this.fill, ...this.areas.values(), ...this.layeredAreas.values(), ...this.rowHeaders.values(), ...this.columnHeaders.values(), ...this.activeRowHeaders.values(), ...this.activeColumnHeaders.values(), ...this.activeCornerHeaders.values(), ...this.rowHighlights.values(), ...this.columnHighlights.values(), ...this.customSelections][Symbol.iterator]();
  }
}
function _createHighlight(cacheMap, highlightFactory) {
  const layerLevel = this.layerLevel;
  if (cacheMap.has(layerLevel)) {
    return cacheMap.get(layerLevel);
  }
  const highlight = highlightFactory({
    layerLevel,
    ...this.options
  });
  cacheMap.set(layerLevel, highlight);
  return highlight;
}
export default Highlight;