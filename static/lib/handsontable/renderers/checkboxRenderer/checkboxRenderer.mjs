import "core-js/modules/es.array.push.js";
import { baseRenderer } from "../baseRenderer/index.mjs";
import EventManager from "../../eventManager.mjs";
import { empty, addClass, setAttribute } from "../../helpers/dom/element.mjs";
import { isEmpty, stringify } from "../../helpers/mixed.mjs";
import { EDITOR_EDIT_GROUP as SHORTCUTS_GROUP_EDITOR } from "../../shortcutContexts/index.mjs";
import Hooks from "../../pluginHooks.mjs";
import { A11Y_CHECKBOX, A11Y_CHECKED, A11Y_LABEL } from "../../helpers/a11y.mjs";
import { CHECKBOX_CHECKED, CHECKBOX_UNCHECKED } from "../../i18n/constants.mjs";
const isListeningKeyDownEvent = new WeakMap();
const isCheckboxListenerAdded = new WeakMap();
const BAD_VALUE_CLASS = 'htBadValue';
const ATTR_ROW = 'data-row';
const ATTR_COLUMN = 'data-col';
const SHORTCUTS_GROUP = 'checkboxRenderer';
export const RENDERER_TYPE = 'checkbox';
Hooks.getSingleton().add('modifyAutoColumnSizeSeed', function (bundleSeed, cellMeta, cellValue) {
  const {
    label,
    type,
    row,
    column,
    prop
  } = cellMeta;
  if (type !== RENDERER_TYPE) {
    return;
  }
  if (label) {
    const {
      value: labelValue,
      property: labelProperty
    } = label;
    let labelText = cellValue;
    if (labelValue) {
      labelText = typeof labelValue === 'function' ? labelValue(row, column, prop, cellValue) : labelValue;
    } else if (labelProperty) {
      const labelData = this.getDataAtRowProp(row, labelProperty);
      labelText = labelData !== null ? labelData : cellValue;
    }
    bundleSeed = labelText;
  }
  return bundleSeed;
});
/**
 * Checkbox renderer.
 *
 * @private
 * @param {Core} hotInstance The Handsontable instance.
 * @param {HTMLTableCellElement} TD The rendered cell element.
 * @param {number} row The visual row index.
 * @param {number} col The visual column index.
 * @param {number|string} prop The column property (passed when datasource is an array of objects).
 * @param {*} value The rendered value.
 * @param {object} cellProperties The cell meta object (see {@link Core#getCellMeta}).
 */
export function checkboxRenderer(hotInstance, TD, row, col, prop, value, cellProperties) {
  const {
    rootDocument
  } = hotInstance;
  const ariaEnabled = hotInstance.getSettings().ariaTags;
  baseRenderer.apply(this, [hotInstance, TD, row, col, prop, value, cellProperties]);
  registerEvents(hotInstance);
  let input = createInput(rootDocument);
  const labelOptions = cellProperties.label;
  let badValue = false;
  if (typeof cellProperties.checkedTemplate === 'undefined') {
    cellProperties.checkedTemplate = true;
  }
  if (typeof cellProperties.uncheckedTemplate === 'undefined') {
    cellProperties.uncheckedTemplate = false;
  }
  empty(TD); // TODO identify under what circumstances this line can be removed

  if (value === cellProperties.checkedTemplate || stringify(value).toLocaleLowerCase(cellProperties.locale) === stringify(cellProperties.checkedTemplate).toLocaleLowerCase(cellProperties.locale)) {
    input.checked = true;
  } else if (value === cellProperties.uncheckedTemplate || stringify(value).toLocaleLowerCase(cellProperties.locale) === stringify(cellProperties.uncheckedTemplate).toLocaleLowerCase(cellProperties.locale)) {
    input.checked = false;
  } else if (isEmpty(value)) {
    // default value
    addClass(input, 'noValue');
  } else {
    input.style.display = 'none';
    addClass(input, BAD_VALUE_CLASS);
    badValue = true;
  }
  setAttribute(input, [[ATTR_ROW, row], [ATTR_COLUMN, col]]);
  if (ariaEnabled) {
    setAttribute(input, [A11Y_LABEL(input.checked ? hotInstance.getTranslatedPhrase(CHECKBOX_CHECKED) : hotInstance.getTranslatedPhrase(CHECKBOX_UNCHECKED)), A11Y_CHECKED(input.checked), A11Y_CHECKBOX()]);
  }
  if (!badValue && labelOptions) {
    let labelText = '';
    if (labelOptions.value) {
      labelText = typeof labelOptions.value === 'function' ? labelOptions.value.call(this, row, col, prop, value) : labelOptions.value;
    } else if (labelOptions.property) {
      const labelValue = hotInstance.getDataAtRowProp(row, labelOptions.property);
      labelText = labelValue !== null ? labelValue : '';
    }
    const label = createLabel(rootDocument, labelText, labelOptions.separated !== true);
    if (labelOptions.position === 'before') {
      if (labelOptions.separated) {
        TD.appendChild(label);
        TD.appendChild(input);
      } else {
        label.appendChild(input);
        input = label;
      }
    } else if (!labelOptions.position || labelOptions.position === 'after') {
      if (labelOptions.separated) {
        TD.appendChild(input);
        TD.appendChild(label);
      } else {
        label.insertBefore(input, label.firstChild);
        input = label;
      }
    }
  }
  if (!labelOptions || labelOptions && !labelOptions.separated) {
    TD.appendChild(input);
  }
  if (badValue) {
    TD.appendChild(rootDocument.createTextNode('#bad-value#'));
  }
  if (!isListeningKeyDownEvent.has(hotInstance)) {
    isListeningKeyDownEvent.set(hotInstance, true);
    registerShortcuts();
  }

  /**
   * Register shortcuts responsible for toggling checkbox state.
   *
   * @private
   */
  function registerShortcuts() {
    const shortcutManager = hotInstance.getShortcutManager();
    const gridContext = shortcutManager.getContext('grid');
    const config = {
      group: SHORTCUTS_GROUP,
      relativeToGroup: SHORTCUTS_GROUP_EDITOR,
      position: 'before'
    };
    gridContext.addShortcuts([{
      keys: [['space']],
      callback: () => {
        changeSelectedCheckboxesState();
        return !areSelectedCheckboxCells(); // False blocks next action associated with the keyboard shortcut.
      },
      runOnlyIf: () => {
        var _hotInstance$getSelec;
        return (_hotInstance$getSelec = hotInstance.getSelectedRangeLast()) === null || _hotInstance$getSelec === void 0 ? void 0 : _hotInstance$getSelec.highlight.isCell();
      }
    }, {
      keys: [['enter']],
      callback: () => {
        changeSelectedCheckboxesState();
        return !areSelectedCheckboxCells(); // False blocks next action associated with the keyboard shortcut.
      },
      runOnlyIf: () => {
        const range = hotInstance.getSelectedRangeLast();
        return hotInstance.getSettings().enterBeginsEditing && (range === null || range === void 0 ? void 0 : range.isSingle()) && range.highlight.isCell();
      }
    }, {
      keys: [['delete'], ['backspace']],
      callback: () => {
        changeSelectedCheckboxesState(true);
        return !areSelectedCheckboxCells(); // False blocks next action associated with the keyboard shortcut.
      },
      runOnlyIf: () => {
        var _hotInstance$getSelec2;
        return (_hotInstance$getSelec2 = hotInstance.getSelectedRangeLast()) === null || _hotInstance$getSelec2 === void 0 ? void 0 : _hotInstance$getSelec2.highlight.isCell();
      }
    }], config);
  }

  /**
   * Change checkbox checked property.
   *
   * @private
   * @param {boolean} [uncheckCheckbox=false] The new "checked" state for the checkbox elements.
   */
  function changeSelectedCheckboxesState() {
    let uncheckCheckbox = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;
    const selRange = hotInstance.getSelectedRange();
    const changesPerSubSelection = [];
    let changes = [];
    let changeCounter = 0;
    if (!selRange) {
      return;
    }
    for (let key = 0; key < selRange.length; key++) {
      const {
        row: startRow,
        col: startColumn
      } = selRange[key].getTopStartCorner();
      const {
        row: endRow,
        col: endColumn
      } = selRange[key].getBottomEndCorner();
      for (let visualRow = startRow; visualRow <= endRow; visualRow += 1) {
        for (let visualColumn = startColumn; visualColumn <= endColumn; visualColumn += 1) {
          const cachedCellProperties = hotInstance.getCellMeta(visualRow, visualColumn);
          const templates = {
            checkedTemplate: cachedCellProperties.checkedTemplate,
            uncheckedTemplate: cachedCellProperties.uncheckedTemplate
          };
          if (cachedCellProperties.type !== 'checkbox') {
            return;
          }

          /* eslint-disable no-continue */
          if (cachedCellProperties.readOnly === true) {
            continue;
          }
          if (typeof cachedCellProperties.checkedTemplate === 'undefined') {
            cachedCellProperties.checkedTemplate = true;
          }
          if (typeof cachedCellProperties.uncheckedTemplate === 'undefined') {
            cachedCellProperties.uncheckedTemplate = false;
          }
          const dataAtCell = hotInstance.getDataAtCell(visualRow, visualColumn);
          if (uncheckCheckbox === false) {
            if ([cachedCellProperties.checkedTemplate, cachedCellProperties.checkedTemplate.toString()].includes(dataAtCell)) {
              // eslint-disable-line max-len
              changes.push([visualRow, visualColumn, cachedCellProperties.uncheckedTemplate, templates]);
            } else if ([cachedCellProperties.uncheckedTemplate, cachedCellProperties.uncheckedTemplate.toString(), null, undefined].includes(dataAtCell)) {
              // eslint-disable-line max-len
              changes.push([visualRow, visualColumn, cachedCellProperties.checkedTemplate, templates]);
            }
          } else {
            changes.push([visualRow, visualColumn, cachedCellProperties.uncheckedTemplate, templates]);
          }
          changeCounter += 1;
        }
      }
      changesPerSubSelection.push(changeCounter);
      changeCounter = 0;
    }
    if (!changes.every(_ref => {
      let [,, cellValue] = _ref;
      return cellValue === changes[0][2];
    })) {
      changes = changes.map(_ref2 => {
        let [visualRow, visualColumn,, templates] = _ref2;
        return [visualRow, visualColumn, templates.checkedTemplate];
      });
    } else {
      changes = changes.map(_ref3 => {
        let [visualRow, visualColumn, cellValue] = _ref3;
        return [visualRow, visualColumn, cellValue];
      });
    }
    if (changes.length > 0) {
      // TODO: This is workaround for handsontable/dev-handsontable#1747 not being a breaking change.
      // Technically, the changes don't need to be split into chunks when sent to `setDataAtCell`.
      changesPerSubSelection.forEach(changesCount => {
        const changesChunk = changes.splice(0, changesCount);
        hotInstance.setDataAtCell(changesChunk);
      });
    }
  }

  /**
   * Check whether all selected cells are with checkbox type.
   *
   * @returns {boolean}
   * @private
   */
  function areSelectedCheckboxCells() {
    const selRange = hotInstance.getSelectedRange();
    if (!selRange) {
      return;
    }
    for (let key = 0; key < selRange.length; key++) {
      const topLeft = selRange[key].getTopStartCorner();
      const bottomRight = selRange[key].getBottomEndCorner();
      for (let visualRow = topLeft.row; visualRow <= bottomRight.row; visualRow++) {
        for (let visualColumn = topLeft.col; visualColumn <= bottomRight.col; visualColumn++) {
          const cachedCellProperties = hotInstance.getCellMeta(visualRow, visualColumn);
          if (cachedCellProperties.type !== 'checkbox') {
            return false;
          }
          const cell = hotInstance.getCell(visualRow, visualColumn);
          if (cell === null || cell === undefined) {
            return true;
          } else {
            const checkboxes = cell.querySelectorAll('input[type=checkbox]');
            if (checkboxes.length > 0 && !cachedCellProperties.readOnly) {
              return true;
            }
          }
        }
      }
    }
    return false;
  }
}
checkboxRenderer.RENDERER_TYPE = RENDERER_TYPE;

/**
 * Register checkbox listeners.
 *
 * @param {Core} instance The Handsontable instance.
 * @returns {EventManager}
 */
function registerEvents(instance) {
  let eventManager = isCheckboxListenerAdded.get(instance);
  if (!eventManager) {
    const {
      rootElement
    } = instance;
    eventManager = new EventManager(instance);
    eventManager.addEventListener(rootElement, 'click', event => onClick(event, instance));
    eventManager.addEventListener(rootElement, 'mouseup', event => onMouseUp(event, instance));
    eventManager.addEventListener(rootElement, 'change', event => onChange(event, instance));
    isCheckboxListenerAdded.set(instance, eventManager);
  }
  return eventManager;
}

/**
 * Create input element.
 *
 * @param {Document} rootDocument The document owner.
 * @returns {Node}
 */
function createInput(rootDocument) {
  const input = rootDocument.createElement('input');
  input.className = 'htCheckboxRendererInput';
  input.type = 'checkbox';
  input.setAttribute('tabindex', '-1');
  return input.cloneNode(false);
}

/**
 * Create label element.
 *
 * @param {Document} rootDocument The document owner.
 * @param {string} text The label text.
 * @param {boolean} fullWidth Determines whether label should have full width.
 * @returns {Node}
 */
function createLabel(rootDocument, text, fullWidth) {
  const label = rootDocument.createElement('label');
  label.className = `htCheckboxRendererLabel ${fullWidth ? 'fullWidth' : ''}`;
  label.appendChild(rootDocument.createTextNode(text));
  return label.cloneNode(true);
}

/**
 * `mouseup` callback.
 *
 * @private
 * @param {Event} event `mouseup` event.
 * @param {Core} instance The Handsontable instance.
 */
function onMouseUp(event, instance) {
  const {
    target
  } = event;
  if (!isCheckboxInput(target)) {
    return;
  }
  if (!target.hasAttribute(ATTR_ROW) || !target.hasAttribute(ATTR_COLUMN)) {
    return;
  }
  setTimeout(instance.listen, 10);
}

/**
 * `click` callback.
 *
 * @private
 * @param {MouseEvent} event `click` event.
 * @param {Core} instance The Handsontable instance.
 */
function onClick(event, instance) {
  const {
    target
  } = event;
  if (!isCheckboxInput(target)) {
    return;
  }
  if (!target.hasAttribute(ATTR_ROW) || !target.hasAttribute(ATTR_COLUMN)) {
    return;
  }
  const row = parseInt(target.getAttribute(ATTR_ROW), 10);
  const col = parseInt(target.getAttribute(ATTR_COLUMN), 10);
  const cellProperties = instance.getCellMeta(row, col);
  if (cellProperties.readOnly) {
    event.preventDefault();
  }
}

/**
 * `change` callback.
 *
 * @param {Event} event `change` event.
 * @param {Core} instance The Handsontable instance.
 */
function onChange(event, instance) {
  const {
    target
  } = event;
  if (!isCheckboxInput(target)) {
    return;
  }
  if (!target.hasAttribute(ATTR_ROW) || !target.hasAttribute(ATTR_COLUMN)) {
    return;
  }
  const row = parseInt(target.getAttribute(ATTR_ROW), 10);
  const col = parseInt(target.getAttribute(ATTR_COLUMN), 10);
  const cellProperties = instance.getCellMeta(row, col);
  if (!cellProperties.readOnly) {
    let newCheckboxValue = null;
    if (event.target.checked) {
      newCheckboxValue = cellProperties.uncheckedTemplate === undefined ? true : cellProperties.checkedTemplate;
    } else {
      newCheckboxValue = cellProperties.uncheckedTemplate === undefined ? false : cellProperties.uncheckedTemplate;
    }
    instance.setDataAtCell(row, col, newCheckboxValue);
  }
}

/**
 * Check if the provided element is the checkbox input.
 *
 * @private
 * @param {HTMLElement} element The element in question.
 * @returns {boolean}
 */
function isCheckboxInput(element) {
  return element.tagName === 'INPUT' && element.getAttribute('type') === 'checkbox';
}