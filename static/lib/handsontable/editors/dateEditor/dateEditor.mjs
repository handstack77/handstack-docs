import "core-js/modules/es.error.cause.js";
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
import moment from 'moment';
import Pikaday from '@handsontable/pikaday';
import { EDITOR_STATE } from "../baseEditor/index.mjs";
import { TextEditor } from "../textEditor/index.mjs";
import { addClass, hasClass, outerHeight, outerWidth } from "../../helpers/dom/element.mjs";
import { deepExtend } from "../../helpers/object.mjs";
import { isFunctionKey } from "../../helpers/unicode.mjs";
export const EDITOR_TYPE = 'date';
const SHORTCUTS_GROUP_EDITOR = 'dateEditor';

/**
 * @private
 * @class DateEditor
 */
export class DateEditor extends TextEditor {
  constructor() {
    super(...arguments);
    // TODO: Move this option to general settings
    /**
     * @type {string}
     */
    _defineProperty(this, "defaultDateFormat", 'DD/MM/YYYY');
    /**
     * @type {boolean}
     */
    _defineProperty(this, "parentDestroyed", false);
    /**
     * @type {Pikaday}
     */
    _defineProperty(this, "$datePicker", null);
  }
  static get EDITOR_TYPE() {
    return EDITOR_TYPE;
  }
  init() {
    if (typeof moment !== 'function') {
      throw new Error('You need to include moment.js to your project.');
    }
    if (typeof Pikaday !== 'function') {
      throw new Error('You need to include Pikaday to your project.');
    }
    super.init();
    this.hot.addHook('afterDestroy', () => {
      this.parentDestroyed = true;
      this.destroyElements();
    });
  }

  /**
   * Create data picker instance.
   */
  createElements() {
    super.createElements();
    this.datePicker = this.hot.rootDocument.createElement('DIV');
    this.datePickerStyle = this.datePicker.style;
    this.datePickerStyle.position = 'absolute';
    this.datePickerStyle.top = 0;
    this.datePickerStyle.left = 0;
    this.datePickerStyle.zIndex = 9999;
    this.datePicker.setAttribute('dir', this.hot.isRtl() ? 'rtl' : 'ltr');
    addClass(this.datePicker, 'htDatepickerHolder');
    this.hot.rootDocument.body.appendChild(this.datePicker);

    /**
     * Prevent recognizing clicking on datepicker as clicking outside of table.
     */
    this.eventManager.addEventListener(this.datePicker, 'mousedown', event => {
      if (hasClass(event.target, 'pika-day')) {
        this.hideDatepicker();
      }
      event.stopPropagation();
    });
  }

  /**
   * Destroy data picker instance.
   */
  destroyElements() {
    const datePickerParentElement = this.datePicker.parentNode;
    if (this.$datePicker) {
      this.$datePicker.destroy();
    }
    if (datePickerParentElement) {
      datePickerParentElement.removeChild(this.datePicker);
    }
  }

  /**
   * Prepare editor to appear.
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
  }

  /**
   * Open editor.
   *
   * @param {Event} [event=null] The event object.
   */
  open() {
    let event = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;
    const shortcutManager = this.hot.getShortcutManager();
    const editorContext = shortcutManager.getContext('editor');
    this.showDatepicker(event);
    super.open();
    editorContext.addShortcuts([{
      keys: [['ArrowLeft']],
      callback: () => {
        this.$datePicker.adjustDate('subtract', 1);
      }
    }, {
      keys: [['ArrowRight']],
      callback: () => {
        this.$datePicker.adjustDate('add', 1);
      }
    }, {
      keys: [['ArrowUp']],
      callback: () => {
        this.$datePicker.adjustDate('subtract', 7);
      }
    }, {
      keys: [['ArrowDown']],
      callback: () => {
        this.$datePicker.adjustDate('add', 7);
      }
    }], {
      group: SHORTCUTS_GROUP_EDITOR
    });
  }

  /**
   * Close editor.
   */
  close() {
    var _this$$datePicker;
    this._opened = false;

    // If the date picker was never initialized (e.g. during autofill), there's nothing to destroy.
    if ((_this$$datePicker = this.$datePicker) !== null && _this$$datePicker !== void 0 && _this$$datePicker.destroy) {
      this.$datePicker.destroy();
    }
    this.hot._registerTimeout(() => {
      const editorManager = this.hot._getEditorManager();
      editorManager.closeEditor();
      this.hot.view.render();
      editorManager.prepareEditor();
    });
    const shortcutManager = this.hot.getShortcutManager();
    const editorContext = shortcutManager.getContext('editor');
    editorContext.removeShortcutsByGroup(SHORTCUTS_GROUP_EDITOR);
    super.close();
  }

  /**
   * Finishes editing and start saving or restoring process for editing cell or last selected range.
   *
   * @param {boolean} restoreOriginalValue If true, then closes editor without saving value from the editor into a cell.
   * @param {boolean} ctrlDown If true, then saveValue will save editor's value to each cell in the last selected range.
   */
  finishEditing() {
    let restoreOriginalValue = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;
    let ctrlDown = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
    super.finishEditing(restoreOriginalValue, ctrlDown);
  }

  /**
   * Show data picker.
   *
   * @param {Event} event The event object.
   */
  showDatepicker(event) {
    const dateFormat = this.cellProperties.dateFormat || this.defaultDateFormat;
    const isMouseDown = this.hot.view.isMouseDown();
    const isMeta = event ? isFunctionKey(event.keyCode) : false;
    let dateStr;
    this.datePicker.style.display = 'block';
    this.$datePicker = new Pikaday(this.getDatePickerConfig());
    if (typeof this.$datePicker.useMoment === 'function') {
      this.$datePicker.useMoment(moment);
    }
    this.$datePicker._onInputFocus = function () {};
    if (this.originalValue) {
      dateStr = this.originalValue;
      if (moment(dateStr, dateFormat, true).isValid()) {
        this.$datePicker.setMoment(moment(dateStr, dateFormat), true);
      }

      // workaround for date/time cells - pikaday resets the cell value to 12:00 AM by default, this will overwrite the value.
      if (this.getValue() !== this.originalValue) {
        this.setValue(this.originalValue);
      }
      if (!isMeta && !isMouseDown) {
        this.setValue('');
      }
    } else if (this.cellProperties.defaultDate) {
      dateStr = this.cellProperties.defaultDate;
      if (moment(dateStr, dateFormat, true).isValid()) {
        this.$datePicker.setMoment(moment(dateStr, dateFormat), true);
      }
      if (!isMeta && !isMouseDown) {
        this.setValue('');
      }
    } else {
      // if a default date is not defined, set a soft-default-date: display the current day and month in the
      // datepicker, but don't fill the editor input
      this.$datePicker.gotoToday();
    }
  }

  /**
   * Hide data picker.
   */
  hideDatepicker() {
    this.datePickerStyle.display = 'none';
    this.$datePicker.hide();
  }

  /**
   * Get date picker options.
   *
   * @returns {object}
   */
  getDatePickerConfig() {
    const htInput = this.TEXTAREA;
    const options = {};
    if (this.cellProperties && this.cellProperties.datePickerConfig) {
      deepExtend(options, this.cellProperties.datePickerConfig);
    }
    const origOnSelect = options.onSelect;
    const origOnClose = options.onClose;
    options.field = htInput;
    options.trigger = htInput;
    options.container = this.datePicker;
    options.bound = false;
    options.keyboardInput = false;
    options.format = options.format || this.defaultDateFormat;
    options.reposition = options.reposition || false;
    // Set the RTL to `false`. Due to the https://github.com/Pikaday/Pikaday/issues/647 bug, the layout direction
    // of the date picker is controlled by juggling the "dir" attribute of the root date picker element.
    // See line @64 of this file.
    options.isRTL = false;
    options.onSelect = value => {
      let dateStr = value;
      if (!isNaN(dateStr.getTime())) {
        dateStr = moment(dateStr).format(this.cellProperties.dateFormat || this.defaultDateFormat);
      }
      this.setValue(dateStr);
      if (origOnSelect) {
        origOnSelect();
      }
    };
    options.onClose = () => {
      if (!this.parentDestroyed) {
        this.finishEditing(false);
      }
      if (origOnClose) {
        origOnClose();
      }
    };
    return options;
  }

  /**
   * Refreshes datepicker's size and position. The method is called internally by Handsontable.
   *
   * @private
   * @param {boolean} force Indicates if the refreshing editor dimensions should be triggered.
   */
  refreshDimensions(force) {
    var _wtOverlays$getParent;
    super.refreshDimensions(force);
    if (this.state !== EDITOR_STATE.EDITING) {
      return;
    }
    this.TD = this.getEditedCell();
    if (!this.TD) {
      this.hideDatepicker();
      return;
    }
    const {
      rowIndexMapper,
      columnIndexMapper
    } = this.hot;
    const {
      wtOverlays
    } = this.hot.view._wt;
    const {
      wtTable
    } = (_wtOverlays$getParent = wtOverlays.getParentOverlay(this.TD)) !== null && _wtOverlays$getParent !== void 0 ? _wtOverlays$getParent : this.hot.view._wt;
    const firstVisibleRow = rowIndexMapper.getVisualFromRenderableIndex(wtTable.getFirstPartiallyVisibleRow());
    const lastVisibleRow = rowIndexMapper.getVisualFromRenderableIndex(wtTable.getLastPartiallyVisibleRow());
    const firstVisibleColumn = columnIndexMapper.getVisualFromRenderableIndex(wtTable.getFirstPartiallyVisibleColumn());
    const lastVisibleColumn = columnIndexMapper.getVisualFromRenderableIndex(wtTable.getLastPartiallyVisibleColumn());
    if (this.row >= firstVisibleRow && this.row <= lastVisibleRow && this.col >= firstVisibleColumn && this.col <= lastVisibleColumn) {
      const offset = this.TD.getBoundingClientRect();
      this.datePickerStyle.top = `${this.hot.rootWindow.pageYOffset + offset.top + outerHeight(this.TD)}px`;
      let pickerLeftPosition = this.hot.rootWindow.pageXOffset;
      if (this.hot.isRtl()) {
        pickerLeftPosition += offset.right - outerWidth(this.datePicker);
      } else {
        pickerLeftPosition += offset.left;
      }
      this.datePickerStyle.left = `${pickerLeftPosition}px`;
    } else {
      this.hideDatepicker();
    }
  }
}