"use strict";

exports.__esModule = true;
require("core-js/modules/es.error.cause.js");
require("core-js/modules/es.array.push.js");
var _handsontableEditor = require("../handsontableEditor");
var _array = require("../../helpers/array");
var _element = require("../../helpers/dom/element");
var _mixed = require("../../helpers/mixed");
var _string = require("../../helpers/string");
var _unicode = require("../../helpers/unicode");
var _browser = require("../../helpers/browser");
var _textRenderer = require("../../renderers/textRenderer");
var _a11y = require("../../helpers/a11y");
function _classPrivateFieldInitSpec(e, t, a) { _checkPrivateRedeclaration(e, t), t.set(e, a); }
function _checkPrivateRedeclaration(e, t) { if (t.has(e)) throw new TypeError("Cannot initialize the same private elements twice on an object"); }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
function _classPrivateFieldGet(s, a) { return s.get(_assertClassBrand(s, a)); }
function _assertClassBrand(e, t, n) { if ("function" == typeof e ? e === t : e.has(t)) return arguments.length < 3 ? t : n; throw new TypeError("Private element is not present on this object"); }
const EDITOR_TYPE = exports.EDITOR_TYPE = 'autocomplete';

/**
 * @private
 * @class AutocompleteEditor
 */
var _idPrefix = /*#__PURE__*/new WeakMap();
class AutocompleteEditor extends _handsontableEditor.HandsontableEditor {
  constructor() {
    super(...arguments);
    /**
     * Query string to turn available values over.
     *
     * @type {string}
     */
    _defineProperty(this, "query", null);
    /**
     * Contains stripped choices.
     *
     * @type {string[]}
     */
    _defineProperty(this, "strippedChoices", []);
    /**
     * Contains raw choices.
     *
     * @type {Array}
     */
    _defineProperty(this, "rawChoices", []);
    /**
     * Holds the prefix of the editor's id.
     *
     * @type {string}
     */
    _classPrivateFieldInitSpec(this, _idPrefix, this.hot.guid.slice(0, 9));
    /**
     * Filters and sorts by relevance.
     *
     * @param {*} value The selected value.
     * @param {string[]} choices The list of available choices.
     * @param {boolean} caseSensitive Indicates if it's sorted by case.
     * @returns {number[]} Array of indexes in original choices array.
     */
    _defineProperty(this, "sortByRelevance", function (value, choices, caseSensitive) {
      const choicesRelevance = [];
      const result = [];
      const valueLength = value.length;
      let choicesCount = choices.length;
      let charsLeft;
      let currentItem;
      let i;
      let valueIndex;
      if (valueLength === 0) {
        for (i = 0; i < choicesCount; i++) {
          result.push(i);
        }
        return result;
      }
      for (i = 0; i < choicesCount; i++) {
        currentItem = (0, _string.stripTags)((0, _mixed.stringify)(choices[i]));
        if (caseSensitive) {
          valueIndex = currentItem.indexOf(value);
        } else {
          const locale = this.cellProperties.locale;
          valueIndex = currentItem.toLocaleLowerCase(locale).indexOf(value.toLocaleLowerCase(locale));
        }
        if (valueIndex !== -1) {
          charsLeft = currentItem.length - valueIndex - valueLength;
          choicesRelevance.push({
            baseIndex: i,
            index: valueIndex,
            charsLeft,
            value: currentItem
          });
        }
      }
      choicesRelevance.sort((a, b) => {
        if (b.index === -1) {
          return -1;
        }
        if (a.index === -1) {
          return 1;
        }
        if (a.index < b.index) {
          return -1;
        } else if (b.index < a.index) {
          return 1;
        } else if (a.index === b.index) {
          if (a.charsLeft < b.charsLeft) {
            return -1;
          } else if (a.charsLeft > b.charsLeft) {
            return 1;
          }
        }
        return 0;
      });
      for (i = 0, choicesCount = choicesRelevance.length; i < choicesCount; i++) {
        result.push(choicesRelevance[i].baseIndex);
      }
      return result;
    });
  }
  static get EDITOR_TYPE() {
    return EDITOR_TYPE;
  }
  /**
   * Gets current value from editable element.
   *
   * @returns {string}
   */
  getValue() {
    const selectedValue = this.rawChoices.find(value => {
      const strippedValue = this.stripValueIfNeeded(value);
      return strippedValue === this.TEXTAREA.value;
    });
    if ((0, _mixed.isDefined)(selectedValue)) {
      return selectedValue;
    }
    return this.TEXTAREA.value;
  }

  /**
   * Creates an editor's elements and adds necessary CSS classnames.
   */
  createElements() {
    super.createElements();
    (0, _element.addClass)(this.htContainer, 'autocompleteEditor');
    (0, _element.addClass)(this.htContainer, this.hot.rootWindow.navigator.platform.indexOf('Mac') === -1 ? '' : 'htMacScroll');
    if (this.hot.getSettings().ariaTags) {
      (0, _element.setAttribute)(this.TEXTAREA, [(0, _a11y.A11Y_TEXT)(), (0, _a11y.A11Y_COMBOBOX)(), (0, _a11y.A11Y_HASPOPUP)('listbox'), (0, _a11y.A11Y_AUTOCOMPLETE)()]);
    }
  }

  /**
   * Prepares editor's metadata and configuration of the internal Handsontable's instance.
   *
   * @param {number} row The visual row index.
   * @param {number} col The visual column index.
   * @param {number|string} prop The column property (passed when datasource is an array of objects).
   * @param {HTMLTableCellElement} td The rendered cell element.
   * @param {*} value The rendered value.
   * @param {object} cellProperties The cell meta object (see {@link Core#getCellMeta}).
   */
  prepare(row, col, prop, td, value, cellProperties) {
    super.prepare(row, col, prop, td, value, cellProperties);
    if (this.hot.getSettings().ariaTags) {
      (0, _element.setAttribute)(this.TEXTAREA, [(0, _a11y.A11Y_EXPANDED)('false'), (0, _a11y.A11Y_CONTROLS)(`${_classPrivateFieldGet(_idPrefix, this)}-listbox-${row}-${col}`)]);
    }
  }

  /**
   * Opens the editor and adjust its size and internal Handsontable's instance.
   */
  open() {
    super.open();
    const trimDropdown = this.cellProperties.trimDropdown === undefined ? true : this.cellProperties.trimDropdown;
    const rootInstanceAriaTagsEnabled = this.hot.getSettings().ariaTags;
    const sourceArray = Array.isArray(this.cellProperties.source) ? this.cellProperties.source : null;
    const sourceSize = sourceArray === null || sourceArray === void 0 ? void 0 : sourceArray.length;
    const {
      row: rowIndex,
      col: colIndex
    } = this;
    this.showEditableElement();
    this.focus();
    let scrollbarWidth = (0, _element.getScrollbarWidth)();
    if (scrollbarWidth === 0 && (0, _browser.isMacOS)()) {
      scrollbarWidth += 15; // default scroll bar width if scroll bars are visible only when scrolling
    }
    this.addHook('beforeKeyDown', event => this.onBeforeKeyDown(event));
    this.htEditor.updateSettings({
      colWidths: trimDropdown ? [(0, _element.outerWidth)(this.TEXTAREA) - 2] : undefined,
      width: trimDropdown ? (0, _element.outerWidth)(this.TEXTAREA) + scrollbarWidth : undefined,
      autoColumnSize: true,
      renderer: (hotInstance, TD, row, col, prop, value, cellProperties) => {
        (0, _textRenderer.textRenderer)(hotInstance, TD, row, col, prop, value, cellProperties);
        const {
          filteringCaseSensitive,
          allowHtml,
          locale
        } = this.cellProperties;
        const query = this.query;
        let cellValue = (0, _mixed.stringify)(value);
        let indexOfMatch;
        let match;
        if (cellValue && !allowHtml) {
          indexOfMatch = filteringCaseSensitive === true ? cellValue.indexOf(query) : cellValue.toLocaleLowerCase(locale).indexOf(query.toLocaleLowerCase(locale));
          if (indexOfMatch !== -1) {
            match = cellValue.substr(indexOfMatch, query.length);
            cellValue = cellValue.replace(match, `<strong>${match}</strong>`);
          }
        }
        if (rootInstanceAriaTagsEnabled) {
          (0, _element.setAttribute)(TD, [(0, _a11y.A11Y_OPTION)(),
          // Add `setsize` and `posinset` only if the source is an array.
          ...(sourceArray ? [(0, _a11y.A11Y_SETSIZE)(sourceSize)] : []), ...(sourceArray ? [(0, _a11y.A11Y_POSINSET)(sourceArray.indexOf(value) + 1)] : []), ['id', `${this.htEditor.rootElement.id}_${row}-${col}`]]);
        }
        TD.innerHTML = cellValue;
      },
      afterSelectionEnd: (startRow, startCol) => {
        if (rootInstanceAriaTagsEnabled) {
          const TD = this.htEditor.getCell(startRow, startCol, true);
          (0, _element.setAttribute)(TD, [(0, _a11y.A11Y_SELECTED)()]);
          (0, _element.setAttribute)(this.TEXTAREA, ...(0, _a11y.A11Y_ACTIVEDESCENDANT)(TD.id));
        }
      }
    });
    if (rootInstanceAriaTagsEnabled) {
      // Add `role=presentation` to the main table to prevent the readers from treating the option list as a table.
      (0, _element.setAttribute)(this.htEditor.view._wt.wtOverlays.wtTable.TABLE, ...(0, _a11y.A11Y_PRESENTATION)());
      (0, _element.setAttribute)(this.htEditor.rootElement, [(0, _a11y.A11Y_LISTBOX)(), (0, _a11y.A11Y_LIVE)('polite'), (0, _a11y.A11Y_RELEVANT)('text'), ['id', `${_classPrivateFieldGet(_idPrefix, this)}-listbox-${rowIndex}-${colIndex}`]]);
      (0, _element.setAttribute)(this.TEXTAREA, ...(0, _a11y.A11Y_EXPANDED)('true'));
    }
    this.hot._registerTimeout(() => {
      this.queryChoices(this.TEXTAREA.value);
    });
  }

  /**
   * Closes the editor.
   */
  close() {
    this.removeHooksByKey('beforeKeyDown');
    super.close();
    if (this.hot.getSettings().ariaTags) {
      (0, _element.setAttribute)(this.TEXTAREA, [(0, _a11y.A11Y_EXPANDED)('false')]);
    }
  }

  /**
   * Verifies result of validation or closes editor if user's cancelled changes.
   *
   * @param {boolean|undefined} result If `false` and the cell using allowInvalid option,
   *                                   then an editor won't be closed until validation is passed.
   */
  discardEditor(result) {
    super.discardEditor(result);
    this.hot.view.render();
  }

  /**
   * Prepares choices list based on applied argument.
   *
   * @private
   * @param {string} query The query.
   */
  queryChoices(query) {
    const source = this.cellProperties.source;
    this.query = query;
    if (typeof source === 'function') {
      source.call(this.cellProperties, query, choices => {
        this.rawChoices = choices;
        this.updateChoicesList(this.stripValuesIfNeeded(choices));
      });
    } else if (Array.isArray(source)) {
      this.rawChoices = source;
      this.updateChoicesList(this.stripValuesIfNeeded(source));
    } else {
      this.updateChoicesList([]);
    }
  }

  /**
   * Updates list of the possible completions to choose.
   *
   * @private
   * @param {Array} choicesList The choices list to process.
   */
  updateChoicesList(choicesList) {
    const pos = (0, _element.getCaretPosition)(this.TEXTAREA);
    const endPos = (0, _element.getSelectionEndPosition)(this.TEXTAREA);
    const sortByRelevanceSetting = this.cellProperties.sortByRelevance;
    const filterSetting = this.cellProperties.filter;
    let orderByRelevance = null;
    let highlightIndex = null;
    let choices = choicesList;
    if (sortByRelevanceSetting) {
      orderByRelevance = this.sortByRelevance(this.stripValueIfNeeded(this.getValue()), choices, this.cellProperties.filteringCaseSensitive);
    }
    const orderByRelevanceLength = Array.isArray(orderByRelevance) ? orderByRelevance.length : 0;
    if (filterSetting === false) {
      if (orderByRelevanceLength) {
        highlightIndex = orderByRelevance[0];
      }
    } else {
      const sorted = [];
      for (let i = 0, choicesCount = choices.length; i < choicesCount; i++) {
        if (sortByRelevanceSetting && orderByRelevanceLength <= i) {
          break;
        }
        if (orderByRelevanceLength) {
          sorted.push(choices[orderByRelevance[i]]);
        } else {
          sorted.push(choices[i]);
        }
      }
      highlightIndex = 0;
      choices = sorted;
    }
    this.strippedChoices = choices;
    if (choices.length === 0) {
      this.htEditor.rootElement.style.display = 'none';
    } else {
      this.htEditor.rootElement.style.display = '';
    }
    this.htEditor.loadData((0, _array.pivot)([choices]));
    if (choices.length > 0) {
      this.updateDropdownDimensions();
      this.flipDropdownIfNeeded();
      if (this.cellProperties.strict === true) {
        this.highlightBestMatchingChoice(highlightIndex);
      }
    }
    this.hot.listen();
    (0, _element.setCaretPosition)(this.TEXTAREA, pos, pos === endPos ? undefined : endPos);
  }

  /**
   * Checks where is enough place to open editor.
   *
   * @private
   * @returns {boolean}
   */
  flipDropdownIfNeeded() {
    const trimmingContainer = (0, _element.getTrimmingContainer)(this.hot.view._wt.wtTable.TABLE);
    const isWindowAsScrollableElement = trimmingContainer === this.hot.rootWindow;
    const preventOverflow = this.cellProperties.preventOverflow;
    if (isWindowAsScrollableElement || !isWindowAsScrollableElement && (preventOverflow || preventOverflow === 'horizontal')) {
      return false;
    }
    const textareaOffset = (0, _element.offset)(this.TEXTAREA);
    const textareaHeight = (0, _element.outerHeight)(this.TEXTAREA);
    const dropdownHeight = this.getDropdownHeight();
    const trimmingContainerScrollTop = trimmingContainer.scrollTop;
    const headersHeight = (0, _element.outerHeight)(this.hot.view._wt.wtTable.THEAD);
    const containerOffset = (0, _element.offset)(trimmingContainer);
    const spaceAbove = textareaOffset.top - containerOffset.top - headersHeight + trimmingContainerScrollTop;
    const spaceBelow = trimmingContainer.scrollHeight - spaceAbove - headersHeight - textareaHeight;
    const flipNeeded = dropdownHeight > spaceBelow && spaceAbove > spaceBelow;
    if (flipNeeded) {
      this.flipDropdown(dropdownHeight);
    } else {
      this.unflipDropdown();
    }
    this.limitDropdownIfNeeded(flipNeeded ? spaceAbove : spaceBelow, dropdownHeight);
    return flipNeeded;
  }

  /**
   * Checks if the internal table should generate scrollbar or could be rendered without it.
   *
   * @private
   * @param {number} spaceAvailable The free space as height defined in px available for dropdown list.
   * @param {number} dropdownHeight The dropdown height.
   */
  limitDropdownIfNeeded(spaceAvailable, dropdownHeight) {
    if (dropdownHeight > spaceAvailable) {
      let tempHeight = 0;
      let i = 0;
      let lastRowHeight = 0;
      let height = null;
      do {
        lastRowHeight = this.htEditor.getRowHeight(i) || this.htEditor.view._wt.getSetting('defaultRowHeight');
        tempHeight += lastRowHeight;
        i += 1;
      } while (tempHeight < spaceAvailable);
      height = tempHeight - lastRowHeight;
      if (this.htEditor.flipped) {
        this.htEditor.rootElement.style.top = `${parseInt(this.htEditor.rootElement.style.top, 10) + dropdownHeight - height}px`;
      }
      this.setDropdownHeight(tempHeight - lastRowHeight);
    }
  }

  /**
   * Configures editor to open it at the top.
   *
   * @private
   * @param {number} dropdownHeight The dropdown height.
   */
  flipDropdown(dropdownHeight) {
    const dropdownStyle = this.htEditor.rootElement.style;
    dropdownStyle.position = 'absolute';
    dropdownStyle.top = `${-dropdownHeight}px`;
    this.htEditor.flipped = true;
  }

  /**
   * Configures editor to open it at the bottom.
   *
   * @private
   */
  unflipDropdown() {
    const dropdownStyle = this.htEditor.rootElement.style;
    dropdownStyle.position = 'absolute';
    dropdownStyle.top = '';
    this.htEditor.flipped = undefined;
  }

  /**
   * Updates width and height of the internal Handsontable's instance.
   *
   * @private
   */
  updateDropdownDimensions() {
    const currentDropdownWidth = this.htEditor.getColWidth(0) + (0, _element.getScrollbarWidth)(this.hot.rootDocument) + 2;
    const trimDropdown = this.cellProperties.trimDropdown;
    this.htEditor.updateSettings({
      height: this.getDropdownHeight(),
      width: trimDropdown ? undefined : currentDropdownWidth
    });
    this.htEditor.view._wt.wtTable.alignOverlaysWithTrimmingContainer();
  }

  /**
   * Sets new height of the internal Handsontable's instance.
   *
   * @private
   * @param {number} height The new dropdown height.
   */
  setDropdownHeight(height) {
    this.htEditor.updateSettings({
      height
    });
  }

  /**
   * Creates new selection on specified row index, or deselects selected cells.
   *
   * @private
   * @param {number|undefined} index The visual row index.
   */
  highlightBestMatchingChoice(index) {
    if (typeof index === 'number') {
      this.htEditor.selectCell(index, 0, undefined, undefined, undefined, false);
    } else {
      this.htEditor.deselectCell();
    }
  }

  /**
   * Calculates and return the internal Handsontable's height.
   *
   * @private
   * @returns {number}
   */
  getDropdownHeight() {
    const firstRowHeight = this.htEditor.getRowHeight(0) || 23;
    const visibleRows = this.cellProperties.visibleRows;
    return this.strippedChoices.length >= visibleRows ? visibleRows * firstRowHeight : this.strippedChoices.length * firstRowHeight + 8; // eslint-disable-line max-len
  }

  /**
   * Sanitizes value from potential dangerous tags.
   *
   * @private
   * @param {string} value The value to sanitize.
   * @returns {string}
   */
  stripValueIfNeeded(value) {
    return this.stripValuesIfNeeded([value])[0];
  }

  /**
   * Sanitizes an array of the values from potential dangerous tags.
   *
   * @private
   * @param {string[]} values The value to sanitize.
   * @returns {string[]}
   */
  stripValuesIfNeeded(values) {
    const {
      allowHtml
    } = this.cellProperties;
    const stringifiedValues = (0, _array.arrayMap)(values, value => (0, _mixed.stringify)(value));
    const strippedValues = (0, _array.arrayMap)(stringifiedValues, value => allowHtml ? value : (0, _string.stripTags)(value));
    return strippedValues;
  }

  /**
   * Captures use of arrow down and up to control their behaviour.
   *
   * @private
   * @param {number} keyCode The keyboard keycode.
   * @returns {boolean}
   */
  allowKeyEventPropagation(keyCode) {
    const selectedRange = this.htEditor.getSelectedRangeLast();
    const selected = {
      row: selectedRange ? selectedRange.from.row : -1
    };
    let allowed = false;
    if (keyCode === _unicode.KEY_CODES.ARROW_DOWN && selected.row > 0 && selected.row < this.htEditor.countRows() - 1) {
      allowed = true;
    }
    if (keyCode === _unicode.KEY_CODES.ARROW_UP && selected.row > -1) {
      allowed = true;
    }
    return allowed;
  }

  /**
   * OnBeforeKeyDown callback.
   *
   * @private
   * @param {KeyboardEvent} event The keyboard event object.
   */
  onBeforeKeyDown(event) {
    if ((0, _unicode.isPrintableChar)(event.keyCode) || event.keyCode === _unicode.KEY_CODES.BACKSPACE || event.keyCode === _unicode.KEY_CODES.DELETE || event.keyCode === _unicode.KEY_CODES.INSERT) {
      // for Windows 10 + FF86 there is need to add delay to make sure that the value taken from
      // the textarea is the freshest value. Otherwise the list of choices does not update correctly (see #7570).
      // On the more modern version of the FF (~ >=91) it seems that the issue is not present or it is
      // more difficult to induce.
      let timeOffset = 10;

      // on ctl+c / cmd+c don't update suggestion list
      if (event.keyCode === _unicode.KEY_CODES.C && (event.ctrlKey || event.metaKey)) {
        return;
      }
      if (!this.isOpened()) {
        timeOffset += 10;
      }
      if (this.htEditor) {
        this.hot._registerTimeout(() => {
          this.queryChoices(this.TEXTAREA.value);
        }, timeOffset);
      }
    }
  }
}
exports.AutocompleteEditor = AutocompleteEditor;