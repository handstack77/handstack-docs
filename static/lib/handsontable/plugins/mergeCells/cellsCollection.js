"use strict";

exports.__esModule = true;
require("core-js/modules/es.error.cause.js");
require("core-js/modules/es.array.push.js");
require("core-js/modules/es.array.unscopables.flat-map.js");
require("core-js/modules/esnext.set.difference.v2.js");
require("core-js/modules/esnext.set.intersection.v2.js");
require("core-js/modules/esnext.set.is-disjoint-from.v2.js");
require("core-js/modules/esnext.set.is-subset-of.v2.js");
require("core-js/modules/esnext.set.is-superset-of.v2.js");
require("core-js/modules/esnext.set.symmetric-difference.v2.js");
require("core-js/modules/esnext.set.union.v2.js");
var _cellCoords = _interopRequireDefault(require("./cellCoords"));
var _number = require("../../helpers/number");
var _console = require("../../helpers/console");
var _array = require("../../helpers/array");
var _templateLiteralTag = require("../../helpers/templateLiteralTag");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
function _classPrivateMethodInitSpec(e, a) { _checkPrivateRedeclaration(e, a), a.add(e); }
function _checkPrivateRedeclaration(e, t) { if (t.has(e)) throw new TypeError("Cannot initialize the same private elements twice on an object"); }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
function _assertClassBrand(e, t, n) { if ("function" == typeof e ? e === t : e.has(t)) return arguments.length < 3 ? t : n; throw new TypeError("Private element is not present on this object"); }
/**
 * Defines a container object for the merged cells.
 *
 * @private
 * @class MergedCellsCollection
 */
var _MergedCellsCollection_brand = /*#__PURE__*/new WeakSet();
class MergedCellsCollection {
  constructor(mergeCellsPlugin) {
    /**
     * Gets the list of the indexes that do not intersect with other merged cells within the provided range.
     *
     * @param {CellRange} range The range to search within.
     * @param {'row' | 'col'} axis The axis to search within.
     * @param {number} scanDirection  The direction to scan the range. `1` for forward, `-1` for backward.
     * @returns {number[]}
     */
    _classPrivateMethodInitSpec(this, _MergedCellsCollection_brand);
    /**
     * Reference to the Merge Cells plugin.
     *
     * @type {MergeCells}
     */
    _defineProperty(this, "plugin", void 0);
    /**
     * Array of merged cells.
     *
     * @type {MergedCellCoords[]}
     */
    _defineProperty(this, "mergedCells", []);
    /**
     * Matrix of cells (row, col) that points to the instances of the MergedCellCoords objects.
     *
     * @type {Array}
     */
    _defineProperty(this, "mergedCellsMatrix", new Map());
    /**
     * The Handsontable instance.
     *
     * @type {Handsontable}
     */
    _defineProperty(this, "hot", void 0);
    this.plugin = mergeCellsPlugin;
    this.hot = mergeCellsPlugin.hot;
  }

  /**
   * Get a warning message for when the declared merged cell data overlaps already existing merged cells.
   *
   * @param {{ row: number, col: number, rowspan: number, colspan: number }} mergedCell Object containing information
   * about the merged cells that was about to be added.
   * @returns {string}
   */
  static IS_OVERLAPPING_WARNING(_ref) {
    let {
      row,
      col
    } = _ref;
    return (0, _templateLiteralTag.toSingleLine)`The merged cell declared at [${row}, ${col}], overlaps\x20
      with the other declared merged cell. The overlapping merged cell was not added to the table, please\x20
      fix your setup.`;
  }

  /**
   * Get a merged cell from the container, based on the provided arguments. You can provide either the "starting coordinates"
   * of a merged cell, or any coordinates from the body of the merged cell.
   *
   * @param {number} row Row index.
   * @param {number} column Column index.
   * @returns {MergedCellCoords|boolean} Returns a wanted merged cell on success and `false` on failure.
   */
  get(row, column) {
    var _this$mergedCellsMatr;
    if (!this.mergedCellsMatrix.has(row)) {
      return false;
    }
    return (_this$mergedCellsMatr = this.mergedCellsMatrix.get(row).get(column)) !== null && _this$mergedCellsMatr !== void 0 ? _this$mergedCellsMatr : false;
  }

  /**
   * Get the first-found merged cell containing the provided range.
   *
   * @param {CellRange|object} range The range to search merged cells for.
   * @returns {MergedCellCoords|boolean}
   */
  getByRange(range) {
    let result = false;
    (0, _array.arrayEach)(this.mergedCells, mergedCell => {
      if (mergedCell.row <= range.from.row && mergedCell.row + mergedCell.rowspan - 1 >= range.to.row && mergedCell.col <= range.from.col && mergedCell.col + mergedCell.colspan - 1 >= range.to.col) {
        result = mergedCell;
        return result;
      }
      return true;
    });
    return result;
  }

  /**
   * Filters merge cells objects provided by users from overlapping cells.
   *
   * @param {{ row: number, col: number, rowspan: number, colspan: number }} mergedCellsInfo The merged cell information object.
   * Has to contain `row`, `col`, `colspan` and `rowspan` properties.
   * @returns {Array<{ row: number, col: number, rowspan: number, colspan: number }>}
   */
  filterOverlappingMergeCells(mergedCellsInfo) {
    const occupiedCells = new Set();
    this.mergedCells.forEach(mergedCell => {
      const {
        row,
        col,
        colspan,
        rowspan
      } = mergedCell;
      for (let r = row; r < row + rowspan; r++) {
        for (let c = col; c < col + colspan; c++) {
          occupiedCells.add(`r${r},c${c}`);
        }
      }
    });
    const filteredMergeCells = mergedCellsInfo.filter(mergedCell => {
      const {
        row,
        col,
        colspan,
        rowspan
      } = mergedCell;
      const localOccupiedCells = new Set();
      let isOverlapping = false;
      for (let r = row; r < row + rowspan; r++) {
        for (let c = col; c < col + colspan; c++) {
          const cellId = `r${r},c${c}`;
          if (occupiedCells.has(cellId)) {
            (0, _console.warn)(MergedCellsCollection.IS_OVERLAPPING_WARNING(mergedCell));
            isOverlapping = true;
            break;
          }
          localOccupiedCells.add(cellId);
        }
        if (isOverlapping) {
          break;
        }
      }
      if (!isOverlapping) {
        occupiedCells.add(...localOccupiedCells);
      }
      return !isOverlapping;
    });
    return filteredMergeCells;
  }

  /**
   * Get a merged cell contained in the provided range.
   *
   * @param {CellRange} range The range to search merged cells in.
   * @param {boolean} [countPartials=false] If set to `true`, all the merged cells overlapping the range will be taken into calculation.
   * @returns {MergedCellCoords[]} Array of found merged cells.
   */
  getWithinRange(range) {
    let countPartials = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
    const {
      row: rowStart,
      col: columnStart
    } = range.getTopStartCorner();
    const {
      row: rowEnd,
      col: columnEnd
    } = range.getBottomEndCorner();
    const result = [];
    for (let row = rowStart; row <= rowEnd; row++) {
      for (let column = columnStart; column <= columnEnd; column++) {
        const mergedCell = this.get(row, column);
        if (mergedCell && (countPartials || !countPartials && mergedCell.row === row && mergedCell.col === column)) {
          result.push(mergedCell);
        }
      }
    }
    return result;
  }

  /**
   * Add a merged cell to the container.
   *
   * @param {object} mergedCellInfo The merged cell information object. Has to contain `row`, `col`, `colspan` and `rowspan` properties.
   * @param {boolean} [auto=false] `true` if called internally by the plugin (usually in batch).
   * @returns {MergedCellCoords|boolean} Returns the new merged cell on success and `false` on failure.
   */
  add(mergedCellInfo) {
    let auto = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
    const row = mergedCellInfo.row;
    const column = mergedCellInfo.col;
    const rowspan = mergedCellInfo.rowspan;
    const colspan = mergedCellInfo.colspan;
    const newMergedCell = new _cellCoords.default(row, column, rowspan, colspan, this.hot._createCellCoords, this.hot._createCellRange);
    const alreadyExists = this.get(row, column);
    const isOverlapping = auto ? false : this.isOverlapping(newMergedCell);
    if (!alreadyExists && !isOverlapping) {
      if (this.hot) {
        newMergedCell.normalize(this.hot);
      }
      this.mergedCells.push(newMergedCell);
      _assertClassBrand(_MergedCellsCollection_brand, this, _addMergedCellToMatrix).call(this, newMergedCell);
      return newMergedCell;
    }
    (0, _console.warn)(MergedCellsCollection.IS_OVERLAPPING_WARNING(newMergedCell));
    return false;
  }

  /**
   * Remove a merged cell from the container. You can provide either the "starting coordinates"
   * of a merged cell, or any coordinates from the body of the merged cell.
   *
   * @param {number} row Row index.
   * @param {number} column Column index.
   * @returns {MergedCellCoords|boolean} Returns the removed merged cell on success and `false` on failure.
   */
  remove(row, column) {
    const mergedCell = this.get(row, column);
    const mergedCellIndex = mergedCell ? this.mergedCells.indexOf(mergedCell) : -1;
    if (mergedCell && mergedCellIndex !== -1) {
      this.mergedCells.splice(mergedCellIndex, 1);
      _assertClassBrand(_MergedCellsCollection_brand, this, _removeMergedCellFromMatrix).call(this, mergedCell);
      return mergedCell;
    }
    return false;
  }

  /**
   * Clear all the merged cells.
   */
  clear() {
    (0, _array.arrayEach)(this.mergedCells, _ref2 => {
      let {
        row,
        col,
        rowspan,
        colspan
      } = _ref2;
      (0, _number.rangeEach)(row, row + rowspan, r => {
        (0, _number.rangeEach)(col, col + colspan, c => {
          const TD = this.hot.getCell(r, c);
          if (TD) {
            TD.removeAttribute('rowspan');
            TD.removeAttribute('colspan');
            TD.style.display = '';
          }
        });
      });
    });
    this.mergedCells.length = 0;
    this.mergedCellsMatrix = new Map();
  }

  /**
   * Check if the provided merged cell overlaps with the others already added.
   *
   * @param {MergedCellCoords} mergedCell The merged cell to check against all others in the container.
   * @returns {boolean} `true` if the provided merged cell overlaps with the others, `false` otherwise.
   */
  isOverlapping(mergedCell) {
    const mergedCellRange = mergedCell.getRange();
    for (let i = 0; i < this.mergedCells.length; i++) {
      const otherMergedCell = this.mergedCells[i];
      const otherMergedCellRange = otherMergedCell.getRange();
      if (otherMergedCellRange.overlaps(mergedCellRange)) {
        return true;
      }
    }
    return false;
  }

  /**
   * Check whether the provided row/col coordinates direct to a first not hidden cell within merge area.
   *
   * @param {number} row Visual row index.
   * @param {number} column Visual column index.
   * @returns {boolean}
   */
  isFirstRenderableMergedCell(row, column) {
    const mergeParent = this.get(row, column);

    // Return if row and column indexes are within merge area and if they are first rendered indexes within the area.
    return mergeParent && this.hot.rowIndexMapper.getNearestNotHiddenIndex(mergeParent.row, 1) === row && this.hot.columnIndexMapper.getNearestNotHiddenIndex(mergeParent.col, 1) === column;
  }

  /**
   * Get the first renderable coords of the merged cell at the provided coordinates.
   *
   * @param {number} row Visual row index.
   * @param {number} column Visual column index.
   * @returns {CellCoords} A `CellCoords` object with the coordinates to the first renderable cell within the
   *                        merged cell.
   */
  getFirstRenderableCoords(row, column) {
    const mergeParent = this.get(row, column);
    if (!mergeParent || this.isFirstRenderableMergedCell(row, column)) {
      return this.hot._createCellCoords(row, column);
    }
    const firstRenderableRow = this.hot.rowIndexMapper.getNearestNotHiddenIndex(mergeParent.row, 1);
    const firstRenderableColumn = this.hot.columnIndexMapper.getNearestNotHiddenIndex(mergeParent.col, 1);
    return this.hot._createCellCoords(firstRenderableRow, firstRenderableColumn);
  }

  /**
   * Gets the start-most visual column index that do not intersect with other merged cells within the provided range.
   *
   * @param {CellRange} range The range to search within.
   * @param {number} visualColumnIndex The visual column index to start the search from.
   * @returns {number}
   */
  getStartMostColumnIndex(range, visualColumnIndex) {
    const indexes = _assertClassBrand(_MergedCellsCollection_brand, this, _getNonIntersectingIndexes).call(this, range, 'col', -1);
    let startMostIndex = visualColumnIndex;
    for (let i = 0; i < indexes.length; i++) {
      if (indexes[i] <= visualColumnIndex) {
        startMostIndex = indexes[i];
        break;
      }
    }
    return startMostIndex;
  }

  /**
   * Gets the end-most visual column index that do not intersect with other merged cells within the provided range.
   *
   * @param {CellRange} range The range to search within.
   * @param {number} visualColumnIndex The visual column index to start the search from.
   * @returns {number}
   */
  getEndMostColumnIndex(range, visualColumnIndex) {
    const indexes = _assertClassBrand(_MergedCellsCollection_brand, this, _getNonIntersectingIndexes).call(this, range, 'col', 1);
    let endMostIndex = visualColumnIndex;
    for (let i = 0; i < indexes.length; i++) {
      if (indexes[i] >= visualColumnIndex) {
        endMostIndex = indexes[i];
        break;
      }
    }
    return endMostIndex;
  }

  /**
   * Gets the top-most visual row index that do not intersect with other merged cells within the provided range.
   *
   * @param {CellRange} range The range to search within.
   * @param {number} visualRowIndex The visual row index to start the search from.
   * @returns {number}
   */
  getTopMostRowIndex(range, visualRowIndex) {
    const indexes = _assertClassBrand(_MergedCellsCollection_brand, this, _getNonIntersectingIndexes).call(this, range, 'row', -1);
    let topMostIndex = visualRowIndex;
    for (let i = 0; i < indexes.length; i++) {
      if (indexes[i] <= visualRowIndex) {
        topMostIndex = indexes[i];
        break;
      }
    }
    return topMostIndex;
  }

  /**
   * Gets the bottom-most visual row index that do not intersect with other merged cells within the provided range.
   *
   * @param {CellRange} range The range to search within.
   * @param {number} visualRowIndex The visual row index to start the search from.
   * @returns {number}
   */
  getBottomMostRowIndex(range, visualRowIndex) {
    const indexes = _assertClassBrand(_MergedCellsCollection_brand, this, _getNonIntersectingIndexes).call(this, range, 'row', 1);
    let bottomMostIndex = visualRowIndex;
    for (let i = 0; i < indexes.length; i++) {
      if (indexes[i] >= visualRowIndex) {
        bottomMostIndex = indexes[i];
        break;
      }
    }
    return bottomMostIndex;
  }
  /**
   * Shift the merged cell in the direction and by an offset defined in the arguments.
   *
   * @param {string} direction `right`, `left`, `up` or `down`.
   * @param {number} index Index where the change, which caused the shifting took place.
   * @param {number} count Number of rows/columns added/removed in the preceding action.
   */
  shiftCollections(direction, index, count) {
    const shiftVector = [0, 0];
    switch (direction) {
      case 'right':
        shiftVector[0] += count;
        break;
      case 'left':
        shiftVector[0] -= count;
        break;
      case 'down':
        shiftVector[1] += count;
        break;
      case 'up':
        shiftVector[1] -= count;
        break;
      default:
    }
    (0, _array.arrayEach)(this.mergedCells, currentMerge => {
      _assertClassBrand(_MergedCellsCollection_brand, this, _removeMergedCellFromMatrix).call(this, currentMerge);
      currentMerge.shift(shiftVector, index);
      _assertClassBrand(_MergedCellsCollection_brand, this, _addMergedCellToMatrix).call(this, currentMerge);
    });
    (0, _number.rangeEachReverse)(this.mergedCells.length - 1, 0, i => {
      const currentMerge = this.mergedCells[i];
      if (currentMerge && currentMerge.removed) {
        this.mergedCells.splice(this.mergedCells.indexOf(currentMerge), 1);
        _assertClassBrand(_MergedCellsCollection_brand, this, _removeMergedCellFromMatrix).call(this, currentMerge);
      }
    });
  }

  /**
   * Adds a merged cell to the matrix.
   *
   * @param {MergedCellCoords} mergedCell The merged cell to add.
   */
}
function _getNonIntersectingIndexes(range, axis) {
  let scanDirection = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 1;
  const indexes = new Map();
  const from = scanDirection === 1 ? range.getTopStartCorner() : range.getBottomEndCorner();
  const to = scanDirection === 1 ? range.getBottomEndCorner() : range.getTopStartCorner();
  for (let row = from.row; scanDirection === 1 ? row <= to.row : row >= to.row; row += scanDirection) {
    for (let column = from.col; scanDirection === 1 ? column <= to.col : column >= to.col; column += scanDirection) {
      const index = axis === 'row' ? row : column;
      const mergedCell = this.get(row, column);
      let lastIndex = index;
      if (mergedCell) {
        lastIndex = scanDirection === 1 ? mergedCell[axis] + mergedCell[`${axis}span`] - 1 : mergedCell[axis];
      }
      if (!indexes.has(index)) {
        indexes.set(index, new Set());
      }
      indexes.get(index).add(lastIndex);
    }
  }
  return Array.from(new Set(Array.from(indexes.entries()).filter(_ref3 => {
    let [, set] = _ref3;
    return set.size === 1;
  }).flatMap(_ref4 => {
    let [, set] = _ref4;
    return Array.from(set);
  })));
}
function _addMergedCellToMatrix(mergedCell) {
  for (let row = mergedCell.row; row < mergedCell.row + mergedCell.rowspan; row++) {
    for (let col = mergedCell.col; col < mergedCell.col + mergedCell.colspan; col++) {
      if (!this.mergedCellsMatrix.has(row)) {
        this.mergedCellsMatrix.set(row, new Map());
      }
      this.mergedCellsMatrix.get(row).set(col, mergedCell);
    }
  }
}
/**
 * Removes a merged cell from the matrix.
 *
 * @param {MergedCellCoords} mergedCell The merged cell to remove.
 */
function _removeMergedCellFromMatrix(mergedCell) {
  for (let row = mergedCell.row; row < mergedCell.row + mergedCell.rowspan; row++) {
    for (let col = mergedCell.col; col < mergedCell.col + mergedCell.colspan; col++) {
      this.mergedCellsMatrix.get(row).delete(col);
    }
  }
}
var _default = exports.default = MergedCellsCollection;