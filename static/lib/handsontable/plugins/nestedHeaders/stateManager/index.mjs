import "core-js/modules/es.error.cause.js";
import "core-js/modules/es.array.push.js";
function _classPrivateFieldInitSpec(e, t, a) { _checkPrivateRedeclaration(e, t), t.set(e, a); }
function _checkPrivateRedeclaration(e, t) { if (t.has(e)) throw new TypeError("Cannot initialize the same private elements twice on an object"); }
function _classPrivateFieldSet(s, a, r) { return s.set(_assertClassBrand(s, a), r), r; }
function _classPrivateFieldGet(s, a) { return s.get(_assertClassBrand(s, a)); }
function _assertClassBrand(e, t, n) { if ("function" == typeof e ? e === t : e.has(t)) return arguments.length < 3 ? t : n; throw new TypeError("Private element is not present on this object"); }
import { arrayMap, arrayReduce } from "../../../helpers/array.mjs";
import SourceSettings from "./sourceSettings.mjs";
import HeadersTree from "./headersTree.mjs";
import { triggerNodeModification } from "./nodeModifiers/index.mjs";
import { generateMatrix } from "./matrixGenerator.mjs";
import { TRAVERSAL_DF_PRE } from "../../../utils/dataStructures/tree.mjs";
/**
 * The state manager is a source of truth for nested headers configuration.
 * The state generation process is divided into three stages.
 *
 *   +---------------------+  1. User-defined configuration normalization;
 *   │                     │  The source settings class normalizes and shares API for
 *   │   SourceSettings    │  raw settings passed by the developer. It is only consumed by
 *   │                     │  the header tree module.
 *   +---------------------+
 *             │
 *            \│/
 *   +---------------------+  2. Building a tree structure for validation and easier node manipulation;
 *   │                     │  The header tree generates a tree based on source settings for future
 *   │     HeadersTree     │  node manipulation (such as collapsible columns feature). While generating a tree
 *   │                     │  the source settings is checked to see if the configuration has overlapping headers.
 *   +---------------------+  If `true` the colspan matrix generation is skipped, overlapped headers are not supported.
 *             │
 *            \│/
 *   +---------------------+  3. Matrix generation;
 *   │                     │  Based on built trees the matrix generation is performed. That part of code
 *   │  matrix generation  │  generates an array structure similar to normalized data from the SourceSettings
 *   │                     │  but with the difference that this structure contains column settings which changed
 *   +---------------------+  during runtime (after the tree manipulation) e.q after collapse or expand column.
 *                            That settings describes how the TH element should be modified (colspan attribute,
 *                            CSS classes, etc) for a specific column and layer level.
 *
 * @class StateManager
 */
var _sourceSettings = /*#__PURE__*/new WeakMap();
var _headersTree = /*#__PURE__*/new WeakMap();
var _stateMatrix = /*#__PURE__*/new WeakMap();
export default class StateManager {
  constructor() {
    /**
     * The instance of the source settings class.
     *
     * @private
     * @type {SourceSettings}
     */
    _classPrivateFieldInitSpec(this, _sourceSettings, new SourceSettings());
    /**
     * The instance of the headers tree. The tree is generated after setting new configuration data.
     *
     * @private
     * @type {HeadersTree}
     */
    _classPrivateFieldInitSpec(this, _headersTree, new HeadersTree(_classPrivateFieldGet(_sourceSettings, this)));
    /**
     * Cached matrix which is generated from the tree structure.
     *
     * @private
     * @type {Array[]}
     */
    _classPrivateFieldInitSpec(this, _stateMatrix, [[]]);
  }
  /**
   * Sets a new state for the nested headers plugin based on settings passed
   * directly to the plugin.
   *
   * @param {Array[]} nestedHeadersSettings The user-defined settings.
   * @returns {boolean} Returns `true` if the settings are processed correctly, `false` otherwise.
   */
  setState(nestedHeadersSettings) {
    _classPrivateFieldGet(_sourceSettings, this).setData(nestedHeadersSettings);
    let hasError = false;
    try {
      _classPrivateFieldGet(_headersTree, this).buildTree();
    } catch (ex) {
      _classPrivateFieldGet(_headersTree, this).clear();
      _classPrivateFieldGet(_sourceSettings, this).clear();
      hasError = true;
    }
    _classPrivateFieldSet(_stateMatrix, this, generateMatrix(_classPrivateFieldGet(_headersTree, this).getRoots()));
    return hasError;
  }

  /**
   * Sets columns limit to the state will be trimmed. All headers (colspans) which
   * overlap the column limit will be reduced to keep the structure solid.
   *
   * @param {number} columnsCount The number of columns to limit to.
   */
  setColumnsLimit(columnsCount) {
    _classPrivateFieldGet(_sourceSettings, this).setColumnsLimit(columnsCount);
  }

  /**
   * Merges settings with current plugin state.
   *
   * By default only foreign keys are merged with source state and passed to the tree. But only
   * known keys are exported to matrix.
   *
   * @param {object[]} settings An array of objects to merge with the current source settings.
   *                            It is a requirement that every object has `row` and `col` properties
   *                            which points to the specific header settings object.
   */
  mergeStateWith(settings) {
    const transformedSettings = arrayMap(settings, _ref => {
      let {
        row,
        ...rest
      } = _ref;
      return {
        row: row < 0 ? this.rowCoordsToLevel(row) : row,
        ...rest
      };
    });
    _classPrivateFieldGet(_sourceSettings, this).mergeWith(transformedSettings);
    _classPrivateFieldGet(_headersTree, this).buildTree();
    _classPrivateFieldSet(_stateMatrix, this, generateMatrix(_classPrivateFieldGet(_headersTree, this).getRoots()));
  }

  /**
   * Maps the current state with a callback. For each header settings the callback function
   * is called. If the function returns value that value is merged with the state.
   *
   * By default only foreign keys are merged with source state and passed to the tree. But only
   * known keys are exported to matrix.
   *
   * @param {Function} callback A function that is called for every header source settings.
   *                            Each time the callback is called, the returned value extends
   *                            header settings.
   */
  mapState(callback) {
    _classPrivateFieldGet(_sourceSettings, this).map(callback);
    _classPrivateFieldGet(_headersTree, this).buildTree();
    _classPrivateFieldSet(_stateMatrix, this, generateMatrix(_classPrivateFieldGet(_headersTree, this).getRoots()));
  }

  /**
   * Maps the current tree nodes with a callback. For each node the callback function
   * is called. If the function returns value that value is added to returned array.
   *
   * @param {Function} callback A function that is called for every tree node.
   *                            Each time the callback is called, the returned value is
   *                            added to returned array.
   * @returns {Array}
   */
  mapNodes(callback) {
    return arrayReduce(_classPrivateFieldGet(_headersTree, this).getRoots(), (acc, rootNode) => {
      rootNode.walkDown(node => {
        const result = callback(node.data);
        if (result !== undefined) {
          acc.push(result);
        }
      });
      return acc;
    }, []);
  }

  /**
   * Triggers an action (e.g. "collapse") from the NodeModifiers module. The module
   * modifies a tree structure in such a way as to obtain the correct structure consistent with the
   * called action.
   *
   * @param {string} action An action name to trigger.
   * @param {number} headerLevel Header level index (there is support for negative and positive values).
   * @param {number} columnIndex A visual column index.
   * @returns {object|undefined}
   */
  triggerNodeModification(action, headerLevel, columnIndex) {
    if (headerLevel < 0) {
      headerLevel = this.rowCoordsToLevel(headerLevel);
    }
    const nodeToProcess = _classPrivateFieldGet(_headersTree, this).getNode(headerLevel, columnIndex);
    let actionResult;
    if (nodeToProcess) {
      actionResult = triggerNodeModification(action, nodeToProcess, columnIndex);

      // TODO (perf-tip): Trigger matrix generation once after multiple node modifications.
      _classPrivateFieldSet(_stateMatrix, this, generateMatrix(_classPrivateFieldGet(_headersTree, this).getRoots()));
    }
    return actionResult;
  }

  /**
   * Triggers an action (e.g. "hide-column") from the NodeModifiers module. The action is
   * triggered starting from the lowest header. The module modifies a tree structure in
   * such a way as to obtain the correct structure consistent with the called action.
   *
   * @param {string} action An action name to trigger.
   * @param {number} columnIndex A visual column index.
   * @returns {object|undefined}
   */
  triggerColumnModification(action, columnIndex) {
    return this.triggerNodeModification(action, -1, columnIndex);
  }

  /* eslint-disable jsdoc/require-description-complete-sentence */
  /**
   * @memberof StateManager#
   * @function rowCoordsToLevel
   *
   * Translates row coordinates into header level. The row coordinates counts from -1 to -N
   * and describes headers counting from most closest to most distant from the table.
   * The header levels are counted from 0 to N where 0 describes most distant header
   * from the table.
   *
   *  Row coords             Header level
   *           +--------------+
   *       -3  │ A1 │ A1      │  0
   *           +--------------+
   *       -2  │ B1 │ B2 │ B3 │  1
   *           +--------------+
   *       -1  │ C1 │ C2 │ C3 │  2
   *           +==============+
   *           │    │    │    │
   *           +--------------+
   *           │    │    │    │
   *
   * @param {number} rowIndex A visual row index.
   * @returns {number|null} Returns unsigned number.
   */
  /* eslint-enable jsdoc/require-description-complete-sentence */
  rowCoordsToLevel(rowIndex) {
    if (rowIndex >= 0) {
      return null;
    }
    const headerLevel = rowIndex + Math.max(this.getLayersCount(), 1);
    if (headerLevel < 0) {
      return null;
    }
    return headerLevel;
  }

  /* eslint-disable jsdoc/require-description-complete-sentence */
  /**
   * @memberof StateManager#
   * @function levelToRowCoords
   *
   * Translates header level into row coordinates. The row coordinates counts from -1 to -N
   * and describes headers counting from most closest to most distant from the table.
   * The header levels are counted from 0 to N where 0 describes most distant header
   * from the table.
   *
   *  Header level            Row coords
   *           +--------------+
   *        0  │ A1 │ A1      │  -3
   *           +--------------+
   *        1  │ B1 │ B2 │ B3 │  -2
   *           +--------------+
   *        2  │ C1 │ C2 │ C3 │  -1
   *           +==============+
   *           │    │    │    │
   *           +--------------+
   *           │    │    │    │
   *
   * @param {number} headerLevel Header level index.
   * @returns {number} Returns negative number.
   */
  /* eslint-enable jsdoc/require-description-complete-sentence */
  levelToRowCoords(headerLevel) {
    if (headerLevel < 0) {
      return null;
    }
    const rowIndex = headerLevel - Math.max(this.getLayersCount(), 1);
    if (rowIndex >= 0) {
      return null;
    }
    return rowIndex;
  }

  /**
   * Gets column header settings for a specified column and header index. The returned object contains
   * all information necessary for header renderers. It contains header label, colspan length, or hidden
   * flag.
   *
   * @param {number} headerLevel Header level (there is support for negative and positive values).
   * @param {number} columnIndex A visual column index.
   * @returns {object|null}
   */
  getHeaderSettings(headerLevel, columnIndex) {
    var _classPrivateFieldGet2, _classPrivateFieldGet3;
    if (headerLevel < 0) {
      headerLevel = this.rowCoordsToLevel(headerLevel);
    }
    if (headerLevel === null || headerLevel >= this.getLayersCount()) {
      return null;
    }
    return (_classPrivateFieldGet2 = (_classPrivateFieldGet3 = _classPrivateFieldGet(_stateMatrix, this)[headerLevel]) === null || _classPrivateFieldGet3 === void 0 ? void 0 : _classPrivateFieldGet3[columnIndex]) !== null && _classPrivateFieldGet2 !== void 0 ? _classPrivateFieldGet2 : null;
  }

  /**
   * Gets tree data that is connected to the column header. The returned object contains all information
   * necessary for modifying tree structure (column collapsing, hiding, etc.). It contains a header
   * label, colspan length, or visual column index that indicates which column index the node is rendered from.
   *
   * @param {number} headerLevel Header level (there is support for negative and positive values).
   * @param {number} columnIndex A visual column index.
   * @returns {object|null}
   */
  getHeaderTreeNodeData(headerLevel, columnIndex) {
    const node = this.getHeaderTreeNode(headerLevel, columnIndex);
    if (!node) {
      return null;
    }
    return {
      ...node.data
    };
  }

  /**
   * Gets tree node that is connected to the column header.
   *
   * @param {number} headerLevel Header level (there is support for negative and positive values).
   * @param {number} columnIndex A visual column index.
   * @returns {TreeNode|null}
   */
  getHeaderTreeNode(headerLevel, columnIndex) {
    if (headerLevel < 0) {
      headerLevel = this.rowCoordsToLevel(headerLevel);
    }
    if (headerLevel === null || headerLevel >= this.getLayersCount()) {
      return null;
    }
    const node = _classPrivateFieldGet(_headersTree, this).getNode(headerLevel, columnIndex);
    if (!node) {
      return null;
    }
    return node;
  }

  /**
   * Finds the most top header level of the column header that is rendered entirely within
   * the passed visual columns range. If multiple columns headers are found within the range the
   * most top header level value will be returned.
   *
   * @param {number} columnIndexFrom A visual column index.
   * @param {number} [columnIndexTo] A visual column index.
   * @returns {number} Returns a header level in format -1 to -N.
   */
  findTopMostEntireHeaderLevel(columnIndexFrom) {
    var _headerLevel;
    let columnIndexTo = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : columnIndexFrom;
    const columnsWidth = columnIndexTo - columnIndexFrom + 1;
    let atLeastOneRootFound = false;
    let headerLevel = null;
    for (let columnIndex = columnIndexFrom; columnIndex <= columnIndexTo; columnIndex++) {
      const rootNode = _classPrivateFieldGet(_headersTree, this).getRootByColumn(columnIndex);
      if (!rootNode) {
        break;
      }
      atLeastOneRootFound = true;

      // eslint-disable-next-line
      rootNode.walkDown(node => {
        const {
          columnIndex: nodeColumnIndex,
          headerLevel: nodeHeaderLevel,
          origColspan,
          isHidden
        } = node.data;
        if (isHidden) {
          return;
        }

        // if the header fits entirely within the columns range get and save the node header level
        if (origColspan <= columnsWidth && nodeColumnIndex >= columnIndexFrom && nodeColumnIndex + origColspan - 1 <= columnIndexTo && (headerLevel === null || nodeHeaderLevel < headerLevel)) {
          headerLevel = nodeHeaderLevel;
        }
      }, TRAVERSAL_DF_PRE);
    }
    if (atLeastOneRootFound && headerLevel === null) {
      return -1;
    }
    return this.levelToRowCoords((_headerLevel = headerLevel) !== null && _headerLevel !== void 0 ? _headerLevel : 0);
  }

  /**
   * The method is helpful in cases where the column index targets in-between currently
   * collapsed column. In that case, the method returns the left-most column index
   * where the nested header begins.
   *
   * @param {number} headerLevel Header level (there is support for negative and positive values).
   * @param {number} columnIndex A visual column index.
   * @returns {number}
   */
  findLeftMostColumnIndex(headerLevel, columnIndex) {
    var _this$getHeaderSettin;
    const {
      isRoot
    } = (_this$getHeaderSettin = this.getHeaderSettings(headerLevel, columnIndex)) !== null && _this$getHeaderSettin !== void 0 ? _this$getHeaderSettin : {
      isRoot: true
    };
    if (isRoot) {
      return columnIndex;
    }
    let stepBackColumn = columnIndex - 1;
    while (stepBackColumn >= 0) {
      var _this$getHeaderSettin2;
      const {
        isRoot: isRootNode
      } = (_this$getHeaderSettin2 = this.getHeaderSettings(headerLevel, stepBackColumn)) !== null && _this$getHeaderSettin2 !== void 0 ? _this$getHeaderSettin2 : {
        isRoot: true
      };
      if (isRootNode) {
        break;
      }
      stepBackColumn -= 1;
    }
    return stepBackColumn;
  }

  /**
   * The method is helpful in cases where the column index targets in-between currently
   * collapsed column. In that case, the method returns the right-most column index
   * where the nested header ends.
   *
   * @param {number} headerLevel Header level (there is support for negative and positive values).
   * @param {number} columnIndex A visual column index.
   * @returns {number}
   */
  findRightMostColumnIndex(headerLevel, columnIndex) {
    var _this$getHeaderSettin3;
    const {
      isRoot,
      origColspan
    } = (_this$getHeaderSettin3 = this.getHeaderSettings(headerLevel, columnIndex)) !== null && _this$getHeaderSettin3 !== void 0 ? _this$getHeaderSettin3 : {
      isRoot: true,
      origColspan: 1
    };
    if (isRoot) {
      return columnIndex + origColspan - 1;
    }
    let stepForthColumn = columnIndex + 1;
    while (stepForthColumn < this.getColumnsCount()) {
      var _this$getHeaderSettin4;
      const {
        isRoot: isRootNode
      } = (_this$getHeaderSettin4 = this.getHeaderSettings(headerLevel, stepForthColumn)) !== null && _this$getHeaderSettin4 !== void 0 ? _this$getHeaderSettin4 : {
        isRoot: true
      };
      if (isRootNode) {
        break;
      }
      stepForthColumn += 1;
    }
    return stepForthColumn - 1;
  }

  /**
   * Gets a total number of headers levels.
   *
   * @returns {number}
   */
  getLayersCount() {
    return _classPrivateFieldGet(_sourceSettings, this).getLayersCount();
  }

  /**
   * Gets a total number of columns count.
   *
   * @returns {number}
   */
  getColumnsCount() {
    return _classPrivateFieldGet(_sourceSettings, this).getColumnsCount();
  }

  /**
   * Clears the column state manager to the initial state.
   */
  clear() {
    _classPrivateFieldSet(_stateMatrix, this, []);
    _classPrivateFieldGet(_sourceSettings, this).clear();
    _classPrivateFieldGet(_headersTree, this).clear();
  }
}