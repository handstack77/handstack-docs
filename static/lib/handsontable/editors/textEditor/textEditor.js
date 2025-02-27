"use strict";

exports.__esModule = true;
require("core-js/modules/es.error.cause.js");
var _baseEditor = require("../baseEditor");
var _eventManager = _interopRequireDefault(require("../../eventManager"));
var _browser = require("../../helpers/browser");
var _element = require("../../helpers/dom/element");
var _number = require("../../helpers/number");
var _autoResize = require("../../utils/autoResize");
var _mixed = require("../../helpers/mixed");
var _caretPositioner = require("./caretPositioner");
var _a11y = require("../../helpers/a11y");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
const EDITOR_VISIBLE_CLASS_NAME = 'ht_editor_visible';
const EDITOR_HIDDEN_CLASS_NAME = 'ht_editor_hidden';
const SHORTCUTS_GROUP = 'textEditor';
const EDITOR_TYPE = exports.EDITOR_TYPE = 'text';

/**
 * @private
 * @class TextEditor
 */
class TextEditor extends _baseEditor.BaseEditor {
  static get EDITOR_TYPE() {
    return EDITOR_TYPE;
  }

  /**
   * Instance of {@link EventManager}.
   *
   * @private
   * @type {EventManager}
   */

  /**
   * @param {Core} hotInstance The Handsontable instance.
   */
  constructor(hotInstance) {
    super(hotInstance);
    _defineProperty(this, "eventManager", new _eventManager.default(this));
    /**
     * Autoresize instance. Automagically resizes editor after changes.
     *
     * @private
     * @type {Function}
     */
    _defineProperty(this, "autoResize", (0, _autoResize.createInputElementResizer)(this.hot.rootDocument));
    /**
     * An TEXTAREA element.
     *
     * @private
     * @type {HTMLTextAreaElement}
     */
    _defineProperty(this, "TEXTAREA", void 0);
    /**
     * Style declaration object of the TEXTAREA element.
     *
     * @private
     * @type {CSSStyleDeclaration}
     */
    _defineProperty(this, "textareaStyle", void 0);
    /**
     * Parent element of the TEXTAREA.
     *
     * @private
     * @type {HTMLDivElement}
     */
    _defineProperty(this, "TEXTAREA_PARENT", void 0);
    /**
     * Style declaration object of the TEXTAREA_PARENT element.
     *
     * @private
     * @type {CSSStyleDeclaration}
     */
    _defineProperty(this, "textareaParentStyle", void 0);
    /**
     * Z-index class style for the editor.
     *
     * @private
     * @type {string}
     */
    _defineProperty(this, "layerClass", void 0);
    this.eventManager = new _eventManager.default(this);
    this.createElements();
    this.bindEvents();
    this.hot.addHookOnce('afterDestroy', () => this.destroy());
  }

  /**
   * Gets current value from editable element.
   *
   * @returns {number}
   */
  getValue() {
    return this.TEXTAREA.value;
  }

  /**
   * Sets new value into editable element.
   *
   * @param {*} newValue The editor value.
   */
  setValue(newValue) {
    this.TEXTAREA.value = newValue;
  }

  /**
   * Opens the editor and adjust its size.
   */
  open() {
    this.refreshDimensions(); // need it instantly, to prevent https://github.com/handsontable/handsontable/issues/348
    this.showEditableElement();
    this.hot.getShortcutManager().setActiveContextName('editor');
    this.registerShortcuts();
  }

  /**
   * Closes the editor.
   */
  close() {
    this.autoResize.unObserve();
    if ((0, _element.isThisHotChild)(this.hot.rootDocument.activeElement, this.hot.rootElement)) {
      this.hot.listen(); // don't refocus the table if user focused some cell outside of HT on purpose
    }
    this.hideEditableElement();
    this.unregisterShortcuts();
  }

  /**
   * Prepares editor's meta data.
   *
   * @param {number} row The visual row index.
   * @param {number} col The visual column index.
   * @param {number|string} prop The column property (passed when datasource is an array of objects).
   * @param {HTMLTableCellElement} td The rendered cell element.
   * @param {*} value The rendered value.
   * @param {object} cellProperties The cell meta object (see {@link Core#getCellMeta}).
   */
  prepare(row, col, prop, td, value, cellProperties) {
    const previousState = this.state;
    super.prepare(row, col, prop, td, value, cellProperties);
    if (!cellProperties.readOnly) {
      this.refreshDimensions(true);
      const {
        allowInvalid
      } = cellProperties;
      if (allowInvalid && !this.isOpened()) {
        // Remove an empty space from textarea (added by copyPaste plugin to make copy/paste
        // functionality work with IME)
        this.TEXTAREA.value = '';
      }
      if (previousState !== _baseEditor.EDITOR_STATE.FINISHED && !this.isOpened()) {
        this.hideEditableElement();
      }
    }
  }

  /**
   * Begins editing on a highlighted cell and hides fillHandle corner if was present.
   *
   * @param {*} newInitialValue The editor initial value.
   * @param {Event} event The keyboard event object.
   */
  beginEditing(newInitialValue, event) {
    if (this.state !== _baseEditor.EDITOR_STATE.VIRGIN) {
      return;
    }
    this.TEXTAREA.value = ''; // Remove an empty space from textarea (added by copyPaste plugin to make copy/paste functionality work with IME).
    super.beginEditing(newInitialValue, event);
  }

  /**
   * Sets focus state on the select element.
   */
  focus() {
    // For IME editor textarea element must be focused using ".select" method.
    // Using ".focus" browser automatically scroll into the focused element which
    // is undesired effect.
    this.TEXTAREA.select();
    (0, _element.setCaretPosition)(this.TEXTAREA, this.TEXTAREA.value.length);
  }

  /**
   * Creates an editor's elements and adds necessary CSS classnames.
   */
  createElements() {
    const {
      rootDocument
    } = this.hot;
    this.TEXTAREA = rootDocument.createElement('TEXTAREA');

    // Makes the element recognizable by Hot as its own
    // component's element.
    (0, _element.setAttribute)(this.TEXTAREA, [['data-hot-input', ''], (0, _a11y.A11Y_TABINDEX)(-1)]);
    if (this.hot.getSettings().ariaTags) {
      (0, _element.setAttribute)(this.TEXTAREA, [(0, _a11y.A11Y_HIDDEN)()]);
    }
    (0, _element.addClass)(this.TEXTAREA, 'handsontableInput');
    this.textareaStyle = this.TEXTAREA.style;
    this.textareaStyle.width = 0;
    this.textareaStyle.height = 0;
    this.textareaStyle.overflowY = 'visible';
    this.TEXTAREA_PARENT = rootDocument.createElement('DIV');
    (0, _element.addClass)(this.TEXTAREA_PARENT, 'handsontableInputHolder');
    if ((0, _element.hasClass)(this.TEXTAREA_PARENT, this.layerClass)) {
      (0, _element.removeClass)(this.TEXTAREA_PARENT, this.layerClass);
    }
    (0, _element.addClass)(this.TEXTAREA_PARENT, EDITOR_HIDDEN_CLASS_NAME);
    this.textareaParentStyle = this.TEXTAREA_PARENT.style;
    this.TEXTAREA_PARENT.appendChild(this.TEXTAREA);
    this.hot.rootElement.appendChild(this.TEXTAREA_PARENT);
  }

  /**
   * Moves an editable element out of the viewport, but element must be able to hold focus for IME support.
   *
   * @private
   */
  hideEditableElement() {
    if ((0, _browser.isEdge)()) {
      this.textareaStyle.textIndent = '-99999px';
    }
    this.textareaStyle.overflowY = 'visible';
    this.textareaParentStyle.opacity = '0';
    this.textareaParentStyle.height = '1px';
    (0, _element.removeClass)(this.TEXTAREA_PARENT, this.layerClass);
    (0, _element.addClass)(this.TEXTAREA_PARENT, EDITOR_HIDDEN_CLASS_NAME);
  }

  /**
   * Resets an editable element position.
   *
   * @private
   */
  showEditableElement() {
    this.textareaParentStyle.height = '';
    this.textareaParentStyle.overflow = '';
    this.textareaParentStyle.position = '';
    this.textareaParentStyle[this.hot.isRtl() ? 'left' : 'right'] = 'auto';
    this.textareaParentStyle.opacity = '1';
    this.textareaStyle.textIndent = '';
    const childNodes = this.TEXTAREA_PARENT.childNodes;
    let hasClassHandsontableEditor = false;
    (0, _number.rangeEach)(childNodes.length - 1, index => {
      const childNode = childNodes[index];
      if ((0, _element.hasClass)(childNode, 'handsontableEditor')) {
        hasClassHandsontableEditor = true;
        return false;
      }
    });
    if ((0, _element.hasClass)(this.TEXTAREA_PARENT, EDITOR_HIDDEN_CLASS_NAME)) {
      (0, _element.removeClass)(this.TEXTAREA_PARENT, EDITOR_HIDDEN_CLASS_NAME);
    }
    if (hasClassHandsontableEditor) {
      this.layerClass = EDITOR_VISIBLE_CLASS_NAME;
      (0, _element.addClass)(this.TEXTAREA_PARENT, this.layerClass);
    } else {
      this.layerClass = this.getEditedCellsLayerClass();
      (0, _element.addClass)(this.TEXTAREA_PARENT, this.layerClass);
    }
  }

  /**
   * Refreshes editor's value using source data.
   *
   * @private
   */
  refreshValue() {
    const physicalRow = this.hot.toPhysicalRow(this.row);
    const sourceData = this.hot.getSourceDataAtCell(physicalRow, this.col);
    this.originalValue = sourceData;
    this.setValue(sourceData);
    this.refreshDimensions();
  }

  /**
   * Refreshes editor's size and position.
   *
   * @private
   * @param {boolean} force Indicates if the refreshing editor dimensions should be triggered.
   */
  refreshDimensions() {
    let force = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;
    if (this.state !== _baseEditor.EDITOR_STATE.EDITING && !force) {
      return;
    }
    this.TD = this.getEditedCell();

    // TD is outside of the viewport.
    if (!this.TD) {
      if (!force) {
        this.close(); // TODO shouldn't it be this.finishEditing() ?
      }
      return;
    }
    const {
      top,
      start,
      width,
      maxWidth,
      height,
      maxHeight
    } = this.getEditedCellRect();
    this.textareaParentStyle.top = `${top}px`;
    this.textareaParentStyle[this.hot.isRtl() ? 'right' : 'left'] = `${start}px`;
    this.showEditableElement();
    const cellComputedStyle = (0, _element.getComputedStyle)(this.TD, this.hot.rootWindow);
    this.TEXTAREA.style.fontSize = cellComputedStyle.fontSize;
    this.TEXTAREA.style.fontFamily = cellComputedStyle.fontFamily;
    this.TEXTAREA.style.backgroundColor = this.TD.style.backgroundColor;
    const textareaComputedStyle = (0, _element.getComputedStyle)(this.TEXTAREA);
    const horizontalPadding = parseInt(textareaComputedStyle.paddingLeft, 10) + parseInt(textareaComputedStyle.paddingRight, 10);
    const verticalPadding = parseInt(textareaComputedStyle.paddingTop, 10) + parseInt(textareaComputedStyle.paddingBottom, 10);
    const finalWidth = width - horizontalPadding;
    const finalHeight = height - verticalPadding;
    const finalMaxWidth = maxWidth - horizontalPadding;
    const finalMaxHeight = maxHeight - verticalPadding;
    this.autoResize.init(this.TEXTAREA, {
      minWidth: Math.min(finalWidth, finalMaxWidth),
      minHeight: Math.min(finalHeight, finalMaxHeight),
      // TEXTAREA should never be wider than visible part of the viewport (should not cover the scrollbar)
      maxWidth: finalMaxWidth,
      maxHeight: finalMaxHeight
    }, true);
  }

  /**
   * Binds events and hooks.
   *
   * @private
   */
  bindEvents() {
    if ((0, _browser.isIOS)()) {
      // on iOS after click "Done" the edit isn't hidden by default, so we need to handle it manually.
      this.eventManager.addEventListener(this.TEXTAREA, 'focusout', () => this.finishEditing(false));
    }
    this.addHook('afterScrollHorizontally', () => this.refreshDimensions());
    this.addHook('afterScrollVertically', () => this.refreshDimensions());
    this.addHook('afterColumnResize', () => {
      this.refreshDimensions();
      if (this.state === _baseEditor.EDITOR_STATE.EDITING) {
        this.focus();
      }
    });
    this.addHook('afterRowResize', () => {
      this.refreshDimensions();
      if (this.state === _baseEditor.EDITOR_STATE.EDITING) {
        this.focus();
      }
    });
  }

  /**
   * Ugly hack for autocompleteEditor.
   *
   * @private
   */
  allowKeyEventPropagation() {}

  /**
   * Destroys the internal event manager and clears attached hooks.
   *
   * @private
   */
  destroy() {
    this.eventManager.destroy();
    this.clearHooks();
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
      runOnlyIf: () => (0, _mixed.isDefined)(this.hot.getSelected()),
      group: SHORTCUTS_GROUP
    };
    const insertNewLine = () => {
      this.hot.rootDocument.execCommand('insertText', false, '\n');
    };
    editorContext.addShortcuts([{
      keys: [['Control', 'Enter']],
      callback: () => {
        insertNewLine();
        return false; // Will block closing editor.
      },
      runOnlyIf: event => !this.hot.selection.isMultiple() &&
      // We trigger a data population for multiple selection.
      // catch CTRL but not right ALT (which in some systems triggers ALT+CTRL)
      !event.altKey
    }, {
      keys: [['Meta', 'Enter']],
      callback: () => {
        insertNewLine();
        return false; // Will block closing editor.
      },
      runOnlyIf: () => !this.hot.selection.isMultiple() // We trigger a data population for multiple selection.
    }, {
      keys: [['Alt', 'Enter']],
      callback: () => {
        insertNewLine();
        return false; // Will block closing editor.
      }
    }, {
      keys: [['Home']],
      callback: (event, _ref) => {
        let [keyName] = _ref;
        (0, _caretPositioner.updateCaretPosition)(keyName, this.TEXTAREA);
      }
    }, {
      keys: [['End']],
      callback: (event, _ref2) => {
        let [keyName] = _ref2;
        (0, _caretPositioner.updateCaretPosition)(keyName, this.TEXTAREA);
      }
    }], contextConfig);
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
exports.TextEditor = TextEditor;