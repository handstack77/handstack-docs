import { isObject } from "../../helpers/object.mjs";
/**
 * Creates a renderer object for the `MergeCells` plugin.
 *
 * @private
 * @param {MergeCells} plugin The `MergeCells` plugin instance.
 * @returns {{before: Function, after: Function}}
 */
export function createMergeCellRenderer(plugin) {
  const {
    hot
  } = plugin;
  const {
    rowIndexMapper: rowMapper,
    columnIndexMapper: columnMapper
  } = hot;

  /**
   * Runs before the cell is rendered.
   *
   * @private
   */
  function before() {}

  /**
   * Runs after the cell is rendered.
   *
   * @private
   * @param {HTMLElement} TD The cell to be modified.
   * @param {number} row Row index.
   * @param {number} col Visual column index.
   */
  function after(TD, row, col) {
    const mergedCell = plugin.mergedCellsCollection.get(row, col);
    if (!isObject(mergedCell)) {
      TD.removeAttribute('rowspan');
      TD.removeAttribute('colspan');
      TD.style.display = '';
      return;
    }
    const {
      row: origRow,
      col: origColumn,
      colspan: origColspan,
      rowspan: origRowspan
    } = mergedCell;
    const [lastMergedRowIndex, lastMergedColumnIndex] = plugin.translateMergedCellToRenderable(origRow, origRowspan, origColumn, origColspan);
    const renderedRowIndex = rowMapper.getRenderableFromVisualIndex(row);
    const renderedColumnIndex = columnMapper.getRenderableFromVisualIndex(col);
    const maxRowSpan = lastMergedRowIndex - renderedRowIndex + 1; // Number of rendered columns.
    const maxColSpan = lastMergedColumnIndex - renderedColumnIndex + 1; // Number of rendered columns.

    const notHiddenRow = rowMapper.getNearestNotHiddenIndex(origRow, 1);
    const notHiddenColumn = columnMapper.getNearestNotHiddenIndex(origColumn, 1);
    const notHiddenRowspan = Math.min(origRowspan, maxRowSpan);
    const notHiddenColspan = Math.min(origColspan, maxColSpan);
    if (notHiddenRow === row && notHiddenColumn === col) {
      TD.setAttribute('rowspan', notHiddenRowspan);
      TD.setAttribute('colspan', notHiddenColspan);
    } else {
      TD.removeAttribute('rowspan');
      TD.removeAttribute('colspan');
      TD.style.display = 'none';
    }
  }
  return {
    before,
    after
  };
}