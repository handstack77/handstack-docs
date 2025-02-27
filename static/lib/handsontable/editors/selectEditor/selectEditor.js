"use strict";

exports.__esModule = true;
var _baseEditor = require("../baseEditor");
var _element = require("../../helpers/dom/element");
var _object = require("../../helpers/object");
const EDITOR_VISIBLE_CLASS_NAME = 'ht_editor_visible';
const SHORTCUTS_GROUP = 'selectEditor';
const EDITOR_TYPE = exports.EDITOR_TYPE = 'select';

/**
 * @private
 * @class SelectEditor
 */
class SelectEditor extends _baseEditor.BaseEditor {
  static get EDITOR_TYPE() {
    return EDITOR_TYPE;
  }

  /**
   * Initializes editor instance, DOM Element and mount hooks.
   */
  init() {
    this.select = this.hot.rootDocument.createElement('select');
    this.select.setAttribute('data-hot-input', 'true');
    this.select.style.display = 'none';
    (0, _element.addClass)(this.select, 'htSelectEditor');
    this.hot.rootElement.appendChild(this.select);
    this.registerHooks();
  }

  /**
   * Returns select's value.
   *
   * @returns {*}
   */
  getValue() {
    return this.select.value;
  }

  /**
   * Sets value in the select element.
   *
   * @param {*} value A new select's value.
   */
  setValue(value) {
    this.select.value = value;
  }

  /**
   * Opens the editor and adjust its size.
   */
  open() {
    this._opened = true;
    this.refreshDimensions();
    this.select.style.display = '';
    const shortcutManager = this.hot.getShortcutManager();
    shortcutManager.setActiveContextName('editor');
    this.registerShortcuts();
  }

  /**
   * Closes the editor.
   */
  close() {
    this._opened = false;
    this.select.style.display = 'none';
    if ((0, _element.hasClass)(this.select, EDITOR_VISIBLE_CLASS_NAME)) {
      (0, _element.removeClass)(this.select, EDITOR_VISIBLE_CLASS_NAME);
    }
    this.unregisterShortcuts();
    this.clearHooks();
  }

  /**
   * Sets focus state on the select element.
   */
  focus() {
    this.select.focus();
  }

  /**
   * Binds hooks to refresh editor's size after scrolling of the viewport or resizing of columns/rows.
   *
   * @private
   */
  registerHooks() {
    this.addHook('afterScrollHorizontally', () => this.refreshDimensions());
    this.addHook('afterScrollVertically', () => this.refreshDimensions());
    this.addHook('afterColumnResize', () => this.refreshDimensions());
    this.addHook('afterRowResize', () => this.refreshDimensions());
  }

  /**
   * Prepares editor's meta data and a list of available options.
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
    const selectOptions = this.cellProperties.selectOptions;
    let options;
    if (typeof selectOptions === 'function') {
      options = this.prepareOptions(selectOptions(this.row, this.col, this.prop));
    } else {
      options = this.prepareOptions(selectOptions);
    }
    (0, _element.empty)(this.select);
    (0, _object.objectEach)(options, (optionValue, key) => {
      const optionElement = this.hot.rootDocument.createElement('OPTION');
      optionElement.value = key;
      (0, _element.fastInnerHTML)(optionElement, optionValue);
      this.select.appendChild(optionElement);
    });
  }

  /**
   * Creates consistent list of available options.
   *
   * @private
   * @param {Array|object} optionsToPrepare The list of the values to render in the select eleemnt.
   * @returns {object}
   */
  prepareOptions(optionsToPrepare) {
    let preparedOptions = {};
    if (Array.isArray(optionsToPrepare)) {
      for (let i = 0, len = optionsToPrepare.length; i < len; i++) {
        preparedOptions[optionsToPrepare[i]] = optionsToPrepare[i];
      }
    } else if (typeof optionsToPrepare === 'object') {
      preparedOptions = optionsToPrepare;
    }
    return preparedOptions;
  }

  /**
   * Refreshes editor's value using source data.
   *
   * @private
   */
  refreshValue() {
    const sourceData = this.hot.getSourceDataAtCell(this.row, this.prop);
    this.originalValue = sourceData;
    this.setValue(sourceData);
    this.refreshDimensions();
  }

  /**
   * Refreshes editor's size and position.
   *
   * @private
   */
  refreshDimensions() {
    if (this.state !== _baseEditor.EDITOR_STATE.EDITING) {
      return;
    }
    this.TD = this.getEditedCell();

    // TD is outside of the viewport.
    if (!this.TD) {
      this.close();
      return;
    }
    const {
      top,
      start,
      width,
      height
    } = this.getEditedCellRect();
    const selectStyle = this.select.style;
    selectStyle.height = `${height}px`;
    selectStyle.width = `${width}px`;
    selectStyle.top = `${top}px`;
    selectStyle[this.hot.isRtl() ? 'right' : 'left'] = `${start}px`;
    selectStyle.margin = '0px';
    (0, _element.addClass)(this.select, EDITOR_VISIBLE_CLASS_NAME);
  }

  /**
   * Register shortcuts responsible for handling editor.
   *
   * @private
   */
  registerShortcuts() {
    const shortcutManager = this.hot.getShortcutManager();
    const editorContext = shortcutManager.getContext('editor');
    const contextConfig = {
      group: SHORTCUTS_GROUP
    };
    if (this.isInFullEditMode()) {
      // The arrow-related shortcuts should work only in full edit mode.
      editorContext.addShortcuts([{
        keys: [['ArrowUp']],
        callback: () => {
          const previousOptionIndex = this.select.selectedIndex - 1;
          if (previousOptionIndex >= 0) {
            this.select[previousOptionIndex].selected = true;
          }
        }
      }, {
        keys: [['ArrowDown']],
        callback: () => {
          const nextOptionIndex = this.select.selectedIndex + 1;
          if (nextOptionIndex <= this.select.length - 1) {
            this.select[nextOptionIndex].selected = true;
          }
        }
      }], contextConfig);
    }
  }

  /**
   * Unregister shortcuts responsible for handling editor.
   *
   * @private
   */
  unregisterShortcuts() {
    const shortcutManager = this.hot.getShortcutManager();
    const editorContext = shortcutManager.getContext('editor');
    editorContext.removeShortcutsByGroup(SHORTCUTS_GROUP);
  }
}
exports.SelectEditor = SelectEditor;