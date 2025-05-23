"use strict";

exports.__esModule = true;
require("core-js/modules/es.error.cause.js");
require("core-js/modules/es.array.push.js");
var _positioner = require("./positioner");
var _navigator2 = require("./navigator");
var _shortcuts = require("./shortcuts");
var _predefinedItems = require("./../predefinedItems");
var _utils = require("./utils");
var _eventManager = _interopRequireDefault(require("../../../eventManager"));
var _array = require("../../../helpers/array");
var _browser = require("../../../helpers/browser");
var _element = require("../../../helpers/dom/element");
var _event = require("../../../helpers/dom/event");
var _function = require("../../../helpers/function");
var _mixed = require("../../../helpers/mixed");
var _object = require("../../../helpers/object");
var _localHooks = _interopRequireDefault(require("../../../mixins/localHooks"));
var _menuItemRenderer = require("./menuItemRenderer");
var _a11y = require("../../../helpers/a11y");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
function _classPrivateFieldInitSpec(e, t, a) { _checkPrivateRedeclaration(e, t), t.set(e, a); }
function _checkPrivateRedeclaration(e, t) { if (t.has(e)) throw new TypeError("Cannot initialize the same private elements twice on an object"); }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
function _classPrivateFieldSet(s, a, r) { return s.set(_assertClassBrand(s, a), r), r; }
function _classPrivateFieldGet(s, a) { return s.get(_assertClassBrand(s, a)); }
function _assertClassBrand(e, t, n) { if ("function" == typeof e ? e === t : e.has(t)) return arguments.length < 3 ? t : n; throw new TypeError("Private element is not present on this object"); }
const MIN_WIDTH = 215;

/**
 * @typedef MenuOptions
 * @property {Menu} [parent=null] Instance of {@link Menu}.
 * @property {string} [name=null] Name of the menu.
 * @property {string} [className=''] Custom class name.
 * @property {boolean} [keepInViewport=true] Determine if should be kept in viewport.
 * @property {boolean} [standalone] Enabling closing menu when clicked element is not belongs to menu itself.
 * @property {number} [minWidth=MIN_WIDTH] The minimum width.
 * @property {HTMLElement} [container] The container.
 */

/**
 * @private
 * @class Menu
 */
var _navigator = /*#__PURE__*/new WeakMap();
var _shortcutsCtrl = /*#__PURE__*/new WeakMap();
class Menu {
  /**
   * @param {Core} hotInstance Handsontable instance.
   * @param {MenuOptions} [options] Menu options.
   */
  constructor(hotInstance, options) {
    var _this = this;
    /**
     * The Handsontable instance.
     *
     * @type {Core}
     */
    _defineProperty(this, "hot", void 0);
    /**
     * The Menu options.
     *
     * @type {object}
     */
    _defineProperty(this, "options", void 0);
    /**
     * @type {EventManager}
     */
    _defineProperty(this, "eventManager", new _eventManager.default(this));
    /**
     * The Menu container element.
     *
     * @type {HTMLElement}
     */
    _defineProperty(this, "container", void 0);
    /**
     * @type {Positioner}
     */
    _defineProperty(this, "positioner", void 0);
    /**
     * The instance of the Handsontable that is used as a menu.
     *
     * @type {Core}
     */
    _defineProperty(this, "hotMenu", null);
    /**
     * The collection of the Handsontable instances that are used as sub-menus.
     *
     * @type {object}
     */
    _defineProperty(this, "hotSubMenus", {});
    /**
     * If the menu acts as the sub-menu then this property contains the reference to the parent menu.
     *
     * @type {Menu}
     */
    _defineProperty(this, "parentMenu", void 0);
    /**
     * The menu items entries.
     *
     * @type {object[]}
     */
    _defineProperty(this, "menuItems", null);
    /**
     * @type {boolean}
     */
    _defineProperty(this, "origOutsideClickDeselects", null);
    /**
     * The controller module that allows modifying the menu item selection positions.
     *
     * @type {Paginator}
     */
    _classPrivateFieldInitSpec(this, _navigator, void 0);
    /**
     * The controller module that allows extending the keyboard shortcuts for the menu.
     *
     * @type {KeyboardShortcutsMenuController}
     */
    _classPrivateFieldInitSpec(this, _shortcutsCtrl, void 0);
    this.hot = hotInstance;
    this.options = options || {
      parent: null,
      name: null,
      className: '',
      keepInViewport: true,
      standalone: false,
      minWidth: MIN_WIDTH,
      container: this.hot.rootDocument.documentElement
    };
    this.container = this.createContainer(this.options.name);
    this.positioner = new _positioner.Positioner(this.options.keepInViewport);
    this.parentMenu = this.options.parent || null;
    this.registerEvents();
    if (this.isSubMenu()) {
      this.addLocalHook('afterSelectionChange', function () {
        for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
          args[_key] = arguments[_key];
        }
        return _this.parentMenu.runLocalHooks('afterSelectionChange', ...args);
      });
    }
  }

  /**
   * Register event listeners.
   *
   * @private
   */
  registerEvents() {
    let frame = this.hot.rootWindow;
    while (frame) {
      this.eventManager.addEventListener(frame.document, 'mousedown', event => this.onDocumentMouseDown(event));
      this.eventManager.addEventListener(frame.document, 'touchstart', event => this.onDocumentMouseDown(event));
      this.eventManager.addEventListener(frame.document, 'contextmenu', event => this.onDocumentContextMenu(event));
      frame = (0, _element.getParentWindow)(frame);
    }
  }

  /**
   * Set array of objects which defines menu items.
   *
   * @param {Array} menuItems Menu items to display.
   */
  setMenuItems(menuItems) {
    this.menuItems = menuItems;
  }

  /**
   * Gets the controller object that allows modifying the the menu item selection.
   *
   * @returns {Paginator | undefined}
   */
  getNavigator() {
    return _classPrivateFieldGet(_navigator, this);
  }

  /**
   * Gets the controller object that allows extending the keyboard shortcuts of the menu.
   *
   * @returns {KeyboardShortcutsMenuController | undefined}
   */
  getKeyboardShortcutsCtrl() {
    return _classPrivateFieldGet(_shortcutsCtrl, this);
  }

  /**
   * Returns currently selected menu item. Returns `null` if no item was selected.
   *
   * @returns {object|null}
   */
  getSelectedItem() {
    return this.hasSelectedItem() ? this.hotMenu.getSourceDataAtRow(this.hotMenu.getSelectedLast()[0]) : null;
  }

  /**
   * Checks if the menu has selected (highlighted) any item from the menu list.
   *
   * @returns {boolean}
   */
  hasSelectedItem() {
    return Array.isArray(this.hotMenu.getSelectedLast());
  }

  /**
   * Check if menu is using as sub-menu.
   *
   * @returns {boolean}
   */
  isSubMenu() {
    return this.parentMenu !== null;
  }

  /**
   * Open menu.
   *
   * @fires Hooks#beforeContextMenuShow
   * @fires Hooks#afterContextMenuShow
   */
  open() {
    this.runLocalHooks('beforeOpen');
    this.container.removeAttribute('style');
    this.container.style.display = 'block';
    const delayedOpenSubMenu = (0, _function.debounce)(row => this.openSubMenu(row), 300);
    const minWidthOfMenu = this.options.minWidth || MIN_WIDTH;
    let noItemsDefined = false;
    let filteredItems = (0, _array.arrayFilter)(this.menuItems, item => {
      if (item.key === _predefinedItems.NO_ITEMS) {
        noItemsDefined = true;
      }
      return (0, _utils.isItemHidden)(item, this.hot);
    });
    if (filteredItems.length < 1 && !noItemsDefined) {
      filteredItems.push((0, _predefinedItems.predefinedItems)()[_predefinedItems.NO_ITEMS]);
    } else if (filteredItems.length === 0) {
      return;
    }
    filteredItems = (0, _utils.filterSeparators)(filteredItems, _predefinedItems.SEPARATOR);
    let shouldAutoCloseMenu = false;
    const settings = {
      data: filteredItems,
      colHeaders: false,
      autoColumnSize: true,
      autoWrapRow: false,
      modifyColWidth(width) {
        if ((0, _mixed.isDefined)(width) && width < minWidthOfMenu) {
          return minWidthOfMenu;
        }
        return width;
      },
      autoRowSize: false,
      readOnly: true,
      editor: false,
      copyPaste: false,
      hiddenRows: true,
      maxCols: 1,
      columns: [{
        data: 'name',
        renderer: (0, _menuItemRenderer.createMenuItemRenderer)(this.hot)
      }],
      renderAllRows: true,
      fragmentSelection: false,
      outsideClickDeselects: false,
      disableVisualSelection: 'area',
      layoutDirection: this.hot.isRtl() ? 'rtl' : 'ltr',
      ariaTags: false,
      beforeOnCellMouseOver: (event, coords) => {
        _classPrivateFieldGet(_navigator, this).setCurrentPage(coords.row);
      },
      afterOnCellMouseOver: (event, coords) => {
        if (this.isAllSubMenusClosed()) {
          delayedOpenSubMenu(coords.row);
        } else {
          this.openSubMenu(coords.row);
        }
      },
      rowHeights: row => filteredItems[row].name === _predefinedItems.SEPARATOR ? 1 : 23,
      afterOnCellContextMenu: event => {
        event.preventDefault();

        // On the Windows platform, the "contextmenu" is triggered after the "mouseup" so that's
        // why the closing menu is here. (#6507#issuecomment-582392301).
        if ((0, _browser.isWindowsOS)() && shouldAutoCloseMenu && this.hasSelectedItem()) {
          this.close(true);
        }
      },
      afterSelection: (row, column, row2, column2, preventScrolling) => {
        // do not scroll the viewport when mouse clicks on partially visible menu item
        if (this.hotMenu.view.isMouseDown()) {
          preventScrolling.value = true;
        }
        this.runLocalHooks('afterSelectionChange', this.getSelectedItem());
      },
      beforeOnCellMouseUp: event => {
        if (this.hasSelectedItem()) {
          shouldAutoCloseMenu = !this.isCommandPassive(this.getSelectedItem());
          this.executeCommand(event);
        }
      },
      afterOnCellMouseUp: event => {
        // If the code runs on the other platform than Windows, the "mouseup" is triggered
        // after the "contextmenu". So then "mouseup" closes the menu. Otherwise, the closing
        // menu responsibility is forwarded to "afterOnCellContextMenu" callback (#6507#issuecomment-582392301).
        if ((!(0, _browser.isWindowsOS)() || !(0, _event.isRightClick)(event)) && shouldAutoCloseMenu && this.hasSelectedItem()) {
          // The timeout is necessary only for mobile devices. For desktop, the click event that is fired
          // right after the mouseup event gets the event element target the same as the mouseup event.
          // For mobile devices, the click event is triggered with native delay (~300ms), so when the mouseup
          // event hides the tapped element, the click event grabs the element below. As a result, the filter
          // by condition menu is closed and immediately open on tapping the "None" item.
          if ((0, _browser.isMobileBrowser)() || (0, _browser.isIpadOS)()) {
            this.hot._registerTimeout(() => this.close(true), 325);
          } else {
            this.close(true);
          }
        }
      },
      afterUnlisten: () => {
        // Restore menu focus, fix for `this.instance.unlisten();` call in the tableView.js@260 file.
        // This prevents losing table responsiveness for keyboard events when filter select menu is closed (#6497).
        if (!this.hasSelectedItem() && this.isOpened()) {
          this.hotMenu.listen();
        }
      }
    };
    this.origOutsideClickDeselects = this.hot.getSettings().outsideClickDeselects;
    this.hot.getSettings().outsideClickDeselects = false;
    this.hotMenu = new this.hot.constructor(this.container, settings);
    this.hotMenu.addHook('afterInit', () => this.onAfterInit());
    this.hotMenu.init();
    _classPrivateFieldSet(_navigator, this, (0, _navigator2.createMenuNavigator)(this.hotMenu));
    _classPrivateFieldSet(_shortcutsCtrl, this, (0, _shortcuts.createKeyboardShortcutsCtrl)(this));
    _classPrivateFieldGet(_shortcutsCtrl, this).listen();
    this.focus();
    if (this.isSubMenu()) {
      this.addLocalHook('afterOpen', () => this.parentMenu.runLocalHooks('afterSubmenuOpen', this));
    }
    this.runLocalHooks('afterOpen', this);
  }

  /**
   * Close menu.
   *
   * @param {boolean} [closeParent=false] If `true` try to close parent menu if exists.
   */
  close() {
    let closeParent = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;
    if (!this.isOpened()) {
      return;
    }
    if (closeParent && this.isSubMenu()) {
      this.parentMenu.close();
    } else {
      _classPrivateFieldGet(_navigator, this).clear();
      this.closeAllSubMenus();
      this.container.style.display = 'none';
      this.hotMenu.destroy();
      this.hotMenu = null;
      this.hot.getSettings().outsideClickDeselects = this.origOutsideClickDeselects;
      this.runLocalHooks('afterClose');
      if (this.isSubMenu()) {
        if (this.hot.getSettings().ariaTags) {
          const selection = this.parentMenu.hotMenu.getSelectedLast();
          if (selection) {
            const cell = this.parentMenu.hotMenu.getCell(selection[0], 0);
            (0, _element.setAttribute)(cell, [(0, _a11y.A11Y_EXPANDED)(false)]);
          }
        }
        this.parentMenu.hotMenu.listen();
      }
    }
  }

  /**
   * Open sub menu at the provided row index.
   *
   * @param {number} row Row index.
   * @returns {Menu|boolean} Returns created menu or `false` if no one menu was created.
   */
  openSubMenu(row) {
    if (!this.hotMenu) {
      return false;
    }
    const cell = this.hotMenu.getCell(row, 0);
    this.closeAllSubMenus();
    if (!cell || !(0, _utils.hasSubMenu)(cell)) {
      return false;
    }
    const dataItem = this.hotMenu.getSourceDataAtRow(row);
    const subMenu = new Menu(this.hot, {
      parent: this,
      name: dataItem.name,
      className: this.options.className,
      keepInViewport: true,
      container: this.options.container
    });
    subMenu.setMenuItems(dataItem.submenu.items);
    subMenu.open();
    subMenu.setPosition(cell.getBoundingClientRect());
    this.hotSubMenus[dataItem.key] = subMenu;

    // Update the accessibility tags on the cell being the base for the submenu.
    if (this.hot.getSettings().ariaTags) {
      (0, _element.setAttribute)(cell, [(0, _a11y.A11Y_EXPANDED)(true)]);
    }
    return subMenu;
  }

  /**
   * Close sub menu at row index.
   *
   * @param {number} row Row index.
   */
  closeSubMenu(row) {
    const dataItem = this.hotMenu.getSourceDataAtRow(row);
    const menus = this.hotSubMenus[dataItem.key];
    if (menus) {
      menus.destroy();
      delete this.hotSubMenus[dataItem.key];
      const cell = this.hotMenu.getCell(row, 0);

      // Update the accessibility tags on the cell being the base for the submenu.
      if (this.hot.getSettings().ariaTags) {
        (0, _element.setAttribute)(cell, [(0, _a11y.A11Y_EXPANDED)(false)]);
      }
    }
  }

  /**
   * Close all opened sub menus.
   */
  closeAllSubMenus() {
    (0, _array.arrayEach)(this.hotMenu.getData(), (value, row) => this.closeSubMenu(row));
  }

  /**
   * Checks if all created and opened sub menus are closed.
   *
   * @returns {boolean}
   */
  isAllSubMenusClosed() {
    return Object.keys(this.hotSubMenus).length === 0;
  }

  /**
   * Focus the menu so all keyboard shortcuts become active.
   */
  focus() {
    if (this.isOpened()) {
      this.hotMenu.rootElement.focus({
        preventScroll: true
      });
      this.getKeyboardShortcutsCtrl().listen();
      this.hotMenu.listen();
    }
  }

  /**
   * Destroy instance.
   */
  destroy() {
    const menuContainerParentElement = this.container.parentNode;
    this.clearLocalHooks();
    this.close();
    this.parentMenu = null;
    this.eventManager.destroy();
    if (menuContainerParentElement) {
      menuContainerParentElement.removeChild(this.container);
    }
  }

  /**
   * Checks if menu was opened.
   *
   * @returns {boolean} Returns `true` if menu was opened.
   */
  isOpened() {
    return this.hotMenu !== null;
  }

  /**
   * Execute menu command.
   *
   * The `executeCommand()` method works only for selected cells.
   *
   * When no cells are selected, `executeCommand()` doesn't do anything.
   *
   * @param {Event} [event] The mouse event object.
   */
  executeCommand(event) {
    if (!this.isOpened() || !this.hasSelectedItem()) {
      return;
    }
    const selectedItem = this.getSelectedItem();
    this.runLocalHooks('select', selectedItem, event);
    if (this.isCommandPassive(selectedItem)) {
      return;
    }
    const selRanges = this.hot.getSelectedRange();
    const normalizedSelection = selRanges ? (0, _utils.normalizeSelection)(selRanges) : [];
    this.runLocalHooks('executeCommand', selectedItem.key, normalizedSelection, event);
    if (this.isSubMenu()) {
      this.parentMenu.runLocalHooks('executeCommand', selectedItem.key, normalizedSelection, event);
    }
  }

  /**
   * Checks if the passed command is passive or not. The command is passive when it's marked as
   * disabled, the descriptor object contains `isCommand` property set to `false`, command
   * is a separator, or the item is recognized as submenu. For passive items the menu is not
   * closed automatically after the user trigger the command through the UI.
   *
   * @param {object} commandDescriptor Selected menu item from the menu data source.
   * @returns {boolean}
   */
  isCommandPassive(commandDescriptor) {
    return commandDescriptor.isCommand === false || (0, _utils.isItemSeparator)(commandDescriptor) || (0, _utils.isItemDisabled)(commandDescriptor, this.hot) || (0, _utils.isItemSubMenu)(commandDescriptor);
  }

  /**
   * Set offset menu position for specified area (`above`, `below`, `left` or `right`).
   *
   * @param {string} area Specified area name (`above`, `below`, `left` or `right`).
   * @param {number} offset Offset value.
   */
  setOffset(area) {
    let offset = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
    this.positioner.setOffset(area, offset);
  }

  /**
   * Set menu position based on dom event or based on literal object.
   *
   * @param {Event|object} coords Event or literal Object with coordinates.
   */
  setPosition(coords) {
    if (this.isSubMenu()) {
      this.positioner.setParentElement(this.parentMenu.container);
    }
    this.positioner.setElement(this.container).updatePosition(coords);
  }

  /**
   * Create container/wrapper for handsontable.
   *
   * @private
   * @param {string} [name] Class name.
   * @returns {HTMLElement}
   */
  createContainer() {
    let name = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;
    const doc = this.options.container.ownerDocument;
    let className = name;
    let container;
    if (className) {
      if ((0, _function.isFunction)(className)) {
        className = className.call(this.hot);
        if (className === null || (0, _mixed.isUndefined)(className)) {
          className = '';
        } else {
          className = className.toString();
        }
      }
      className = className.replace(/[^A-z0-9]/g, '_');
      className = `${this.options.className}Sub_${className}`;
      container = doc.querySelector(`.${this.options.className}.${className}`);
    }
    if (!container) {
      container = doc.createElement('div');
      (0, _element.addClass)(container, `htMenu ${this.options.className}`);
      if (className) {
        (0, _element.addClass)(container, className);
      }
      this.options.container.appendChild(container);
    }
    return container;
  }

  /**
   * On after init listener.
   *
   * @private
   */
  onAfterInit() {
    const {
      wtTable
    } = this.hotMenu.view._wt;
    const data = this.hotMenu.getSettings().data;
    const hiderStyle = wtTable.hider.style;
    const holderStyle = wtTable.holder.style;
    const currentHiderWidth = parseInt(hiderStyle.width, 10);
    const realHeight = (0, _array.arrayReduce)(data, (accumulator, value) => accumulator + (value.name === _predefinedItems.SEPARATOR ? 1 : 26), 0);

    // Additional 3px to menu's size because of additional border around its `table.htCore`.
    holderStyle.width = `${currentHiderWidth + 3}px`;
    holderStyle.height = `${realHeight + 3}px`;
    hiderStyle.height = holderStyle.height;

    // Replace the default accessibility tags with the context menu's
    if (this.hot.getSettings().ariaTags) {
      (0, _element.setAttribute)(this.hotMenu.rootElement, [(0, _a11y.A11Y_MENU)(), (0, _a11y.A11Y_TABINDEX)(-1)]);
    }
  }

  /**
   * Document mouse down listener.
   *
   * @private
   * @param {Event} event The mouse event object.
   */
  onDocumentMouseDown(event) {
    if (!this.isOpened()) {
      return;
    }

    // Close menu when clicked element is not belongs to menu itself
    if (this.options.standalone && this.hotMenu && !(0, _element.isChildOf)(event.target, this.hotMenu.rootElement)) {
      this.close(true);

      // Automatically close menu when clicked element is not belongs to menu or submenu (not necessarily to itself)
    } else if ((this.isAllSubMenusClosed() || this.isSubMenu()) && !(0, _element.isChildOf)(event.target, '.htMenu')) {
      this.close(true);
    }
  }

  /**
   * Document's contextmenu listener.
   *
   * @private
   * @param {MouseEvent} event The mouse event object.
   */
  onDocumentContextMenu(event) {
    if (!this.isOpened()) {
      return;
    }
    if ((0, _element.hasClass)(event.target, 'htCore') && (0, _element.isChildOf)(event.target, this.hotMenu.rootElement)) {
      event.preventDefault();
    }
  }
}
exports.Menu = Menu;
(0, _object.mixin)(Menu, _localHooks.default);