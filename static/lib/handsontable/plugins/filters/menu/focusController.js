"use strict";

exports.__esModule = true;
exports.createMenuFocusController = createMenuFocusController;
var _focusNavigator = require("./focusNavigator");
var _select = require("../ui/select");
var _base = require("../ui/_base");
var _link = require("../ui/link");
const SHORTCUTS_MENU_CONTEXT = 'filters';

/**
 * @typedef MenuFocusNavigator
 * @property {function(number): void} setCurrentPage Sets the current index of the selected focus.
 * @property {function(): number} getCurrentPage Gets the index of currently focus element.
 * @property {function(): void} toFirstItem Move the focus index to the first element in the list.
 * @property {function(): void} toLastItem Move the focus index to the last element in the list.
 * @property {function(): void} toNextItem Move the focus index to the next element in the list.
 * @property {function(): void} toPreviousItem Move the focus index to the previous element in the list.
 * @property {function(): void} clear Clear the internal state of the navigator.
 * @property {function(): void} listen Activate the navigator by listening the keyboard shortcuts.
 */
/**
 * Creates navigator controller for filter subcomponents in the menu.
 *
 * @param {Menu} mainMenu The main Menu instance.
 * @param {BaseUI[]} menuItems The list of the component's elements to paginate to.
 * @returns {Paginator}
 */
function createMenuFocusController(mainMenu, menuItems) {
  /**
   * @type {number} The last selected menu item (before clearing the the menu state after going
   * into the focus mode triggered by the TAB or SHIFT+TAB keys).
   */
  let lastSelectedMenuItem = -1;
  const focusNavigator = (0, _focusNavigator.createFocusNavigator)(menuItems);
  const updateNavigatorPosition = element => () => {
    if (mainMenu.isOpened()) {
      mainMenu.getKeyboardShortcutsCtrl().listen(SHORTCUTS_MENU_CONTEXT);
    }
    focusNavigator.setCurrentPage(menuItems.indexOf(element));
  };

  // update navigator position (internal state) to element that was recently clicked or focused
  menuItems.forEach(element => {
    if (element instanceof _base.BaseUI) {
      element.addLocalHook('click', updateNavigatorPosition(element));
      element.addLocalHook('focus', updateNavigatorPosition(element));
      element.addLocalHook('afterClose', updateNavigatorPosition(element));
    }
  });
  mainMenu.addLocalHook('afterSelectionChange', selectedItem => {
    if (!selectedItem.key.startsWith('filter_')) {
      focusNavigator.clear();
    }
  });

  /**
   * Extends the menu and submenus with new keyboard shortcuts.
   *
   * @param {*} menu The menu (as main menu or submenu) instance.
   */
  function addKeyboardShortcuts(menu) {
    const mainMenuShortcutsCtrl = mainMenu.getKeyboardShortcutsCtrl();
    const currentMenuShortcutsCtrl = menu.getKeyboardShortcutsCtrl();
    focusNavigator.clear();
    currentMenuShortcutsCtrl.addCustomShortcuts([{
      keys: [['Tab'], ['Shift', 'Tab']],
      forwardToContext: mainMenuShortcutsCtrl.getContext(SHORTCUTS_MENU_CONTEXT),
      callback: () => {
        if (menu.isSubMenu()) {
          menu.close();
        }
        mainMenuShortcutsCtrl.listen(SHORTCUTS_MENU_CONTEXT);
      }
    }]);
    if (menu.isSubMenu()) {
      return;
    }
    mainMenuShortcutsCtrl.addCustomShortcuts([{
      keys: [['Tab'], ['Shift', 'Tab']],
      callback: event => {
        const menuNavigator = mainMenu.getNavigator();
        if (menuNavigator.getCurrentPage() > -1) {
          lastSelectedMenuItem = menuNavigator.getCurrentPage();
        }
        menuNavigator.clear();
        if (event.shiftKey) {
          focusNavigator.toPreviousItem();
        } else {
          focusNavigator.toNextItem();
        }
      }
    }, {
      keys: [['Escape']],
      callback: () => {
        mainMenu.close();
      }
    }, {
      keys: [['Enter'], ['Space']],
      preventDefault: false,
      callback: event => {
        const element = menuItems[focusNavigator.getCurrentPage()];
        if (element instanceof _select.SelectUI) {
          element.openOptions();
          event.preventDefault();
        }
        if (element instanceof _link.LinkUI) {
          element.activate();
          event.preventDefault();
        }
        if (!(element instanceof _base.BaseUI)) {
          event.preventDefault();
        }
      }
    }], SHORTCUTS_MENU_CONTEXT);
  }
  mainMenu.addLocalHook('afterSubmenuOpen', addKeyboardShortcuts);
  mainMenu.addLocalHook('afterOpen', addKeyboardShortcuts);

  /**
   * Focuses the menu and switches its shortcut context to that one which controls
   * the focus navigation.
   */
  function listen() {
    mainMenu.focus();
    mainMenu.getKeyboardShortcutsCtrl().listen(SHORTCUTS_MENU_CONTEXT);
  }

  /**
   * Retrieves the last selected menu item (before clearing the state after going into the focus mode).
   *
   * @returns {number} The last selected menu item.
   */
  function getLastMenuPage() {
    return lastSelectedMenuItem;
  }
  return {
    ...focusNavigator,
    listen,
    getLastMenuPage
  };
}