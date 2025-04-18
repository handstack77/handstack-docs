import "core-js/modules/es.error.cause.js";
import "core-js/modules/es.array.push.js";
import "core-js/modules/es.array.unscopables.flat.js";
function _classPrivateMethodInitSpec(e, a) { _checkPrivateRedeclaration(e, a), a.add(e); }
function _classPrivateFieldInitSpec(e, t, a) { _checkPrivateRedeclaration(e, t), t.set(e, a); }
function _checkPrivateRedeclaration(e, t) { if (t.has(e)) throw new TypeError("Cannot initialize the same private elements twice on an object"); }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
function _classPrivateFieldSet(s, a, r) { return s.set(_assertClassBrand(s, a), r), r; }
function _classPrivateFieldGet(s, a) { return s.get(_assertClassBrand(s, a)); }
function _assertClassBrand(e, t, n) { if ("function" == typeof e ? e === t : e.has(t)) return arguments.length < 3 ? t : n; throw new TypeError("Private element is not present on this object"); }
import { BasePlugin } from "../base/index.mjs";
import { arrayEach, arrayMap } from "../../helpers/array.mjs";
import { toSingleLine } from "../../helpers/templateLiteralTag.mjs";
import { warn } from "../../helpers/console.mjs";
import { rangeEach } from "../../helpers/number.mjs";
import { addClass, removeClass } from "../../helpers/dom/element.mjs";
import { isKey } from "../../helpers/unicode.mjs";
import { SEPARATOR } from "../contextMenu/predefinedItems/index.mjs";
import * as constants from "../../i18n/constants.mjs";
import { ConditionComponent } from "./component/condition.mjs";
import { OperatorsComponent } from "./component/operators.mjs";
import { ValueComponent } from "./component/value.mjs";
import { ActionBarComponent } from "./component/actionBar.mjs";
import ConditionCollection from "./conditionCollection.mjs";
import DataFilter from "./dataFilter.mjs";
import ConditionUpdateObserver from "./conditionUpdateObserver.mjs";
import { createArrayAssertion, toEmptyString, unifyColumnValues } from "./utils.mjs";
import { createMenuFocusController } from "./menu/focusController.mjs";
import { CONDITION_NONE, CONDITION_BY_VALUE, OPERATION_AND, OPERATION_OR, OPERATION_OR_THEN_VARIABLE } from "./constants.mjs";
import { TrimmingMap } from "../../translations/index.mjs";
export const PLUGIN_KEY = 'filters';
export const PLUGIN_PRIORITY = 250;
const SHORTCUTS_GROUP = PLUGIN_KEY;

/**
 * @plugin Filters
 * @class Filters
 *
 * @description
 * The plugin allows filtering the table data either by the built-in component or with the API.
 *
 * See [the filtering demo](@/guides/columns/column-filter/column-filter.md) for examples.
 *
 * @example
 * ::: only-for javascript
 * ```js
 * const container = document.getElementById('example');
 * const hot = new Handsontable(container, {
 *   data: getData(),
 *   colHeaders: true,
 *   rowHeaders: true,
 *   dropdownMenu: true,
 *   filters: true
 * });
 * ```
 * :::
 *
 * ::: only-for react
 * ```jsx
 * <HotTable
 *   data={getData()}
 *   colHeaders={true}
 *   rowHeaders={true}
 *   dropdownMenu={true}
 *   filters={true}
 * />
 * ```
 * :::
 */
var _menuFocusNavigator = /*#__PURE__*/new WeakMap();
var _Filters_brand = /*#__PURE__*/new WeakSet();
export class Filters extends BasePlugin {
  static get PLUGIN_KEY() {
    return PLUGIN_KEY;
  }
  static get PLUGIN_PRIORITY() {
    return PLUGIN_PRIORITY;
  }
  static get PLUGIN_DEPS() {
    return ['plugin:DropdownMenu', 'plugin:HiddenRows', 'cell-type:checkbox'];
  }

  /**
   * Instance of {@link DropdownMenu}.
   *
   * @private
   * @type {DropdownMenu}
   */

  constructor(hotInstance) {
    super(hotInstance);
    // One listener for the enable/disable functionality
    /**
     * `afterChange` listener.
     *
     * @param {Array} changes Array of changes.
     */
    _classPrivateMethodInitSpec(this, _Filters_brand);
    _defineProperty(this, "dropdownMenuPlugin", null);
    /**
     * Instance of {@link ConditionCollection}.
     *
     * @private
     * @type {ConditionCollection}
     */
    _defineProperty(this, "conditionCollection", null);
    /**
     * Instance of {@link ConditionUpdateObserver}.
     *
     * @private
     * @type {ConditionUpdateObserver}
     */
    _defineProperty(this, "conditionUpdateObserver", null);
    /**
     * Map, where key is component identifier and value represent `BaseComponent` element or it derivatives.
     *
     * @private
     * @type {Map}
     */
    _defineProperty(this, "components", new Map([['filter_by_condition', null], ['filter_operators', null], ['filter_by_condition2', null], ['filter_by_value', null], ['filter_action_bar', null]]));
    /**
     * Map of skipped rows by plugin.
     *
     * @private
     * @type {null|TrimmingMap}
     */
    _defineProperty(this, "filtersRowsMap", null);
    /**
     * Menu focus navigator allows switching the focus position through Tab and Shift Tab keys.
     *
     * @type {MenuFocusNavigator|undefined}
     */
    _classPrivateFieldInitSpec(this, _menuFocusNavigator, void 0);
    this.hot.addHook('afterGetColHeader', (col, TH) => _assertClassBrand(_Filters_brand, this, _onAfterGetColHeader).call(this, col, TH));
  }

  /**
   * Checks if the plugin is enabled in the handsontable settings. This method is executed in {@link Hooks#beforeInit}
   * hook and if it returns `true` then the {@link Filters#enablePlugin} method is called.
   *
   * @returns {boolean}
   */
  isEnabled() {
    /* eslint-disable no-unneeded-ternary */
    return this.hot.getSettings()[PLUGIN_KEY] ? true : false;
  }

  /**
   * Enables the plugin functionality for this Handsontable instance.
   */
  enablePlugin() {
    if (this.enabled) {
      return;
    }
    this.filtersRowsMap = this.hot.rowIndexMapper.registerMap(this.pluginName, new TrimmingMap());
    this.dropdownMenuPlugin = this.hot.getPlugin('dropdownMenu');
    const dropdownSettings = this.hot.getSettings().dropdownMenu;
    const menuContainer = dropdownSettings && dropdownSettings.uiContainer || this.hot.rootDocument.body;
    const addConfirmationHooks = component => {
      component.addLocalHook('accept', () => _assertClassBrand(_Filters_brand, this, _onActionBarSubmit).call(this, 'accept'));
      component.addLocalHook('cancel', () => _assertClassBrand(_Filters_brand, this, _onActionBarSubmit).call(this, 'cancel'));
      component.addLocalHook('change', command => _assertClassBrand(_Filters_brand, this, _onComponentChange).call(this, component, command));
      return component;
    };
    const filterByConditionLabel = () => `${this.hot.getTranslatedPhrase(constants.FILTERS_DIVS_FILTER_BY_CONDITION)}:`;
    const filterValueLabel = () => `${this.hot.getTranslatedPhrase(constants.FILTERS_DIVS_FILTER_BY_VALUE)}:`;
    if (!this.components.get('filter_by_condition')) {
      const conditionComponent = new ConditionComponent(this.hot, {
        id: 'filter_by_condition',
        name: filterByConditionLabel,
        addSeparator: false,
        menuContainer
      });
      conditionComponent.addLocalHook('afterClose', () => _assertClassBrand(_Filters_brand, this, _onSelectUIClosed).call(this));
      this.components.set('filter_by_condition', addConfirmationHooks(conditionComponent));
    }
    if (!this.components.get('filter_operators')) {
      this.components.set('filter_operators', new OperatorsComponent(this.hot, {
        id: 'filter_operators',
        name: 'Operators'
      }));
    }
    if (!this.components.get('filter_by_condition2')) {
      const conditionComponent = new ConditionComponent(this.hot, {
        id: 'filter_by_condition2',
        name: '',
        addSeparator: true,
        menuContainer
      });
      conditionComponent.addLocalHook('afterClose', () => _assertClassBrand(_Filters_brand, this, _onSelectUIClosed).call(this));
      this.components.set('filter_by_condition2', addConfirmationHooks(conditionComponent));
    }
    if (!this.components.get('filter_by_value')) {
      this.components.set('filter_by_value', addConfirmationHooks(new ValueComponent(this.hot, {
        id: 'filter_by_value',
        name: filterValueLabel
      })));
    }
    if (!this.components.get('filter_action_bar')) {
      this.components.set('filter_action_bar', addConfirmationHooks(new ActionBarComponent(this.hot, {
        id: 'filter_action_bar',
        name: 'Action bar'
      })));
    }
    if (!this.conditionCollection) {
      this.conditionCollection = new ConditionCollection(this.hot);
    }
    if (!this.conditionUpdateObserver) {
      this.conditionUpdateObserver = new ConditionUpdateObserver(this.hot, this.conditionCollection, physicalColumn => this.getDataMapAtColumn(physicalColumn));
      this.conditionUpdateObserver.addLocalHook('update', conditionState => _assertClassBrand(_Filters_brand, this, _updateComponents).call(this, conditionState));
    }
    this.components.forEach(component => component.show());
    this.addHook('afterDropdownMenuDefaultOptions', defaultOptions => _assertClassBrand(_Filters_brand, this, _onAfterDropdownMenuDefaultOptions).call(this, defaultOptions));
    this.addHook('afterDropdownMenuShow', () => _assertClassBrand(_Filters_brand, this, _onAfterDropdownMenuShow).call(this));
    this.addHook('afterDropdownMenuHide', () => _assertClassBrand(_Filters_brand, this, _onAfterDropdownMenuHide).call(this));
    this.addHook('afterChange', changes => _assertClassBrand(_Filters_brand, this, _onAfterChange).call(this, changes));

    // Temp. solution (extending menu items bug in contextMenu/dropdownMenu)
    if (this.hot.getSettings().dropdownMenu && this.dropdownMenuPlugin) {
      this.dropdownMenuPlugin.disablePlugin();
      this.dropdownMenuPlugin.enablePlugin();
    }
    if (!_classPrivateFieldGet(_menuFocusNavigator, this) && this.dropdownMenuPlugin.enabled) {
      const mainMenu = this.dropdownMenuPlugin.menu;
      const focusableItems = [
      // A fake menu item that once focused allows escaping from the focus navigation (using Tab keys)
      // to the menu navigation using arrow keys.
      {
        focus: () => {
          const menuNavigator = mainMenu.getNavigator();
          const lastSelectedMenuItem = _classPrivateFieldGet(_menuFocusNavigator, this).getLastMenuPage();
          mainMenu.focus();
          if (lastSelectedMenuItem > 0) {
            menuNavigator.setCurrentPage(lastSelectedMenuItem);
          } else {
            menuNavigator.toFirstItem();
          }
        }
      }, ...Array.from(this.components).map(_ref => {
        let [, component] = _ref;
        return component.getElements();
      }).flat()];
      _classPrivateFieldSet(_menuFocusNavigator, this, createMenuFocusController(mainMenu, focusableItems));
      const forwardToFocusNavigation = event => {
        _classPrivateFieldGet(_menuFocusNavigator, this).listen();
        event.preventDefault();
        if (isKey(event.keyCode, 'TAB')) {
          if (event.shiftKey) {
            _classPrivateFieldGet(_menuFocusNavigator, this).toPreviousItem();
          } else {
            _classPrivateFieldGet(_menuFocusNavigator, this).toNextItem();
          }
        }
      };
      this.components.get('filter_by_value').addLocalHook('listTabKeydown', forwardToFocusNavigation);
      this.components.get('filter_by_condition').addLocalHook('selectTabKeydown', forwardToFocusNavigation);
    }
    this.registerShortcuts();
    super.enablePlugin();
  }

  /**
   * Disables the plugin functionality for this Handsontable instance.
   */
  disablePlugin() {
    if (this.enabled) {
      var _this$dropdownMenuPlu;
      if ((_this$dropdownMenuPlu = this.dropdownMenuPlugin) !== null && _this$dropdownMenuPlu !== void 0 && _this$dropdownMenuPlu.enabled) {
        this.dropdownMenuPlugin.menu.clearLocalHooks();
      }
      this.components.forEach((component, key) => {
        component.destroy();
        this.components.set(key, null);
      });
      this.conditionCollection.destroy();
      this.conditionCollection = null;
      this.hot.rowIndexMapper.unregisterMap(this.pluginName);
    }
    this.unregisterShortcuts();
    super.disablePlugin();
  }

  /**
   * Register shortcuts responsible for clearing the filters.
   *
   * @private
   */
  registerShortcuts() {
    this.hot.getShortcutManager().getContext('grid').addShortcut({
      keys: [['Alt', 'A']],
      stopPropagation: true,
      callback: () => {
        const selection = this.hot.getSelected();
        this.clearConditions();
        this.filter();
        if (selection) {
          this.hot.selectCells(selection);
        }
      },
      group: SHORTCUTS_GROUP
    });
  }

  /**
   * Unregister shortcuts responsible for clearing the filters.
   *
   * @private
   */
  unregisterShortcuts() {
    this.hot.getShortcutManager().getContext('grid').removeShortcutsByGroup(SHORTCUTS_GROUP);
  }

  /* eslint-disable jsdoc/require-description-complete-sentence */
  /**
   * @memberof Filters#
   * @function addCondition
   * @description
   * Adds condition to the conditions collection at specified column index.
   *
   * Possible predefined conditions:
   *  * `begins_with` - Begins with
   *  * `between` - Between
   *  * `by_value` - By value
   *  * `contains` - Contains
   *  * `date_after` - After a date
   *  * `date_before` - Before a date
   *  * `date_today` - Today
   *  * `date_tomorrow` - Tomorrow
   *  * `date_yesterday` - Yesterday
   *  * `empty` - Empty
   *  * `ends_with` - Ends with
   *  * `eq` - Equal
   *  * `gt` - Greater than
   *  * `gte` - Greater than or equal
   *  * `lt` - Less than
   *  * `lte` - Less than or equal
   *  * `none` - None (no filter)
   *  * `not_between` - Not between
   *  * `not_contains` - Not contains
   *  * `not_empty` - Not empty
   *  * `neq` - Not equal.
   *
   * Possible operations on collection of conditions:
   *  * `conjunction` - [**Conjunction**](https://en.wikipedia.org/wiki/Logical_conjunction) on conditions collection (by default), i.e. for such operation: <br/> c1 AND c2 AND c3 AND c4 ... AND cn === TRUE, where c1 ... cn are conditions.
   *  * `disjunction` - [**Disjunction**](https://en.wikipedia.org/wiki/Logical_disjunction) on conditions collection, i.e. for such operation: <br/> c1 OR c2 OR c3 OR c4 ... OR cn === TRUE, where c1, c2, c3, c4 ... cn are conditions.
   *  * `disjunctionWithExtraCondition` - **Disjunction** on first `n - 1`\* conditions from collection with an extra requirement computed from the last condition, i.e. for such operation: <br/> c1 OR c2 OR c3 OR c4 ... OR cn-1 AND cn === TRUE, where c1, c2, c3, c4 ... cn are conditions.
   *
   * \* when `n` is collection size; it's used i.e. for one operation introduced from UI (when choosing from filter's drop-down menu two conditions with OR operator between them, mixed with choosing values from the multiple choice select)
   *
   * **Note**: Mind that you cannot mix different types of operations (for instance, if you use `conjunction`, use it consequently for a particular column).
   *
   * @example
   * ::: only-for javascript
   * ```js
   * const container = document.getElementById('example');
   * const hot = new Handsontable(container, {
   *   data: getData(),
   *   filters: true
   * });
   *
   * // access to filters plugin instance
   * const filtersPlugin = hot.getPlugin('filters');
   *
   * // add filter "Greater than" 95 to column at index 1
   * filtersPlugin.addCondition(1, 'gt', [95]);
   * filtersPlugin.filter();
   *
   * // add filter "By value" to column at index 1
   * // in this case all value's that don't match will be filtered.
   * filtersPlugin.addCondition(1, 'by_value', [['ing', 'ed', 'as', 'on']]);
   * filtersPlugin.filter();
   *
   * // add filter "Begins with" with value "de" AND "Not contains" with value "ing"
   * filtersPlugin.addCondition(1, 'begins_with', ['de'], 'conjunction');
   * filtersPlugin.addCondition(1, 'not_contains', ['ing'], 'conjunction');
   * filtersPlugin.filter();
   *
   * // add filter "Begins with" with value "de" OR "Not contains" with value "ing"
   * filtersPlugin.addCondition(1, 'begins_with', ['de'], 'disjunction');
   * filtersPlugin.addCondition(1, 'not_contains', ['ing'], 'disjunction');
   * filtersPlugin.filter();
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
   *   filters={true}
   * />
   *
   * // access to filters plugin instance
   * const hot = hotRef.current.hotInstance;
   * const filtersPlugin = hot.getPlugin('filters');
   *
   * // add filter "Greater than" 95 to column at index 1
   * filtersPlugin.addCondition(1, 'gt', [95]);
   * filtersPlugin.filter();
   *
   * // add filter "By value" to column at index 1
   * // in this case all value's that don't match will be filtered.
   * filtersPlugin.addCondition(1, 'by_value', [['ing', 'ed', 'as', 'on']]);
   * filtersPlugin.filter();
   *
   * // add filter "Begins with" with value "de" AND "Not contains" with value "ing"
   * filtersPlugin.addCondition(1, 'begins_with', ['de'], 'conjunction');
   * filtersPlugin.addCondition(1, 'not_contains', ['ing'], 'conjunction');
   * filtersPlugin.filter();
   *
   * // add filter "Begins with" with value "de" OR "Not contains" with value "ing"
   * filtersPlugin.addCondition(1, 'begins_with', ['de'], 'disjunction');
   * filtersPlugin.addCondition(1, 'not_contains', ['ing'], 'disjunction');
   * filtersPlugin.filter();
   * ```
   * :::
   *
   * @param {number} column Visual column index.
   * @param {string} name Condition short name.
   * @param {Array} args Condition arguments.
   * @param {string} [operationId=conjunction] `id` of operation which is performed on the column.
   */
  /* eslint-enable jsdoc/require-description-complete-sentence */
  addCondition(column, name, args) {
    let operationId = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : OPERATION_AND;
    const physicalColumn = this.hot.toPhysicalColumn(column);
    this.conditionCollection.addCondition(physicalColumn, {
      command: {
        key: name
      },
      args
    }, operationId);
  }

  /**
   * Removes conditions at specified column index.
   *
   * @param {number} column Visual column index.
   */
  removeConditions(column) {
    const physicalColumn = this.hot.toPhysicalColumn(column);
    this.conditionCollection.removeConditions(physicalColumn);
  }

  /**
   * Clears all conditions previously added to the collection for the specified column index or, if the column index
   * was not passed, clear the conditions for all columns.
   *
   * @param {number} [column] Visual column index.
   */
  clearConditions(column) {
    if (column === undefined) {
      this.conditionCollection.clean();
    } else {
      const physicalColumn = this.hot.toPhysicalColumn(column);
      this.conditionCollection.removeConditions(physicalColumn);
    }
  }

  /**
   * Filters data based on added filter conditions.
   *
   * @fires Hooks#beforeFilter
   * @fires Hooks#afterFilter
   */
  filter() {
    const {
      navigableHeaders
    } = this.hot.getSettings();
    const dataFilter = this._createDataFilter();
    const needToFilter = !this.conditionCollection.isEmpty();
    let visibleVisualRows = [];
    const conditions = this.conditionCollection.exportAllConditions();
    const allowFiltering = this.hot.runHooks('beforeFilter', conditions);
    if (allowFiltering !== false) {
      if (needToFilter) {
        const trimmedRows = [];
        this.hot.batchExecution(() => {
          this.filtersRowsMap.clear();
          visibleVisualRows = arrayMap(dataFilter.filter(), rowData => rowData.meta.visualRow);
          const visibleVisualRowsAssertion = createArrayAssertion(visibleVisualRows);
          rangeEach(this.hot.countSourceRows() - 1, row => {
            if (!visibleVisualRowsAssertion(row)) {
              trimmedRows.push(row);
            }
          });
          arrayEach(trimmedRows, physicalRow => {
            this.filtersRowsMap.setValueAtIndex(physicalRow, true);
          });
        }, true);
        if (!navigableHeaders && !visibleVisualRows.length) {
          this.hot.deselectCell();
        }
      } else {
        this.filtersRowsMap.clear();
      }
    }
    this.hot.runHooks('afterFilter', conditions);
    this.hot.view.adjustElementsSize();
    this.hot.render();
    if (this.hot.selection.isSelected()) {
      this.hot.selectCell(navigableHeaders ? -1 : 0, this.hot.getSelectedRangeLast().highlight.col);
    }
  }

  /**
   * Gets last selected column index.
   *
   * @returns {{visualIndex: number, physicalIndex: number} | null} Returns `null` when a column is
   * not selected. Otherwise, returns an object with `visualIndex` and `physicalIndex` properties containing
   * the index of the column.
   */
  getSelectedColumn() {
    var _this$hot$getSelected;
    const highlight = (_this$hot$getSelected = this.hot.getSelectedRangeLast()) === null || _this$hot$getSelected === void 0 ? void 0 : _this$hot$getSelected.highlight;
    if (!highlight) {
      return null;
    }
    return {
      visualIndex: highlight.col,
      physicalIndex: this.hot.toPhysicalColumn(highlight.col)
    };
  }

  /**
   * Returns handsontable source data with cell meta based on current selection.
   *
   * @param {number} [column] The physical column index. By default column index accept the value of the selected column.
   * @returns {Array} Returns array of objects where keys as row index.
   */
  getDataMapAtColumn(column) {
    const visualColumn = this.hot.toVisualColumn(column);
    const data = [];
    arrayEach(this.hot.getSourceDataAtCol(visualColumn), (value, rowIndex) => {
      var _this$hot$getDataAtCe;
      const {
        row,
        col,
        visualCol,
        visualRow,
        type,
        instance,
        dateFormat,
        locale
      } = this.hot.getCellMeta(rowIndex, visualColumn);
      const dataValue = (_this$hot$getDataAtCe = this.hot.getDataAtCell(this.hot.toVisualRow(rowIndex), visualColumn)) !== null && _this$hot$getDataAtCe !== void 0 ? _this$hot$getDataAtCe : value;
      data.push({
        meta: {
          row,
          col,
          visualCol,
          visualRow,
          type,
          instance,
          dateFormat,
          locale
        },
        value: toEmptyString(dataValue)
      });
    });
    return data;
  }
  /**
   * Update the condition of ValueComponent, based on the handled changes.
   *
   * @private
   * @param {number} columnIndex Column index of handled ValueComponent condition.
   */
  updateValueComponentCondition(columnIndex) {
    const dataAtCol = this.hot.getDataAtCol(columnIndex);
    const selectedValues = unifyColumnValues(dataAtCol);
    this.conditionUpdateObserver.updateStatesAtColumn(columnIndex, selectedValues);
  }

  /**
   * Restores components to its saved state.
   *
   * @private
   * @param {Array} components List of components.
   */
  restoreComponents(components) {
    var _this$getSelectedColu;
    const physicalIndex = (_this$getSelectedColu = this.getSelectedColumn()) === null || _this$getSelectedColu === void 0 ? void 0 : _this$getSelectedColu.physicalIndex;
    components.forEach(component => {
      if (component.isHidden()) {
        return;
      }
      component.restoreState(physicalIndex);
    });
    this.updateDependentComponentsVisibility();
  }

  /**
   * After dropdown menu show listener.
   */

  /**
   * Get an operation, based on the number and types of arguments (where arguments are states of components).
   *
   * @param {string} suggestedOperation Operation which was chosen by user from UI.
   * @param {object} byConditionState1 State of first condition component.
   * @param {object} byConditionState2 State of second condition component.
   * @param {object} byValueState State of value component.
   * @private
   * @returns {string}
   */
  getOperationBasedOnArguments(suggestedOperation, byConditionState1, byConditionState2, byValueState) {
    let operation = suggestedOperation;
    if (operation === OPERATION_OR && byConditionState1.command.key !== CONDITION_NONE && byConditionState2.command.key !== CONDITION_NONE && byValueState.command.key !== CONDITION_NONE) {
      operation = OPERATION_OR_THEN_VARIABLE;
    } else if (byValueState.command.key !== CONDITION_NONE) {
      if (byConditionState1.command.key === CONDITION_NONE || byConditionState2.command.key === CONDITION_NONE) {
        operation = OPERATION_AND;
      }
    }
    return operation;
  }

  /**
   * On action bar submit listener.
   *
   * @private
   * @param {string} submitType The submit type.
   */

  /**
   * Listen to the keyboard input on document body and forward events to instance of Handsontable
   * created by DropdownMenu plugin.
   *
   * @private
   */
  setListeningDropdownMenu() {
    if (this.dropdownMenuPlugin) {
      this.dropdownMenuPlugin.setListening();
    }
  }

  /**
   * Updates visibility of some of the components, based on the state of the parent component.
   *
   * @private
   */
  updateDependentComponentsVisibility() {
    const component = this.components.get('filter_by_condition');
    const {
      command
    } = component.getState();
    const componentsToShow = [this.components.get('filter_by_condition2'), this.components.get('filter_operators')];
    if (command.showOperators) {
      this.showComponents(...componentsToShow);
    } else {
      this.hideComponents(...componentsToShow);
    }
  }

  /**
   * On after get column header listener.
   *
   * @param {number} col Visual column index.
   * @param {HTMLTableCellElement} TH Header's TH element.
   */

  /**
   * Creates DataFilter instance based on condition collection.
   *
   * @private
   * @param {ConditionCollection} conditionCollection Condition collection object.
   * @returns {DataFilter}
   */
  _createDataFilter() {
    let conditionCollection = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : this.conditionCollection;
    return new DataFilter(conditionCollection, physicalColumn => this.getDataMapAtColumn(physicalColumn));
  }

  /**
   * It updates the components state. The state is triggered by ConditionUpdateObserver, which
   * reacts to any condition added to the condition collection. It may be added through the UI
   * components or by API call.
   *
   * @param {object} conditionsState An object with the state generated by UI components.
   */

  /**
   * Returns indexes of passed components inside list of `dropdownMenu` items.
   *
   * @private
   * @param {...BaseComponent} components List of components.
   * @returns {Array}
   */
  getIndexesOfComponents() {
    const indexes = [];
    if (!this.dropdownMenuPlugin) {
      return indexes;
    }
    const menu = this.dropdownMenuPlugin.menu;
    for (var _len = arguments.length, components = new Array(_len), _key = 0; _key < _len; _key++) {
      components[_key] = arguments[_key];
    }
    arrayEach(components, component => {
      arrayEach(menu.menuItems, (item, index) => {
        if (item.key === component.getMenuItemDescriptor().key) {
          indexes.push(index);
        }
      });
    });
    return indexes;
  }

  /**
   * Changes visibility of component.
   *
   * @private
   * @param {boolean} visible Determine if components should be visible.
   * @param {...BaseComponent} components List of components.
   */
  changeComponentsVisibility() {
    let visible = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : true;
    if (!this.dropdownMenuPlugin) {
      return;
    }
    const menu = this.dropdownMenuPlugin.menu;
    const hotMenu = menu.hotMenu;
    const hiddenRows = hotMenu.getPlugin('hiddenRows');
    for (var _len2 = arguments.length, components = new Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
      components[_key2 - 1] = arguments[_key2];
    }
    const indexes = this.getIndexesOfComponents(...components);
    if (visible) {
      hiddenRows.showRows(indexes);
    } else {
      hiddenRows.hideRows(indexes);
    }
    hotMenu.render();
  }

  /**
   * Hides components of filters `dropdownMenu`.
   *
   * @private
   * @param {...BaseComponent} components List of components.
   */
  hideComponents() {
    for (var _len3 = arguments.length, components = new Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
      components[_key3] = arguments[_key3];
    }
    this.changeComponentsVisibility(false, ...components);
  }

  /**
   * Shows components of filters `dropdownMenu`.
   *
   * @private
   * @param {...BaseComponent} components List of components.
   */
  showComponents() {
    for (var _len4 = arguments.length, components = new Array(_len4), _key4 = 0; _key4 < _len4; _key4++) {
      components[_key4] = arguments[_key4];
    }
    this.changeComponentsVisibility(true, ...components);
  }

  /**
   * Destroys the plugin instance.
   */
  destroy() {
    if (this.enabled) {
      this.components.forEach((component, key) => {
        if (component !== null) {
          component.destroy();
          this.components.set(key, null);
        }
      });
      this.conditionCollection.destroy();
      this.conditionUpdateObserver.destroy();
      this.hot.rowIndexMapper.unregisterMap(this.pluginName);
    }
    super.destroy();
  }
}
function _onAfterChange(changes) {
  if (changes) {
    arrayEach(changes, change => {
      const [, prop] = change;
      const columnIndex = this.hot.propToCol(prop);
      if (this.conditionCollection.hasConditions(columnIndex)) {
        this.updateValueComponentCondition(columnIndex);
      }
    });
  }
}
function _onAfterDropdownMenuShow() {
  this.restoreComponents(Array.from(this.components.values()));
}
/**
 * After dropdown menu hide listener.
 */
function _onAfterDropdownMenuHide() {
  this.components.get('filter_by_condition').getSelectElement().closeOptions();
  this.components.get('filter_by_condition2').getSelectElement().closeOptions();
}
/**
 * After dropdown menu default options listener.
 *
 * @param {object} defaultOptions ContextMenu default item options.
 */
function _onAfterDropdownMenuDefaultOptions(defaultOptions) {
  defaultOptions.items.push({
    name: SEPARATOR
  });
  this.components.forEach(component => {
    defaultOptions.items.push(component.getMenuItemDescriptor());
  });
}
function _onActionBarSubmit(submitType) {
  var _this$dropdownMenuPlu3;
  if (submitType === 'accept') {
    const selectedColumn = this.getSelectedColumn();
    if (selectedColumn === null) {
      var _this$dropdownMenuPlu2;
      (_this$dropdownMenuPlu2 = this.dropdownMenuPlugin) === null || _this$dropdownMenuPlu2 === void 0 || _this$dropdownMenuPlu2.close();
      return;
    }
    const {
      physicalIndex
    } = selectedColumn;
    const byConditionState1 = this.components.get('filter_by_condition').getState();
    const byConditionState2 = this.components.get('filter_by_condition2').getState();
    const byValueState = this.components.get('filter_by_value').getState();
    const operation = this.getOperationBasedOnArguments(this.components.get('filter_operators').getActiveOperationId(), byConditionState1, byConditionState2, byValueState);
    this.conditionUpdateObserver.groupChanges();
    let columnStackPosition = this.conditionCollection.getColumnStackPosition(physicalIndex);
    if (columnStackPosition === -1) {
      columnStackPosition = undefined;
    }
    this.conditionCollection.removeConditions(physicalIndex);
    if (byConditionState1.command.key !== CONDITION_NONE) {
      this.conditionCollection.addCondition(physicalIndex, byConditionState1, operation, columnStackPosition);
      if (byConditionState2.command.key !== CONDITION_NONE) {
        this.conditionCollection.addCondition(physicalIndex, byConditionState2, operation, columnStackPosition);
      }
    }
    if (byValueState.command.key !== CONDITION_NONE) {
      this.conditionCollection.addCondition(physicalIndex, byValueState, operation, columnStackPosition);
    }
    this.conditionUpdateObserver.flush();
    this.components.forEach(component => component.saveState(physicalIndex));
    this.filtersRowsMap.clear();
    this.filter();
  }
  (_this$dropdownMenuPlu3 = this.dropdownMenuPlugin) === null || _this$dropdownMenuPlu3 === void 0 || _this$dropdownMenuPlu3.close();
}
/**
 * On component change listener.
 *
 * @param {BaseComponent} component Component inheriting BaseComponent.
 * @param {object} command Menu item object (command).
 */
function _onComponentChange(component, command) {
  this.updateDependentComponentsVisibility();
  if (component.constructor === ConditionComponent && !command.inputsCount) {
    this.setListeningDropdownMenu();
  }
}
/**
 * On component SelectUI closed listener.
 */
function _onSelectUIClosed() {
  this.setListeningDropdownMenu();
}
function _onAfterGetColHeader(col, TH) {
  const physicalColumn = this.hot.toPhysicalColumn(col);
  if (this.enabled && this.conditionCollection.hasConditions(physicalColumn)) {
    addClass(TH, 'htFiltersActive');
  } else {
    removeClass(TH, 'htFiltersActive');
  }
}
function _updateComponents(conditionsState) {
  var _this$dropdownMenuPlu4;
  if (!((_this$dropdownMenuPlu4 = this.dropdownMenuPlugin) !== null && _this$dropdownMenuPlu4 !== void 0 && _this$dropdownMenuPlu4.enabled)) {
    return;
  }
  const {
    editedConditionStack: {
      conditions,
      column
    }
  } = conditionsState;
  const conditionsByValue = conditions.filter(condition => condition.name === CONDITION_BY_VALUE);
  const conditionsWithoutByValue = conditions.filter(condition => condition.name !== CONDITION_BY_VALUE);
  if (conditionsByValue.length >= 2 || conditionsWithoutByValue.length >= 3) {
    warn(toSingleLine`The filter conditions have been applied properly, but couldn’t be displayed visually.\x20
        The overall amount of conditions exceed the capability of the dropdown menu.\x20
        For more details see the documentation.`);
  } else {
    const operationType = this.conditionCollection.getOperation(column);
    this.components.get('filter_by_condition').updateState(conditionsWithoutByValue[0], column);
    this.components.get('filter_by_condition2').updateState(conditionsWithoutByValue[1], column);
    this.components.get('filter_operators').updateState(operationType, column);
    this.components.get('filter_by_value').updateState(conditionsState);
  }
}