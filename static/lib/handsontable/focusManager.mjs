import "core-js/modules/es.error.cause.js";
function _classPrivateMethodInitSpec(e, a) { _checkPrivateRedeclaration(e, a), a.add(e); }
function _classPrivateFieldInitSpec(e, t, a) { _checkPrivateRedeclaration(e, t), t.set(e, a); }
function _checkPrivateRedeclaration(e, t) { if (t.has(e)) throw new TypeError("Cannot initialize the same private elements twice on an object"); }
function _classPrivateFieldGet(s, a) { return s.get(_assertClassBrand(s, a)); }
function _classPrivateFieldSet(s, a, r) { return s.set(_assertClassBrand(s, a), r), r; }
function _assertClassBrand(e, t, n) { if ("function" == typeof e ? e === t : e.has(t)) return arguments.length < 3 ? t : n; throw new TypeError("Private element is not present on this object"); }
import { warn } from "./helpers/console.mjs";
import { isOutsideInput } from "./helpers/dom/element.mjs";
import { debounce } from "./helpers/function.mjs";
/**
 * Possible focus modes.
 * - CELL - The browser's focus stays on the lastly selected cell element.
 * - MIXED - The browser's focus switches from the lastly selected cell element to the currently active editor's
 * `TEXTAREA` element after a delay defined in the manager.
 *
 * @type {{CELL: string, MIXED: string}}
 */
const FOCUS_MODES = Object.freeze({
  CELL: 'cell',
  MIXED: 'mixed'
});

/**
 * Manages the browser's focus in the table.
 */
var _hot = /*#__PURE__*/new WeakMap();
var _focusMode = /*#__PURE__*/new WeakMap();
var _refocusDelay = /*#__PURE__*/new WeakMap();
var _refocusElementGetter = /*#__PURE__*/new WeakMap();
var _debouncedSelect = /*#__PURE__*/new WeakMap();
var _FocusManager_brand = /*#__PURE__*/new WeakSet();
export class FocusManager {
  constructor(hotInstance) {
    var _this = this;
    /**
     * Get and return the currently selected and highlighted cell/header element.
     *
     * @param {Function} callback Callback function to be called after the cell element is retrieved.
     */
    _classPrivateMethodInitSpec(this, _FocusManager_brand);
    /**
     * The Handsontable instance.
     */
    _classPrivateFieldInitSpec(this, _hot, void 0);
    /**
     * The currently enabled focus mode.
     * Can be either:
     *
     * - 'cell' - The browser's focus stays on the lastly selected cell element.
     * - 'mixed' - The browser's focus switches from the lastly selected cell element to the currently active editor's
     * `TEXTAREA` element after a delay defined in the manager.
     *
     * @type {'cell' | 'mixed'}
     */
    _classPrivateFieldInitSpec(this, _focusMode, void 0);
    /**
     * The delay after which the focus switches from the lastly selected cell to the active editor's `TEXTAREA`
     * element if the focus mode is set to 'mixed'.
     *
     * @type {number}
     */
    _classPrivateFieldInitSpec(this, _refocusDelay, 1);
    /**
     * Getter function for the element to be used when refocusing the browser after a delay. If `null`, the active
     * editor's `TEXTAREA` element will be used.
     *
     * @type {null|Function}
     */
    _classPrivateFieldInitSpec(this, _refocusElementGetter, null);
    /**
     * Map of the debounced `select` functions.
     *
     * @type {Map<number, Function>}
     */
    _classPrivateFieldInitSpec(this, _debouncedSelect, new Map());
    const hotSettings = hotInstance.getSettings();
    _classPrivateFieldSet(_hot, this, hotInstance);
    _classPrivateFieldSet(_focusMode, this, hotSettings.imeFastEdit ? FOCUS_MODES.MIXED : FOCUS_MODES.CELL);
    _classPrivateFieldGet(_hot, this).addHook('afterUpdateSettings', function () {
      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }
      return _assertClassBrand(_FocusManager_brand, _this, _onUpdateSettings).call(_this, ...args);
    });
    _classPrivateFieldGet(_hot, this).addHook('afterSelection', function () {
      for (var _len2 = arguments.length, args = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
        args[_key2] = arguments[_key2];
      }
      return _assertClassBrand(_FocusManager_brand, _this, _focusCell).call(_this, ...args);
    });
    _classPrivateFieldGet(_hot, this).addHook('afterSelectionFocusSet', function () {
      for (var _len3 = arguments.length, args = new Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
        args[_key3] = arguments[_key3];
      }
      return _assertClassBrand(_FocusManager_brand, _this, _focusCell).call(_this, ...args);
    });
    _classPrivateFieldGet(_hot, this).addHook('afterSelectionEnd', function () {
      for (var _len4 = arguments.length, args = new Array(_len4), _key4 = 0; _key4 < _len4; _key4++) {
        args[_key4] = arguments[_key4];
      }
      return _assertClassBrand(_FocusManager_brand, _this, _focusEditorElement).call(_this, ...args);
    });
  }

  /**
   * Get the current focus mode.
   *
   * @returns {'cell' | 'mixed'}
   */
  getFocusMode() {
    return _classPrivateFieldGet(_focusMode, this);
  }

  /**
   * Set the focus mode.
   *
   * @param {'cell' | 'mixed'} focusMode The new focus mode.
   */
  setFocusMode(focusMode) {
    if (Object.values(FOCUS_MODES).includes(focusMode)) {
      _classPrivateFieldSet(_focusMode, this, focusMode);
    } else {
      warn(`"${focusMode}" is not a valid focus mode.`);
    }
  }

  /**
   * Get the delay after which the focus will change from the cell elements to the active editor's `TEXTAREA`
   * element if the focus mode is set to 'mixed'.
   *
   * @returns {number} Delay in milliseconds.
   */
  getRefocusDelay() {
    return _classPrivateFieldGet(_refocusDelay, this);
  }

  /**
   * Set the delay after which the focus will change from the cell elements to the active editor's `TEXTAREA`
   * element if the focus mode is set to 'mixed'.
   *
   * @param {number} delay Delay in milliseconds.
   */
  setRefocusDelay(delay) {
    _classPrivateFieldSet(_refocusDelay, this, delay);
  }

  /**
   * Set the function to be used as the "refocus element" getter. It should return a focusable HTML element.
   *
   * @param {Function} getRefocusElementFunction The refocus element getter.
   */
  setRefocusElementGetter(getRefocusElementFunction) {
    _classPrivateFieldSet(_refocusElementGetter, this, getRefocusElementFunction);
  }

  /**
   * Get the element to be used when refocusing the browser after a delay in case of the focus mode being 'mixed'.
   *
   * @returns {HTMLTextAreaElement|HTMLElement|undefined}
   */
  getRefocusElement() {
    if (typeof _classPrivateFieldGet(_refocusElementGetter, this) === 'function') {
      return _classPrivateFieldGet(_refocusElementGetter, this).call(this);
    } else {
      var _classPrivateFieldGet2;
      return (_classPrivateFieldGet2 = _classPrivateFieldGet(_hot, this).getActiveEditor()) === null || _classPrivateFieldGet2 === void 0 ? void 0 : _classPrivateFieldGet2.TEXTAREA;
    }
  }

  /**
   * Set the browser's focus to the highlighted cell of the last selection.
   *
   * @param {HTMLTableCellElement} [selectedCell] The highlighted cell/header element.
   */
  focusOnHighlightedCell(selectedCell) {
    const focusElement = element => {
      var _classPrivateFieldGet3, _classPrivateFieldGet4;
      const currentHighlightCoords = (_classPrivateFieldGet3 = _classPrivateFieldGet(_hot, this).getSelectedRangeLast()) === null || _classPrivateFieldGet3 === void 0 ? void 0 : _classPrivateFieldGet3.highlight;
      if (!currentHighlightCoords) {
        return;
      }
      let elementToBeFocused = _classPrivateFieldGet(_hot, this).runHooks('modifyFocusedElement', currentHighlightCoords.row, currentHighlightCoords.col, element);
      if (!(elementToBeFocused instanceof HTMLElement)) {
        elementToBeFocused = element;
      }
      if (elementToBeFocused && !((_classPrivateFieldGet4 = _classPrivateFieldGet(_hot, this).getActiveEditor()) !== null && _classPrivateFieldGet4 !== void 0 && _classPrivateFieldGet4.isOpened())) {
        elementToBeFocused.focus({
          preventScroll: true
        });
      }
    };
    if (selectedCell) {
      focusElement(selectedCell);
    } else {
      _assertClassBrand(_FocusManager_brand, this, _getSelectedCell).call(this, element => focusElement(element));
    }
  }

  /**
   * Set the focus to the active editor's `TEXTAREA` element after the provided delay. If no delay is provided, it
   * will be taken from the manager's configuration.
   *
   * @param {number} [delay] Delay in milliseconds.
   */
  refocusToEditorTextarea() {
    var _classPrivateFieldGet5;
    let delay = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : _classPrivateFieldGet(_refocusDelay, this);
    const refocusElement = this.getRefocusElement();

    // Re-focus on the editor's `TEXTAREA` element (or a predefined element) if the `imeFastEdit` option is enabled.
    if (_classPrivateFieldGet(_hot, this).getSettings().imeFastEdit && !((_classPrivateFieldGet5 = _classPrivateFieldGet(_hot, this).getActiveEditor()) !== null && _classPrivateFieldGet5 !== void 0 && _classPrivateFieldGet5.isOpened()) && !!refocusElement) {
      if (!_classPrivateFieldGet(_debouncedSelect, this).has(delay)) {
        _classPrivateFieldGet(_debouncedSelect, this).set(delay, debounce(() => {
          refocusElement.select();
        }, delay));
      }
      _classPrivateFieldGet(_debouncedSelect, this).get(delay)();
    }
  }
}
function _getSelectedCell(callback) {
  var _classPrivateFieldGet6;
  const highlight = (_classPrivateFieldGet6 = _classPrivateFieldGet(_hot, this).getSelectedRangeLast()) === null || _classPrivateFieldGet6 === void 0 ? void 0 : _classPrivateFieldGet6.highlight;
  if (!highlight || !_classPrivateFieldGet(_hot, this).selection.isCellVisible(highlight)) {
    callback(null);
    return;
  }
  const cell = _classPrivateFieldGet(_hot, this).getCell(highlight.row, highlight.col, true);
  if (cell === null) {
    _classPrivateFieldGet(_hot, this).addHookOnce('afterScroll', () => {
      callback(_classPrivateFieldGet(_hot, this).getCell(highlight.row, highlight.col, true));
    });
  } else {
    callback(cell);
  }
}
/**
 * Manage the browser's focus after each cell selection change.
 */
function _focusCell() {
  _assertClassBrand(_FocusManager_brand, this, _getSelectedCell).call(this, selectedCell => {
    const {
      activeElement
    } = _classPrivateFieldGet(_hot, this).rootDocument;

    // Blurring the `activeElement` removes the unwanted border around the focusable element (#6877)
    // and resets the `document.activeElement` property. The blurring should happen only when the
    // previously selected input element has not belonged to the Handsontable editor. If blurring is
    // triggered for all elements, there is a problem with the disappearing IME editor (#9672).
    if (activeElement && isOutsideInput(activeElement)) {
      activeElement.blur();
    }
    this.focusOnHighlightedCell(selectedCell);
  });
}
/**
 * Manage the browser's focus after cell selection end.
 */
function _focusEditorElement() {
  _assertClassBrand(_FocusManager_brand, this, _getSelectedCell).call(this, selectedCell => {
    if (this.getFocusMode() === FOCUS_MODES.MIXED && selectedCell.nodeName === 'TD') {
      this.refocusToEditorTextarea();
    }
  });
}
/**
 * Update the manager configuration after calling `updateSettings`.
 *
 * @param {object} newSettings The new settings passed to the `updateSettings` method.
 */
function _onUpdateSettings(newSettings) {
  if (typeof newSettings.imeFastEdit === 'boolean') {
    this.setFocusMode(newSettings.imeFastEdit ? FOCUS_MODES.MIXED : FOCUS_MODES.CELL);
  }
}