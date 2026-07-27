"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var microevent_ts_1 = require("./contrib/microevent.ts");
var microplugin_ts_1 = require("./contrib/microplugin.ts");
var sifter_1 = require("@orchidjs/sifter");
var unicode_variants_1 = require("@orchidjs/unicode-variants");
var highlight_ts_1 = require("./contrib/highlight.ts");
var constants = require("./constants.ts");
var getSettings_ts_1 = require("./getSettings.ts");
var utils_ts_1 = require("./utils.ts");
var vanilla_ts_1 = require("./vanilla.ts");
var instance_i = 0;
var TomSelect = /** @class */ (function (_super) {
    __extends(TomSelect, _super);
    function TomSelect(input_arg, user_settings) {
        var _this = _super.call(this) || this;
        _this.order = 0;
        _this.isOpen = false;
        _this.isDisabled = false;
        _this.isReadOnly = false;
        _this.isInvalid = false; // @deprecated 1.8
        _this.isValid = true;
        _this.isLocked = false;
        _this.isFocused = false;
        _this.isInputHidden = false;
        _this.isSetup = false;
        _this.ignoreFocus = false;
        _this.ignoreHover = false;
        _this.hasOptions = false;
        _this.lastValue = '';
        _this.caretPos = 0;
        _this.loading = 0;
        _this.loadedSearches = {};
        _this.activeOption = null;
        _this.activeItems = [];
        _this.optgroups = {};
        _this.options = {};
        _this.userOptions = {};
        _this.items = [];
        _this.refreshTimeout = null;
        instance_i++;
        var dir;
        var input = (0, vanilla_ts_1.getDom)(input_arg);
        if (input.tomselect) {
            throw new Error('Tom Select already initialized on this element');
        }
        input.tomselect = _this;
        // detect rtl environment
        var computedStyle = window.getComputedStyle && window.getComputedStyle(input, null);
        dir = computedStyle.getPropertyValue('direction');
        // setup default state
        var settings = (0, getSettings_ts_1.default)(input, user_settings);
        _this.settings = settings;
        _this.input = input;
        _this.tabIndex = input.tabIndex || 0;
        _this.is_select_tag = input.tagName.toLowerCase() === 'select';
        _this.rtl = /rtl/i.test(dir);
        _this.inputId = (0, utils_ts_1.getId)(input, 'tomselect-' + instance_i);
        _this.isRequired = input.required;
        // search system
        _this.sifter = new sifter_1.Sifter(_this.options, { diacritics: settings.diacritics });
        // option-dependent defaults
        settings.mode = settings.mode || (settings.maxItems === 1 ? 'single' : 'multi');
        if (typeof settings.hideSelected !== 'boolean') {
            settings.hideSelected = settings.mode === 'multi';
        }
        if (typeof settings.hidePlaceholder !== 'boolean') {
            settings.hidePlaceholder = settings.mode !== 'multi';
        }
        // set up createFilter callback
        var filter = settings.createFilter;
        if (typeof filter !== 'function') {
            if (typeof filter === 'string') {
                filter = new RegExp(filter);
            }
            if (filter instanceof RegExp) {
                settings.createFilter = function (input) { return filter.test(input); };
            }
            else {
                settings.createFilter = function (value) {
                    return _this.settings.duplicates || !_this.options[value];
                };
            }
        }
        _this.initializePlugins(settings.plugins);
        _this.setupCallbacks();
        _this.setupTemplates();
        // Create all elements
        var wrapper = (0, vanilla_ts_1.getDom)('<div>');
        var control = (0, vanilla_ts_1.getDom)('<div>');
        var dropdown = _this._render('dropdown');
        var dropdown_content = (0, vanilla_ts_1.getDom)("<div role=\"listbox\" tabindex=\"-1\">");
        var classes = _this.input.getAttribute('class') || '';
        var inputMode = settings.mode;
        var control_input;
        (0, vanilla_ts_1.addClasses)(wrapper, settings.wrapperClass, classes, inputMode);
        (0, vanilla_ts_1.addClasses)(control, settings.controlClass);
        (0, utils_ts_1.append)(wrapper, control);
        (0, vanilla_ts_1.addClasses)(dropdown, settings.dropdownClass, inputMode);
        if (settings.copyClassesToDropdown) {
            (0, vanilla_ts_1.addClasses)(dropdown, classes);
        }
        (0, vanilla_ts_1.addClasses)(dropdown_content, settings.dropdownContentClass);
        (0, utils_ts_1.append)(dropdown, dropdown_content);
        (0, vanilla_ts_1.getDom)(settings.dropdownParent || wrapper).appendChild(dropdown);
        // default controlInput
        if ((0, vanilla_ts_1.isHtmlString)(settings.controlInput)) {
            control_input = (0, vanilla_ts_1.getDom)(settings.controlInput);
            // set attributes
            var attrs = ['autocorrect', 'autocapitalize', 'autocomplete', 'spellcheck'];
            (0, utils_ts_1.iterate)(attrs, function (attr) {
                var _a;
                if (input.getAttribute(attr)) {
                    (0, vanilla_ts_1.setAttr)(control_input, (_a = {}, _a[attr] = input.getAttribute(attr), _a));
                }
            });
            control_input.tabIndex = -1;
            control.appendChild(control_input);
            _this.focus_node = control_input;
            // dom element
        }
        else if (settings.controlInput) {
            control_input = (0, vanilla_ts_1.getDom)(settings.controlInput);
            _this.focus_node = control_input;
        }
        else {
            control_input = (0, vanilla_ts_1.getDom)('<input/>');
            _this.focus_node = control;
        }
        _this.wrapper = wrapper;
        _this.dropdown = dropdown;
        _this.dropdown_content = dropdown_content;
        _this.control = control;
        _this.control_input = control_input;
        _this.setup();
        return _this;
    }
    /**
     * set up event bindings.
     *
     */
    TomSelect.prototype.setup = function () {
        var self = this;
        var settings = self.settings;
        var control_input = self.control_input;
        var dropdown = self.dropdown;
        var dropdown_content = self.dropdown_content;
        var wrapper = self.wrapper;
        var control = self.control;
        var input = self.input;
        var focus_node = self.focus_node;
        var passive_event = { passive: true };
        var listboxId = self.inputId + '-ts-dropdown';
        (0, vanilla_ts_1.setAttr)(dropdown_content, {
            id: listboxId
        });
        (0, vanilla_ts_1.setAttr)(focus_node, {
            role: 'combobox',
            'aria-haspopup': 'listbox',
            'aria-expanded': 'false',
            'aria-controls': listboxId
        });
        var control_id = (0, utils_ts_1.getId)(focus_node, self.inputId + '-ts-control');
        var query = "label[for='" + (0, vanilla_ts_1.escapeQuery)(self.inputId) + "']";
        var label = document.querySelector(query);
        var label_click = self.focus.bind(self);
        if (label) {
            (0, utils_ts_1.addEvent)(label, 'click', label_click);
            (0, vanilla_ts_1.setAttr)(label, { for: control_id });
            var label_id = (0, utils_ts_1.getId)(label, self.inputId + '-ts-label');
            (0, vanilla_ts_1.setAttr)(focus_node, { 'aria-labelledby': label_id });
            (0, vanilla_ts_1.setAttr)(dropdown_content, { 'aria-labelledby': label_id });
        }
        wrapper.style.width = input.style.width;
        if (self.plugins.names.length) {
            var classes_plugins = 'plugin-' + self.plugins.names.join(' plugin-');
            (0, vanilla_ts_1.addClasses)([wrapper, dropdown], classes_plugins);
        }
        if ((settings.maxItems === null || settings.maxItems > 1) && self.is_select_tag) {
            (0, vanilla_ts_1.setAttr)(input, { multiple: 'multiple' });
        }
        if (settings.placeholder) {
            (0, vanilla_ts_1.setAttr)(control_input, { placeholder: settings.placeholder });
        }
        // if splitOn was not passed in, construct it from the delimiter to allow pasting universally
        if (!settings.splitOn && settings.delimiter) {
            settings.splitOn = new RegExp('\\s*' + (0, unicode_variants_1.escape_regex)(settings.delimiter) + '+\\s*');
        }
        // debounce user defined load() if loadThrottle > 0
        // after initializePlugins() so plugins can create/modify user defined loaders
        if (settings.load && settings.loadThrottle) {
            settings.load = (0, utils_ts_1.loadDebounce)(settings.load, settings.loadThrottle);
        }
        (0, utils_ts_1.addEvent)(dropdown, 'mousemove', function () {
            self.ignoreHover = false;
        });
        (0, utils_ts_1.addEvent)(dropdown, 'mouseenter', function (e) {
            var target_match = (0, vanilla_ts_1.parentMatch)(e.target, '[data-selectable]', dropdown);
            if (target_match)
                self.onOptionHover(e, target_match);
        }, { capture: true });
        // clicking on an option should select it
        (0, utils_ts_1.addEvent)(dropdown, 'click', function (evt) {
            var option = (0, vanilla_ts_1.parentMatch)(evt.target, '[data-selectable]');
            if (option) {
                self.onOptionSelect(evt, option);
                (0, utils_ts_1.preventDefault)(evt, true);
            }
        });
        (0, utils_ts_1.addEvent)(control, 'click', function (evt) {
            var target_match = (0, vanilla_ts_1.parentMatch)(evt.target, '[data-ts-item]', control);
            if (target_match && self.onItemSelect(evt, target_match)) {
                (0, utils_ts_1.preventDefault)(evt, true);
                return;
            }
            // retain focus (see control_input mousedown)
            if (control_input.value != '') {
                return;
            }
            self.onClick();
            (0, utils_ts_1.preventDefault)(evt, true);
        });
        // keydown on focus_node for arrow_down/arrow_up
        (0, utils_ts_1.addEvent)(focus_node, 'keydown', function (e) { return self.onKeyDown(e); });
        // keypress and input/keyup
        (0, utils_ts_1.addEvent)(control_input, 'keypress', function (e) { return self.onKeyPress(e); });
        (0, utils_ts_1.addEvent)(control_input, 'input', function (e) { return self.onInput(e); });
        (0, utils_ts_1.addEvent)(focus_node, 'blur', function (e) { return self.onBlur(e); });
        (0, utils_ts_1.addEvent)(focus_node, 'focus', function (e) { return self.onFocus(e); });
        (0, utils_ts_1.addEvent)(control_input, 'paste', function (e) { return self.onPaste(e); });
        var doc_mousedown = function (evt) {
            // blur if target is outside of this instance
            // dropdown is not always inside wrapper
            var target = evt.composedPath()[0];
            if (!wrapper.contains(target) && !dropdown.contains(target)) {
                if (self.isFocused) {
                    self.blur();
                }
                self.inputState();
                return;
            }
            // retain focus by preventing native handling. if the
            // event target is the input it should not be modified.
            // otherwise, text selection within the input won't work.
            // Fixes bug #212 which is no covered by tests
            if (target == control_input && self.isOpen) {
                evt.stopPropagation();
                // clicking anywhere in the control should not blur the control_input (which would close the dropdown)
            }
            else {
                (0, utils_ts_1.preventDefault)(evt, true);
            }
        };
        var win_scroll = function () {
            if (self.isOpen) {
                self.positionDropdown();
            }
        };
        (0, utils_ts_1.addEvent)(document, 'mousedown', doc_mousedown);
        (0, utils_ts_1.addEvent)(window, 'scroll', win_scroll, passive_event);
        (0, utils_ts_1.addEvent)(window, 'resize', win_scroll, passive_event);
        this._destroy = function () {
            document.removeEventListener('mousedown', doc_mousedown);
            window.removeEventListener('scroll', win_scroll);
            window.removeEventListener('resize', win_scroll);
            if (label)
                label.removeEventListener('click', label_click);
        };
        // store original html and tab index so that they can be
        // restored when the destroy() method is called.
        this.revertSettings = {
            innerHTML: input.innerHTML,
            tabIndex: input.tabIndex
        };
        input.tabIndex = -1;
        input.insertAdjacentElement('afterend', self.wrapper);
        self.sync(false);
        settings.items = [];
        delete settings.optgroups;
        delete settings.options;
        (0, utils_ts_1.addEvent)(input, 'invalid', function () {
            if (self.isValid) {
                self.isValid = false;
                self.isInvalid = true;
                self.refreshState();
            }
        });
        self.updateOriginalInput();
        self.refreshItems();
        self.close(false);
        self.inputState();
        self.isSetup = true;
        if (input.disabled) {
            self.disable();
        }
        else if (input.readOnly) {
            self.setReadOnly(true);
        }
        else {
            self.enable(); //sets tabIndex
        }
        self.on('change', this.onChange);
        (0, vanilla_ts_1.addClasses)(input, 'tomselected', 'ts-hidden-accessible');
        self.trigger('initialize');
        // preload options
        if (settings.preload === true) {
            self.preload();
        }
    };
    /**
     * Register options and optgroups
     *
     */
    TomSelect.prototype.setupOptions = function (options, optgroups) {
        var _this = this;
        if (options === void 0) { options = []; }
        if (optgroups === void 0) { optgroups = []; }
        // build options table
        this.addOptions(options);
        // build optgroup table
        (0, utils_ts_1.iterate)(optgroups, function (optgroup) {
            _this.registerOptionGroup(optgroup);
        });
    };
    /**
     * Sets up default rendering functions.
     */
    TomSelect.prototype.setupTemplates = function () {
        var self = this;
        var field_label = self.settings.labelField;
        var field_optgroup = self.settings.optgroupLabelField;
        var templates = {
            'optgroup': function (data) {
                var optgroup = document.createElement('div');
                optgroup.className = 'optgroup';
                optgroup.appendChild(data.options);
                return optgroup;
            },
            'optgroup_header': function (data, escape) {
                return '<div class="optgroup-header">' + escape(data[field_optgroup]) + '</div>';
            },
            'option': function (data, escape) {
                return '<div>' + escape(data[field_label]) + '</div>';
            },
            'item': function (data, escape) {
                return '<div>' + escape(data[field_label]) + '</div>';
            },
            'option_create': function (data, escape) {
                return '<div class="create">Add <strong>' + escape(data.input) + '</strong>&hellip;</div>';
            },
            'no_results': function () {
                return '<div class="no-results">No results found</div>';
            },
            'loading': function () {
                return '<div class="spinner"></div>';
            },
            'not_loading': function () { },
            'dropdown': function () {
                return '<div></div>';
            }
        };
        self.settings.render = Object.assign({}, templates, self.settings.render);
    };
    /**
     * Maps fired events to callbacks provided
     * in the settings used when creating the control.
     */
    TomSelect.prototype.setupCallbacks = function () {
        var key, fn;
        var callbacks = {
            'initialize': 'onInitialize',
            'change': 'onChange',
            'item_add': 'onItemAdd',
            'item_remove': 'onItemRemove',
            'item_select': 'onItemSelect',
            'clear': 'onClear',
            'option_add': 'onOptionAdd',
            'option_remove': 'onOptionRemove',
            'option_clear': 'onOptionClear',
            'optgroup_add': 'onOptionGroupAdd',
            'optgroup_remove': 'onOptionGroupRemove',
            'optgroup_clear': 'onOptionGroupClear',
            'dropdown_open': 'onDropdownOpen',
            'dropdown_close': 'onDropdownClose',
            'type': 'onType',
            'load': 'onLoad',
            'focus': 'onFocus',
            'blur': 'onBlur'
        };
        for (key in callbacks) {
            fn = this.settings[callbacks[key]];
            if (fn)
                this.on(key, fn);
        }
    };
    /**
     * Sync the Tom Select instance with the original input or select
     *
     */
    TomSelect.prototype.sync = function (get_settings) {
        if (get_settings === void 0) { get_settings = true; }
        var self = this;
        var settings = get_settings ? (0, getSettings_ts_1.default)(self.input, { delimiter: self.settings.delimiter }) : self.settings;
        self.setupOptions(settings.options, settings.optgroups);
        self.setValue(settings.items || [], true); // silent prevents recursion
        self.lastQuery = null; // so updated options will be displayed in dropdown
    };
    /**
     * Triggered when the main control element
     * has a click event.
     *
     */
    TomSelect.prototype.onClick = function () {
        var self = this;
        if (self.activeItems.length > 0) {
            self.clearActiveItems();
            self.focus();
            return;
        }
        if (self.isFocused && self.isOpen) {
            self.blur();
        }
        else {
            self.focus();
        }
    };
    /**
     * @deprecated v1.7
     *
     */
    TomSelect.prototype.onMouseDown = function () { };
    /**
     * Triggered when the value of the control has been changed.
     * This should propagate the event to the original DOM
     * input / select element.
     */
    TomSelect.prototype.onChange = function () {
        (0, vanilla_ts_1.triggerEvent)(this.input, 'input');
        (0, vanilla_ts_1.triggerEvent)(this.input, 'change');
    };
    /**
     * Triggered on <input> paste.
     *
     */
    TomSelect.prototype.onPaste = function (e) {
        var _this = this;
        var self = this;
        if (self.isInputHidden || self.isLocked) {
            (0, utils_ts_1.preventDefault)(e);
            return;
        }
        // If a regex or string is included, this will split the pasted
        // input and create Items for each separate value
        if (!self.settings.splitOn) {
            return;
        }
        // Wait for pasted text to be recognized in value
        setTimeout(function () {
            var pastedText = self.inputValue();
            if (!pastedText.match(self.settings.splitOn)) {
                return;
            }
            var splitInput = pastedText.trim().split(self.settings.splitOn);
            (0, utils_ts_1.iterate)(splitInput, function (piece) {
                var hash = (0, utils_ts_1.hash_key)(piece);
                if (hash) {
                    if (_this.options[piece]) {
                        self.addItem(piece);
                    }
                    else {
                        self.createItem(piece);
                    }
                }
            });
        }, 0);
    };
    /**
     * Triggered on <input> keypress.
     *
     */
    TomSelect.prototype.onKeyPress = function (e) {
        var self = this;
        if (self.isLocked) {
            (0, utils_ts_1.preventDefault)(e);
            return;
        }
        var character = String.fromCharCode(e.keyCode || e.which);
        if (self.settings.create && self.settings.mode === 'multi' && character === self.settings.delimiter) {
            self.createItem();
            (0, utils_ts_1.preventDefault)(e);
            return;
        }
    };
    /**
     * Triggered on <input> keydown.
     *
     */
    TomSelect.prototype.onKeyDown = function (e) {
        var self = this;
        self.ignoreHover = true;
        if (self.isLocked) {
            if (e.keyCode !== constants.KEY_TAB) {
                (0, utils_ts_1.preventDefault)(e);
            }
            return;
        }
        switch (e.keyCode) {
            // ctrl+A: select all
            case constants.KEY_A:
                if ((0, utils_ts_1.isKeyDown)(constants.KEY_SHORTCUT, e)) {
                    if (self.control_input.value == '') {
                        (0, utils_ts_1.preventDefault)(e);
                        self.selectAll();
                        return;
                    }
                }
                break;
            // esc: close dropdown
            case constants.KEY_ESC:
                if (self.isOpen) {
                    (0, utils_ts_1.preventDefault)(e, true);
                    self.close();
                }
                self.clearActiveItems();
                return;
            // down: open dropdown or move selection down
            case constants.KEY_DOWN:
                if (!self.isOpen && self.hasOptions) {
                    self.open();
                }
                else if (self.activeOption) {
                    var next = self.getAdjacent(self.activeOption, 1);
                    if (next)
                        self.setActiveOption(next);
                }
                (0, utils_ts_1.preventDefault)(e);
                return;
            // up: move selection up
            case constants.KEY_UP:
                if (self.activeOption) {
                    var prev = self.getAdjacent(self.activeOption, -1);
                    if (prev)
                        self.setActiveOption(prev);
                }
                (0, utils_ts_1.preventDefault)(e);
                return;
            // return: select active option
            case constants.KEY_RETURN:
                if (self.canSelect(self.activeOption)) {
                    self.onOptionSelect(e, self.activeOption);
                    (0, utils_ts_1.preventDefault)(e);
                    // if the option_create=null, the dropdown might be closed
                }
                else if (self.settings.create && self.createItem()) {
                    (0, utils_ts_1.preventDefault)(e);
                    // don't submit form when searching for a value
                }
                else if (document.activeElement == self.control_input && self.isOpen) {
                    (0, utils_ts_1.preventDefault)(e);
                }
                return;
            // left: modifiy item selection to the left
            case constants.KEY_LEFT:
                self.advanceSelection(-1, e);
                return;
            // right: modifiy item selection to the right
            case constants.KEY_RIGHT:
                self.advanceSelection(1, e);
                return;
            // tab: select active option and/or create item
            case constants.KEY_TAB:
                if (self.settings.selectOnTab) {
                    if (self.canSelect(self.activeOption)) {
                        self.onOptionSelect(e, self.activeOption);
                        // prevent default [tab] behaviour of jump to the next field
                        // if select isFull, then the dropdown won't be open and [tab] will work normally
                        (0, utils_ts_1.preventDefault)(e);
                    }
                    if (self.settings.create && self.createItem()) {
                        (0, utils_ts_1.preventDefault)(e);
                    }
                }
                return;
            // delete|backspace: delete items
            case constants.KEY_BACKSPACE:
            case constants.KEY_DELETE:
                self.deleteSelection(e);
                return;
        }
        // don't enter text in the control_input when active items are selected
        if (self.isInputHidden && !(0, utils_ts_1.isKeyDown)(constants.KEY_SHORTCUT, e)) {
            (0, utils_ts_1.preventDefault)(e);
        }
    };
    /**
     * Triggered on <input> keyup.
     *
     */
    TomSelect.prototype.onInput = function (e) {
        var _this = this;
        if (this.isLocked) {
            return;
        }
        var value = this.inputValue();
        if (this.lastValue === value)
            return;
        this.lastValue = value;
        if (value == '') {
            this._onInput();
            return;
        }
        if (this.refreshTimeout) {
            window.clearTimeout(this.refreshTimeout);
        }
        this.refreshTimeout = (0, utils_ts_1.timeout)(function () {
            _this.refreshTimeout = null;
            _this._onInput();
        }, this.settings.refreshThrottle);
    };
    TomSelect.prototype._onInput = function () {
        var value = this.lastValue;
        if (this.settings.shouldLoad.call(this, value)) {
            this.load(value);
        }
        this.refreshOptions();
        this.trigger('type', value);
    };
    /**
     * Triggered when the user rolls over
     * an option in the autocomplete dropdown menu.
     *
     */
    TomSelect.prototype.onOptionHover = function (evt, option) {
        if (this.ignoreHover)
            return;
        this.setActiveOption(option, false);
    };
    /**
     * Triggered on <input> focus.
     *
     */
    TomSelect.prototype.onFocus = function (e) {
        var self = this;
        var wasFocused = self.isFocused;
        if (self.isDisabled || self.isReadOnly) {
            self.blur();
            (0, utils_ts_1.preventDefault)(e);
            return;
        }
        if (self.ignoreFocus)
            return;
        self.isFocused = true;
        if (self.settings.preload === 'focus')
            self.preload();
        if (!wasFocused)
            self.trigger('focus');
        if (!self.activeItems.length) {
            self.inputState();
            self.refreshOptions(!!self.settings.openOnFocus);
        }
        self.refreshState();
    };
    /**
     * Triggered on <input> blur.
     *
     */
    TomSelect.prototype.onBlur = function (e) {
        if (document.hasFocus() === false)
            return;
        var self = this;
        if (!self.isFocused)
            return;
        self.isFocused = false;
        self.ignoreFocus = false;
        var deactivate = function () {
            self.close();
            self.setActiveItem();
            self.setCaret(self.items.length);
            self.trigger('blur');
        };
        if (self.settings.create && self.settings.createOnBlur) {
            self.createItem(null, deactivate);
        }
        else {
            deactivate();
        }
    };
    /**
     * Triggered when the user clicks on an option
     * in the autocomplete dropdown menu.
     *
     */
    TomSelect.prototype.onOptionSelect = function (evt, option) {
        var value, self = this;
        // should not be possible to trigger a option under a disabled optgroup
        if (option.parentElement && option.parentElement.matches('[data-disabled]')) {
            return;
        }
        if (option.classList.contains('create')) {
            self.createItem(null, function () {
                if (self.settings.closeAfterSelect) {
                    self.close();
                }
            });
        }
        else {
            value = option.dataset.value;
            if (typeof value !== 'undefined') {
                self.lastQuery = null;
                self.addItem(value);
                if (self.settings.closeAfterSelect) {
                    self.close();
                }
                if (!self.settings.hideSelected && evt.type && /click/.test(evt.type)) {
                    self.setActiveOption(option);
                }
            }
        }
    };
    /**
     * Return true if the given option can be selected
     *
     */
    TomSelect.prototype.canSelect = function (option) {
        if (this.isOpen && option && this.dropdown_content.contains(option)) {
            return true;
        }
        return false;
    };
    /**
     * Triggered when the user clicks on an item
     * that has been selected.
     *
     */
    TomSelect.prototype.onItemSelect = function (evt, item) {
        var self = this;
        if (!self.isLocked && self.settings.mode === 'multi') {
            (0, utils_ts_1.preventDefault)(evt);
            self.setActiveItem(item, evt);
            return true;
        }
        return false;
    };
    /**
     * Determines whether or not to invoke
     * the user-provided option provider / loader
     *
     * Note, there is a subtle difference between
     * this.canLoad() and this.settings.shouldLoad();
     *
     *	- settings.shouldLoad() is a user-input validator.
     *	When false is returned, the not_loading template
     *	will be added to the dropdown
     *
     *	- canLoad() is lower level validator that checks
     * 	the Tom Select instance. There is no inherent user
     *	feedback when canLoad returns false
     *
     */
    TomSelect.prototype.canLoad = function (value) {
        if (!this.settings.load)
            return false;
        if (this.loadedSearches.hasOwnProperty(value))
            return false;
        return true;
    };
    /**
     * Invokes the user-provided option provider / loader.
     *
     */
    TomSelect.prototype.load = function (value) {
        var self = this;
        if (!self.canLoad(value))
            return;
        (0, vanilla_ts_1.addClasses)(self.wrapper, self.settings.loadingClass);
        self.loading++;
        var callback = self.loadCallback.bind(self);
        self.settings.load.call(self, value, callback);
    };
    /**
     * Invoked by the user-provided option provider
     *
     */
    TomSelect.prototype.loadCallback = function (options, optgroups) {
        var self = this;
        self.loading = Math.max(self.loading - 1, 0);
        self.lastQuery = null;
        self.clearActiveOption(); // when new results load, focus should be on first option
        self.setupOptions(options, optgroups);
        self.refreshOptions(self.isFocused && !self.isInputHidden);
        if (!self.loading) {
            (0, vanilla_ts_1.removeClasses)(self.wrapper, self.settings.loadingClass);
        }
        self.trigger('load', options, optgroups);
    };
    TomSelect.prototype.preload = function () {
        var classList = this.wrapper.classList;
        if (classList.contains('preloaded'))
            return;
        classList.add('preloaded');
        this.load('');
    };
    /**
     * Sets the input field of the control to the specified value.
     *
     */
    TomSelect.prototype.setTextboxValue = function (value) {
        if (value === void 0) { value = ''; }
        var input = this.control_input;
        var changed = input.value !== value;
        if (changed) {
            input.value = value;
            (0, vanilla_ts_1.triggerEvent)(input, 'update');
            this.lastValue = value;
        }
    };
    /**
     * Returns the value of the control. If multiple items
     * can be selected (e.g. <select multiple>), this returns
     * an array. If only one item can be selected, this
     * returns a string.
     *
     */
    TomSelect.prototype.getValue = function () {
        if (this.is_select_tag && this.input.hasAttribute('multiple')) {
            return this.items;
        }
        return this.items.join(this.settings.delimiter);
    };
    /**
     * Resets the selected items to the given value.
     *
     */
    TomSelect.prototype.setValue = function (value, silent) {
        var _this = this;
        var events = silent ? [] : ['change'];
        (0, utils_ts_1.debounce_events)(this, events, function () {
            _this.clear(silent);
            _this.addItems(value, silent);
        });
    };
    /**
     * Resets the number of max items to the given value
     *
     */
    TomSelect.prototype.setMaxItems = function (value) {
        if (value === 0)
            value = null; //reset to unlimited items.
        this.settings.maxItems = value;
        this.refreshState();
    };
    /**
     * Sets the selected item.
     *
     */
    TomSelect.prototype.setActiveItem = function (item, e) {
        var self = this;
        var eventName;
        var i, begin, end, swap;
        var last;
        if (self.settings.mode === 'single')
            return;
        // clear the active selection
        if (!item) {
            self.clearActiveItems();
            if (self.isFocused) {
                self.inputState();
            }
            return;
        }
        // modify selection
        eventName = e && e.type.toLowerCase();
        if (eventName === 'click' && (0, utils_ts_1.isKeyDown)('shiftKey', e) && self.activeItems.length) {
            last = self.getLastActive();
            begin = Array.prototype.indexOf.call(self.control.children, last);
            end = Array.prototype.indexOf.call(self.control.children, item);
            if (begin > end) {
                swap = begin;
                begin = end;
                end = swap;
            }
            for (i = begin; i <= end; i++) {
                item = self.control.children[i];
                if (self.activeItems.indexOf(item) === -1) {
                    self.setActiveItemClass(item);
                }
            }
            (0, utils_ts_1.preventDefault)(e);
        }
        else if ((eventName === 'click' && (0, utils_ts_1.isKeyDown)(constants.KEY_SHORTCUT, e)) || (eventName === 'keydown' && (0, utils_ts_1.isKeyDown)('shiftKey', e))) {
            if (item.classList.contains('active')) {
                self.removeActiveItem(item);
            }
            else {
                self.setActiveItemClass(item);
            }
        }
        else {
            self.clearActiveItems();
            self.setActiveItemClass(item);
        }
        // ensure control has focus
        self.inputState();
        if (!self.isFocused) {
            self.focus();
        }
    };
    /**
     * Set the active and last-active classes
     *
     */
    TomSelect.prototype.setActiveItemClass = function (item) {
        var self = this;
        var last_active = self.control.querySelector('.last-active');
        if (last_active)
            (0, vanilla_ts_1.removeClasses)(last_active, 'last-active');
        (0, vanilla_ts_1.addClasses)(item, 'active last-active');
        self.trigger('item_select', item);
        if (self.activeItems.indexOf(item) == -1) {
            self.activeItems.push(item);
        }
    };
    /**
     * Remove active item
     *
     */
    TomSelect.prototype.removeActiveItem = function (item) {
        var idx = this.activeItems.indexOf(item);
        this.activeItems.splice(idx, 1);
        (0, vanilla_ts_1.removeClasses)(item, 'active');
    };
    /**
     * Clears all the active items
     *
     */
    TomSelect.prototype.clearActiveItems = function () {
        (0, vanilla_ts_1.removeClasses)(this.activeItems, 'active');
        this.activeItems = [];
    };
    /**
     * Sets the selected item in the dropdown menu
     * of available options.
     *
     */
    TomSelect.prototype.setActiveOption = function (option, scroll) {
        if (scroll === void 0) { scroll = true; }
        if (option === this.activeOption) {
            return;
        }
        this.clearActiveOption();
        if (!option)
            return;
        this.activeOption = option;
        (0, vanilla_ts_1.setAttr)(this.focus_node, { 'aria-activedescendant': option.getAttribute('id') });
        (0, vanilla_ts_1.setAttr)(option, { 'aria-selected': 'true' });
        (0, vanilla_ts_1.addClasses)(option, 'active');
        if (scroll)
            this.scrollToOption(option);
    };
    /**
     * Sets the dropdown_content scrollTop to display the option
     *
     */
    TomSelect.prototype.scrollToOption = function (option, behavior) {
        if (!option)
            return;
        var content = this.dropdown_content;
        var height_menu = content.clientHeight;
        var scrollTop = content.scrollTop || 0;
        var height_item = option.offsetHeight;
        var y = option.getBoundingClientRect().top - content.getBoundingClientRect().top + scrollTop;
        if (y + height_item > height_menu + scrollTop) {
            this.scroll(y - height_menu + height_item, behavior);
        }
        else if (y < scrollTop) {
            this.scroll(y, behavior);
        }
    };
    /**
     * Scroll the dropdown to the given position
     *
     */
    TomSelect.prototype.scroll = function (scrollTop, behavior) {
        var content = this.dropdown_content;
        if (behavior) {
            content.style.scrollBehavior = behavior;
        }
        content.scrollTop = scrollTop;
        content.style.scrollBehavior = '';
    };
    /**
     * Clears the active option
     *
     */
    TomSelect.prototype.clearActiveOption = function () {
        if (this.activeOption) {
            (0, vanilla_ts_1.removeClasses)(this.activeOption, 'active');
            (0, vanilla_ts_1.setAttr)(this.activeOption, { 'aria-selected': null });
        }
        this.activeOption = null;
        (0, vanilla_ts_1.setAttr)(this.focus_node, { 'aria-activedescendant': null });
    };
    /**
     * Selects all items (CTRL + A).
     */
    TomSelect.prototype.selectAll = function () {
        var self = this;
        if (self.settings.mode === 'single')
            return;
        var activeItems = self.controlChildren();
        if (!activeItems.length)
            return;
        self.inputState();
        self.close();
        self.activeItems = activeItems;
        (0, utils_ts_1.iterate)(activeItems, function (item) {
            self.setActiveItemClass(item);
        });
    };
    /**
     * Determines if the control_input should be in a hidden or visible state
     *
     */
    TomSelect.prototype.inputState = function () {
        var self = this;
        if (!self.control.contains(self.control_input))
            return;
        (0, vanilla_ts_1.setAttr)(self.control_input, { placeholder: self.settings.placeholder });
        if (self.activeItems.length > 0 || (!self.isFocused && self.settings.hidePlaceholder && self.items.length > 0)) {
            self.setTextboxValue();
            self.isInputHidden = true;
        }
        else {
            if (self.settings.hidePlaceholder && self.items.length > 0) {
                (0, vanilla_ts_1.setAttr)(self.control_input, { placeholder: '' });
            }
            self.isInputHidden = false;
        }
        self.wrapper.classList.toggle('input-hidden', self.isInputHidden);
    };
    /**
     * Get the input value
     */
    TomSelect.prototype.inputValue = function () {
        return this.control_input.value.trim();
    };
    /**
     * Gives the control focus.
     */
    TomSelect.prototype.focus = function () {
        var self = this;
        if (self.isDisabled || self.isReadOnly)
            return;
        self.ignoreFocus = true;
        if (self.control_input.offsetWidth) {
            self.control_input.focus();
        }
        else {
            self.focus_node.focus();
        }
        setTimeout(function () {
            self.ignoreFocus = false;
            self.onFocus();
        }, 0);
    };
    /**
     * Forces the control out of focus.
     *
     */
    TomSelect.prototype.blur = function () {
        this.focus_node.blur();
        this.onBlur();
    };
    /**
     * Returns a function that scores an object
     * to show how good of a match it is to the
     * provided query.
     *
     * @return {function}
     */
    TomSelect.prototype.getScoreFunction = function (query) {
        return this.sifter.getScoreFunction(query, this.getSearchOptions());
    };
    /**
     * Returns search options for sifter (the system
     * for scoring and sorting results).
     *
     * @see https://github.com/orchidjs/sifter.js
     * @return {object}
     */
    TomSelect.prototype.getSearchOptions = function () {
        var settings = this.settings;
        var sort = settings.sortField;
        if (typeof settings.sortField === 'string') {
            sort = [{ field: settings.sortField }];
        }
        return {
            fields: settings.searchField,
            conjunction: settings.searchConjunction,
            sort: sort,
            nesting: settings.nesting
        };
    };
    /**
     * Searches through available options and returns
     * a sorted array of matches.
     *
     */
    TomSelect.prototype.search = function (query) {
        var result, calculateScore;
        var self = this;
        var options = this.getSearchOptions();
        // validate user-provided result scoring function
        if (self.settings.score) {
            calculateScore = self.settings.score.call(self, query);
            if (typeof calculateScore !== 'function') {
                throw new Error('Tom Select "score" setting must be a function that returns a function');
            }
        }
        // perform search
        if (query !== self.lastQuery) {
            self.lastQuery = query;
            result = self.sifter.search(query, Object.assign(options, { score: calculateScore }));
            self.currentResults = result;
        }
        else {
            result = Object.assign({}, self.currentResults);
        }
        // filter out selected items
        if (self.settings.hideSelected) {
            result.items = result.items.filter(function (item) {
                var hashed = (0, utils_ts_1.hash_key)(item.id);
                return !(hashed && self.items.indexOf(hashed) !== -1);
            });
        }
        return result;
    };
    /**
     * Refreshes the list of available options shown
     * in the autocomplete dropdown menu.
     *
     */
    TomSelect.prototype.refreshOptions = function (triggerDropdown) {
        if (triggerDropdown === void 0) { triggerDropdown = true; }
        var i, j, k, n, optgroup, optgroups, html, has_create_option, active_group;
        var create;
        var groups = {};
        var groups_order = [];
        var self = this;
        var query = self.inputValue();
        var same_query = query === self.lastQuery || (query == '' && self.lastQuery == null);
        var results = self.search(query);
        var active_option = null;
        var show_dropdown = self.settings.shouldOpen || false;
        var dropdown_content = self.dropdown_content;
        if (same_query) {
            active_option = self.activeOption;
            if (active_option) {
                active_group = active_option.closest('[data-group]');
            }
        }
        // build markup
        n = results.items.length;
        if (typeof self.settings.maxOptions === 'number') {
            n = Math.min(n, self.settings.maxOptions);
        }
        if (n > 0) {
            show_dropdown = true;
        }
        // get fragment for group and the position of the group in group_order
        var getGroupFragment = function (optgroup, order) {
            var group_order_i = groups[optgroup];
            if (group_order_i !== undefined) {
                var order_group = groups_order[group_order_i];
                if (order_group !== undefined) {
                    return [group_order_i, order_group.fragment];
                }
            }
            var group_fragment = document.createDocumentFragment();
            group_order_i = groups_order.length;
            groups_order.push({ fragment: group_fragment, order: order, optgroup: optgroup });
            return [group_order_i, group_fragment];
        };
        // render and group available options individually
        for (i = 0; i < n; i++) {
            // get option dom element
            var item = results.items[i];
            if (!item)
                continue;
            var opt_value = item.id;
            var option = self.options[opt_value];
            if (option === undefined)
                continue;
            var opt_hash = (0, utils_ts_1.get_hash)(opt_value);
            var option_el = self.getOption(opt_hash, true);
            // toggle 'selected' class
            if (!self.settings.hideSelected) {
                option_el.classList.toggle('selected', self.items.includes(opt_hash));
            }
            optgroup = option[self.settings.optgroupField] || '';
            optgroups = Array.isArray(optgroup) ? optgroup : [optgroup];
            for (j = 0, k = optgroups && optgroups.length; j < k; j++) {
                optgroup = optgroups[j];
                var order = option.$order;
                var self_optgroup = self.optgroups[optgroup];
                if (self_optgroup === undefined) {
                    optgroup = '';
                }
                else {
                    order = self_optgroup.$order;
                }
                var _a = getGroupFragment(optgroup, order), group_order_i = _a[0], group_fragment = _a[1];
                // nodes can only have one parent, so if the option is in mutple groups, we need a clone
                if (j > 0) {
                    option_el = option_el.cloneNode(true);
                    (0, vanilla_ts_1.setAttr)(option_el, { id: option.$id + '-clone-' + j, 'aria-selected': null });
                    option_el.classList.add('ts-cloned');
                    (0, vanilla_ts_1.removeClasses)(option_el, 'active');
                    // make sure we keep the activeOption in the same group
                    if (self.activeOption && self.activeOption.dataset.value == opt_value) {
                        if (active_group && active_group.dataset.group === optgroup.toString()) {
                            active_option = option_el;
                        }
                    }
                }
                group_fragment.appendChild(option_el);
                if (optgroup != '') {
                    groups[optgroup] = group_order_i;
                }
            }
        }
        // sort optgroups
        if (self.settings.lockOptgroupOrder) {
            groups_order.sort(function (a, b) {
                return a.order - b.order;
            });
        }
        // render optgroup headers & join groups
        html = document.createDocumentFragment();
        (0, utils_ts_1.iterate)(groups_order, function (group_order) {
            var group_fragment = group_order.fragment;
            var optgroup = group_order.optgroup;
            if (!group_fragment || !group_fragment.children.length)
                return;
            var group_heading = self.optgroups[optgroup];
            if (group_heading !== undefined) {
                var group_options = document.createDocumentFragment();
                var header = self.render('optgroup_header', group_heading);
                (0, utils_ts_1.append)(group_options, header);
                (0, utils_ts_1.append)(group_options, group_fragment);
                var group_html = self.render('optgroup', { group: group_heading, options: group_options });
                (0, utils_ts_1.append)(html, group_html);
            }
            else {
                (0, utils_ts_1.append)(html, group_fragment);
            }
        });
        dropdown_content.innerHTML = '';
        (0, utils_ts_1.append)(dropdown_content, html);
        // highlight matching terms inline
        if (self.settings.highlight) {
            (0, highlight_ts_1.removeHighlight)(dropdown_content);
            if (results.query.length && results.tokens.length) {
                (0, utils_ts_1.iterate)(results.tokens, function (tok) {
                    (0, highlight_ts_1.highlight)(dropdown_content, tok.regex);
                });
            }
        }
        // helper method for adding templates to dropdown
        var add_template = function (template) {
            var content = self.render(template, { input: query });
            if (content) {
                show_dropdown = true;
                dropdown_content.insertBefore(content, dropdown_content.firstChild);
            }
            return content;
        };
        // add loading message
        if (self.loading) {
            add_template('loading');
            // invalid query
        }
        else if (!self.settings.shouldLoad.call(self, query)) {
            add_template('not_loading');
            // add no_results message
        }
        else if (results.items.length === 0) {
            add_template('no_results');
        }
        // add create option
        has_create_option = self.canCreate(query);
        if (has_create_option) {
            create = add_template('option_create');
        }
        // activate
        self.hasOptions = results.items.length > 0 || has_create_option;
        if (show_dropdown) {
            if (results.items.length > 0) {
                if (!active_option && self.settings.mode === 'single' && self.items[0] != undefined) {
                    active_option = self.getOption(self.items[0]);
                }
                if (!dropdown_content.contains(active_option)) {
                    var active_index = 0;
                    if (create && !self.settings.addPrecedence) {
                        active_index = 1;
                    }
                    active_option = self.selectable()[active_index];
                }
            }
            else if (create) {
                active_option = create;
            }
            if (triggerDropdown && !self.isOpen) {
                self.open();
                self.scrollToOption(active_option, 'auto');
            }
            self.setActiveOption(active_option);
        }
        else {
            self.clearActiveOption();
            if (triggerDropdown && self.isOpen) {
                self.close(false); // if create_option=null, we want the dropdown to close but not reset the textbox value
            }
        }
    };
    /**
     * Return list of selectable options
     *
     */
    TomSelect.prototype.selectable = function () {
        return this.dropdown_content.querySelectorAll('[data-selectable]');
    };
    /**
     * Adds an available option. If it already exists,
     * nothing will happen. Note: this does not refresh
     * the options list dropdown (use `refreshOptions`
     * for that).
     *
     * Usage:
     *
     *   this.addOption(data)
     *
     */
    TomSelect.prototype.addOption = function (data, user_created) {
        if (user_created === void 0) { user_created = false; }
        var self = this;
        // @deprecated 1.7.7
        // use addOptions( array, user_created ) for adding multiple options
        if (Array.isArray(data)) {
            self.addOptions(data, user_created);
            return false;
        }
        var key = (0, utils_ts_1.hash_key)(data[self.settings.valueField]);
        if (key === null || self.options.hasOwnProperty(key)) {
            return false;
        }
        data.$order = data.$order || ++self.order;
        data.$id = self.inputId + '-opt-' + data.$order;
        self.options[key] = data;
        self.lastQuery = null;
        if (user_created) {
            self.userOptions[key] = user_created;
            self.trigger('option_add', key, data);
        }
        return key;
    };
    /**
     * Add multiple options
     *
     */
    TomSelect.prototype.addOptions = function (data, user_created) {
        var _this = this;
        if (user_created === void 0) { user_created = false; }
        (0, utils_ts_1.iterate)(data, function (dat) {
            _this.addOption(dat, user_created);
        });
    };
    /**
     * @deprecated 1.7.7
     */
    TomSelect.prototype.registerOption = function (data) {
        return this.addOption(data);
    };
    /**
     * Registers an option group to the pool of option groups.
     *
     * @return {boolean|string}
     */
    TomSelect.prototype.registerOptionGroup = function (data) {
        var key = (0, utils_ts_1.hash_key)(data[this.settings.optgroupValueField]);
        if (key === null)
            return false;
        data.$order = data.$order || ++this.order;
        this.optgroups[key] = data;
        return key;
    };
    /**
     * Registers a new optgroup for options
     * to be bucketed into.
     *
     */
    TomSelect.prototype.addOptionGroup = function (id, data) {
        var hashed_id;
        data[this.settings.optgroupValueField] = id;
        if (hashed_id = this.registerOptionGroup(data)) {
            this.trigger('optgroup_add', hashed_id, data);
        }
    };
    /**
     * Removes an existing option group.
     *
     */
    TomSelect.prototype.removeOptionGroup = function (id) {
        if (this.optgroups.hasOwnProperty(id)) {
            delete this.optgroups[id];
            this.clearCache();
            this.trigger('optgroup_remove', id);
        }
    };
    /**
     * Clears all existing option groups.
     */
    TomSelect.prototype.clearOptionGroups = function () {
        this.optgroups = {};
        this.clearCache();
        this.trigger('optgroup_clear');
    };
    /**
     * Updates an option available for selection. If
     * it is visible in the selected items or options
     * dropdown, it will be re-rendered automatically.
     *
     */
    TomSelect.prototype.updateOption = function (value, data) {
        var self = this;
        var item_new;
        var index_item;
        var value_old = (0, utils_ts_1.hash_key)(value);
        var value_new = (0, utils_ts_1.hash_key)(data[self.settings.valueField]);
        // sanity checks
        if (value_old === null)
            return;
        var data_old = self.options[value_old];
        if (data_old == undefined)
            return;
        if (typeof value_new !== 'string')
            throw new Error('Value must be set in option data');
        var option = self.getOption(value_old);
        var item = self.getItem(value_old);
        data.$order = data.$order || data_old.$order;
        delete self.options[value_old];
        // invalidate render cache
        // don't remove existing node yet, we'll remove it after replacing it
        self.uncacheValue(value_new);
        self.options[value_new] = data;
        // update the option if it's in the dropdown
        if (option) {
            if (self.dropdown_content.contains(option)) {
                var option_new = self._render('option', data);
                (0, vanilla_ts_1.replaceNode)(option, option_new);
                if (self.activeOption === option) {
                    self.setActiveOption(option_new);
                }
            }
            option.remove();
        }
        // update the item if we have one
        if (item) {
            index_item = self.items.indexOf(value_old);
            if (index_item !== -1) {
                self.items.splice(index_item, 1, value_new);
            }
            item_new = self._render('item', data);
            if (item.classList.contains('active'))
                (0, vanilla_ts_1.addClasses)(item_new, 'active');
            (0, vanilla_ts_1.replaceNode)(item, item_new);
        }
        // invalidate last query because we might have updated the sortField
        self.lastQuery = null;
    };
    /**
     * Removes a single option.
     *
     */
    TomSelect.prototype.removeOption = function (value, silent) {
        var self = this;
        value = (0, utils_ts_1.get_hash)(value);
        self.uncacheValue(value);
        delete self.userOptions[value];
        delete self.options[value];
        self.lastQuery = null;
        self.trigger('option_remove', value);
        self.removeItem(value, silent);
    };
    /**
     * Clears all options.
     */
    TomSelect.prototype.clearOptions = function (filter) {
        var boundFilter = (filter || this.clearFilter).bind(this);
        this.loadedSearches = {};
        this.userOptions = {};
        this.clearCache();
        var selected = {};
        (0, utils_ts_1.iterate)(this.options, function (option, key) {
            if (boundFilter(option, key)) {
                selected[key] = option;
            }
        });
        this.options = this.sifter.items = selected;
        this.lastQuery = null;
        this.trigger('option_clear');
    };
    /**
     * Used by clearOptions() to decide whether or not an option should be removed
     * Return true to keep an option, false to remove
     *
     */
    TomSelect.prototype.clearFilter = function (option, value) {
        if (this.items.indexOf(value) >= 0) {
            return true;
        }
        return false;
    };
    /**
     * Returns the dom element of the option
     * matching the given value.
     *
     */
    TomSelect.prototype.getOption = function (value, create) {
        if (create === void 0) { create = false; }
        var hashed = (0, utils_ts_1.hash_key)(value);
        if (hashed === null)
            return null;
        var option = this.options[hashed];
        if (option != undefined) {
            if (option.$div) {
                return option.$div;
            }
            if (create) {
                return this._render('option', option);
            }
        }
        return null;
    };
    /**
     * Returns the dom element of the next or previous dom element of the same type
     * Note: adjacent options may not be adjacent DOM elements (optgroups)
     *
     */
    TomSelect.prototype.getAdjacent = function (option, direction, type) {
        if (type === void 0) { type = 'option'; }
        var self = this, all;
        if (!option) {
            return null;
        }
        if (type == 'item') {
            all = self.controlChildren();
        }
        else {
            all = self.dropdown_content.querySelectorAll('[data-selectable]');
        }
        for (var i = 0; i < all.length; i++) {
            if (all[i] != option) {
                continue;
            }
            if (direction > 0) {
                return all[i + 1];
            }
            return all[i - 1];
        }
        return null;
    };
    /**
     * Returns the dom element of the item
     * matching the given value.
     *
     */
    TomSelect.prototype.getItem = function (item) {
        if (typeof item == 'object') {
            return item;
        }
        var value = (0, utils_ts_1.hash_key)(item);
        return value !== null
            ? this.control.querySelector("[data-value=\"".concat((0, utils_ts_1.addSlashes)(value), "\"]"))
            : null;
    };
    /**
     * "Selects" multiple items at once. Adds them to the list
     * at the current caret position.
     *
     */
    TomSelect.prototype.addItems = function (values, silent) {
        var self = this;
        var items = Array.isArray(values) ? values : [values];
        items = items.filter(function (x) { return self.items.indexOf(x) === -1; });
        var last_item = items[items.length - 1];
        items.forEach(function (item) {
            self.isPending = (item !== last_item);
            self.addItem(item, silent);
        });
    };
    /**
     * "Selects" an item. Adds it to the list
     * at the current caret position.
     *
     */
    TomSelect.prototype.addItem = function (value, silent) {
        var _this = this;
        var events = silent ? [] : ['change', 'dropdown_close'];
        (0, utils_ts_1.debounce_events)(this, events, function () {
            var item, wasFull;
            var self = _this;
            var inputMode = self.settings.mode;
            var hashed = (0, utils_ts_1.hash_key)(value);
            if (hashed && self.items.indexOf(hashed) !== -1) {
                if (inputMode === 'single') {
                    self.close();
                }
                if (inputMode === 'single' || !self.settings.duplicates) {
                    return;
                }
            }
            if (hashed === null || !self.options.hasOwnProperty(hashed))
                return;
            if (inputMode === 'single')
                self.clear(silent);
            if (inputMode === 'multi' && self.isFull())
                return;
            item = self._render('item', self.options[hashed]);
            if (self.control.contains(item)) { // duplicates
                item = item.cloneNode(true);
            }
            wasFull = self.isFull();
            self.items.splice(self.caretPos, 0, hashed);
            self.insertAtCaret(item);
            if (self.isSetup) {
                // update menu / remove the option (if this is not one item being added as part of series)
                if (!self.isPending && self.settings.hideSelected) {
                    var option = self.getOption(hashed);
                    var next = self.getAdjacent(option, 1);
                    if (next) {
                        self.setActiveOption(next);
                    }
                }
                // refreshOptions after setActiveOption(),
                // otherwise setActiveOption() will be called by refreshOptions() with the wrong value
                if (!self.isPending && !self.settings.closeAfterSelect) {
                    self.refreshOptions(self.isFocused && inputMode !== 'single');
                }
                // hide the menu if the maximum number of items have been selected or no options are left
                if (self.settings.closeAfterSelect != false && self.isFull()) {
                    self.close();
                }
                else if (!self.isPending) {
                    self.positionDropdown();
                }
                self.trigger('item_add', hashed, item);
                if (!self.isPending) {
                    self.updateOriginalInput({ silent: silent });
                }
            }
            if (!self.isPending || (!wasFull && self.isFull())) {
                self.inputState();
                self.refreshState();
            }
        });
    };
    /**
     * Removes the selected item matching
     * the provided value.
     *
     */
    TomSelect.prototype.removeItem = function (item, silent) {
        if (item === void 0) { item = null; }
        var self = this;
        item = self.getItem(item);
        if (!item)
            return;
        var i, idx;
        var value = item.dataset.value;
        i = (0, vanilla_ts_1.nodeIndex)(item);
        item.remove();
        if (item.classList.contains('active')) {
            idx = self.activeItems.indexOf(item);
            self.activeItems.splice(idx, 1);
            (0, vanilla_ts_1.removeClasses)(item, 'active');
        }
        self.items.splice(i, 1);
        self.lastQuery = null;
        if (!self.settings.persist && self.userOptions.hasOwnProperty(value)) {
            self.removeOption(value, silent);
        }
        if (i < self.caretPos) {
            self.setCaret(self.caretPos - 1);
        }
        self.updateOriginalInput({ silent: silent });
        self.refreshState();
        self.positionDropdown();
        self.trigger('item_remove', value, item);
    };
    /**
     * Invokes the `create` method provided in the
     * TomSelect options that should provide the data
     * for the new item, given the user input.
     *
     * Once this completes, it will be added
     * to the item list.
     *
     */
    TomSelect.prototype.createItem = function (input, callback) {
        var _a;
        if (input === void 0) { input = null; }
        if (callback === void 0) { callback = function () { }; }
        // triggerDropdown parameter @deprecated 2.1.1
        if (arguments.length === 3) {
            callback = arguments[2];
        }
        if (typeof callback != 'function') {
            callback = function () { };
        }
        var self = this;
        var caret = self.caretPos;
        var output;
        input = input || self.inputValue();
        if (!self.canCreate(input)) {
            callback();
            return false;
        }
        self.lock();
        var created = false;
        var create = function (data) {
            self.unlock();
            if (!data || typeof data !== 'object')
                return callback();
            var value = (0, utils_ts_1.hash_key)(data[self.settings.valueField]);
            if (typeof value !== 'string') {
                return callback();
            }
            self.setTextboxValue();
            self.addOption(data, true);
            self.setCaret(caret);
            self.addItem(value);
            callback(data);
            created = true;
        };
        if (typeof self.settings.create === 'function') {
            output = self.settings.create.call(this, input, create);
        }
        else {
            output = (_a = {},
                _a[self.settings.labelField] = input,
                _a[self.settings.valueField] = input,
                _a);
        }
        if (!created) {
            create(output);
        }
        return true;
    };
    /**
     * Re-renders the selected item lists.
     */
    TomSelect.prototype.refreshItems = function () {
        var self = this;
        self.lastQuery = null;
        if (self.isSetup) {
            self.addItems(self.items);
        }
        self.updateOriginalInput();
        self.refreshState();
    };
    /**
     * Updates all state-dependent attributes
     * and CSS classes.
     */
    TomSelect.prototype.refreshState = function () {
        var self = this;
        self.refreshValidityState();
        var isFull = self.isFull();
        var isLocked = self.isLocked;
        self.wrapper.classList.toggle('rtl', self.rtl);
        var wrap_classList = self.wrapper.classList;
        wrap_classList.toggle('focus', self.isFocused);
        wrap_classList.toggle('disabled', self.isDisabled);
        wrap_classList.toggle('readonly', self.isReadOnly);
        wrap_classList.toggle('required', self.isRequired);
        wrap_classList.toggle('invalid', !self.isValid);
        wrap_classList.toggle('locked', isLocked);
        wrap_classList.toggle('full', isFull);
        wrap_classList.toggle('input-active', self.isFocused && !self.isInputHidden);
        wrap_classList.toggle('dropdown-active', self.isOpen);
        wrap_classList.toggle('has-options', (0, vanilla_ts_1.isEmptyObject)(self.options));
        wrap_classList.toggle('has-items', self.items.length > 0);
    };
    /**
     * Update the `required` attribute of both input and control input.
     *
     * The `required` property needs to be activated on the control input
     * for the error to be displayed at the right place. `required` also
     * needs to be temporarily deactivated on the input since the input is
     * hidden and can't show errors.
     */
    TomSelect.prototype.refreshValidityState = function () {
        var self = this;
        if (!self.input.validity) {
            return;
        }
        self.isValid = self.input.validity.valid;
        self.isInvalid = !self.isValid;
    };
    /**
     * Determines whether or not more items can be added
     * to the control without exceeding the user-defined maximum.
     *
     * @returns {boolean}
     */
    TomSelect.prototype.isFull = function () {
        return this.settings.maxItems !== null && this.items.length >= this.settings.maxItems;
    };
    /**
     * Refreshes the original <select> or <input>
     * element to reflect the current state.
     *
     */
    TomSelect.prototype.updateOriginalInput = function (opts) {
        if (opts === void 0) { opts = {}; }
        var self = this;
        var option, label;
        var empty_option = self.input.querySelector('option[value=""]');
        if (self.is_select_tag) {
            var selected_1 = [];
            var has_selected_1 = self.input.querySelectorAll('option:checked').length;
            function AddSelected(option_el, value, label) {
                if (!option_el) {
                    option_el = (0, vanilla_ts_1.getDom)('<option value="' + (0, utils_ts_1.escape_html)(value) + '">' + (0, utils_ts_1.escape_html)(label) + '</option>');
                }
                // don't move empty option from top of list
                // fixes bug in firefox https://bugzilla.mozilla.org/show_bug.cgi?id=1725293
                if (option_el != empty_option) {
                    self.input.append(option_el);
                }
                selected_1.push(option_el);
                // marking empty option as selected can break validation
                // fixes https://github.com/orchidjs/tom-select/issues/303
                if (option_el != empty_option || has_selected_1 > 0) {
                    option_el.selected = true;
                }
                return option_el;
            }
            // unselect all selected options
            self.input.querySelectorAll('option:checked').forEach(function (option_el) {
                option_el.selected = false;
            });
            // nothing selected?
            if (self.items.length == 0 && self.settings.mode == 'single') {
                AddSelected(empty_option, "", "");
                // order selected <option> tags for values in self.items
            }
            else {
                self.items.forEach(function (value) {
                    option = self.options[value];
                    label = option[self.settings.labelField] || '';
                    if (selected_1.includes(option.$option)) {
                        var reuse_opt = self.input.querySelector("option[value=\"".concat((0, utils_ts_1.addSlashes)(value), "\"]:not(:checked)"));
                        AddSelected(reuse_opt, value, label);
                    }
                    else {
                        option.$option = AddSelected(option.$option, value, label);
                    }
                });
            }
        }
        else {
            self.input.value = self.getValue();
        }
        if (self.isSetup) {
            if (!opts.silent) {
                self.trigger('change', self.getValue());
            }
        }
    };
    /**
     * Shows the autocomplete dropdown containing
     * the available options.
     */
    TomSelect.prototype.open = function () {
        var self = this;
        if (self.isLocked || self.isOpen || (self.settings.mode === 'multi' && self.isFull()))
            return;
        self.isOpen = true;
        (0, vanilla_ts_1.setAttr)(self.focus_node, { 'aria-expanded': 'true' });
        self.refreshState();
        (0, vanilla_ts_1.applyCSS)(self.dropdown, { visibility: 'hidden', display: 'block' });
        self.positionDropdown();
        (0, vanilla_ts_1.applyCSS)(self.dropdown, { visibility: 'visible', display: 'block' });
        self.focus();
        self.trigger('dropdown_open', self.dropdown);
    };
    /**
     * Closes the autocomplete dropdown menu.
     */
    TomSelect.prototype.close = function (setTextboxValue) {
        if (setTextboxValue === void 0) { setTextboxValue = true; }
        var self = this;
        var trigger = self.isOpen;
        if (setTextboxValue) {
            // before blur() to prevent form onchange event
            self.setTextboxValue();
            if (self.settings.mode === 'single' && self.items.length) {
                self.inputState();
            }
        }
        self.isOpen = false;
        (0, vanilla_ts_1.setAttr)(self.focus_node, { 'aria-expanded': 'false' });
        (0, vanilla_ts_1.applyCSS)(self.dropdown, { display: 'none' });
        if (self.settings.hideSelected) {
            self.clearActiveOption();
        }
        self.refreshState();
        if (trigger)
            self.trigger('dropdown_close', self.dropdown);
    };
    /**
     * Calculates and applies the appropriate
     * position of the dropdown if dropdownParent = 'body'.
     * Otherwise, position is determined by css
     */
    TomSelect.prototype.positionDropdown = function () {
        if (this.settings.dropdownParent !== 'body') {
            return;
        }
        var context = this.control;
        var rect = context.getBoundingClientRect();
        var top = context.offsetHeight + rect.top + window.scrollY;
        var left = rect.left + window.scrollX;
        (0, vanilla_ts_1.applyCSS)(this.dropdown, {
            width: rect.width + 'px',
            top: top + 'px',
            left: left + 'px'
        });
    };
    /**
     * Resets / clears all selected items
     * from the control.
     *
     */
    TomSelect.prototype.clear = function (silent) {
        var self = this;
        if (!self.items.length)
            return;
        var items = self.controlChildren();
        (0, utils_ts_1.iterate)(items, function (item) {
            self.removeItem(item, true);
        });
        self.inputState();
        if (!silent)
            self.updateOriginalInput();
        self.trigger('clear');
    };
    /**
     * A helper method for inserting an element
     * at the current caret position.
     *
     */
    TomSelect.prototype.insertAtCaret = function (el) {
        var self = this;
        var caret = self.caretPos;
        var target = self.control;
        target.insertBefore(el, target.children[caret] || null);
        self.setCaret(caret + 1);
    };
    /**
     * Removes the current selected item(s).
     *
     */
    TomSelect.prototype.deleteSelection = function (e) {
        var direction, selection, caret, tail;
        var self = this;
        direction = (e && e.keyCode === constants.KEY_BACKSPACE) ? -1 : 1;
        selection = (0, utils_ts_1.getSelection)(self.control_input);
        // determine items that will be removed
        var rm_items = [];
        if (self.activeItems.length) {
            tail = (0, vanilla_ts_1.getTail)(self.activeItems, direction);
            caret = (0, vanilla_ts_1.nodeIndex)(tail);
            if (direction > 0) {
                caret++;
            }
            (0, utils_ts_1.iterate)(self.activeItems, function (item) { return rm_items.push(item); });
        }
        else if ((self.isFocused || self.settings.mode === 'single') && self.items.length) {
            var items = self.controlChildren();
            var rm_item = void 0;
            if (direction < 0 && selection.start === 0 && selection.length === 0) {
                rm_item = items[self.caretPos - 1];
            }
            else if (direction > 0 && selection.start === self.inputValue().length) {
                rm_item = items[self.caretPos];
            }
            if (rm_item !== undefined) {
                rm_items.push(rm_item);
            }
        }
        if (!self.shouldDelete(rm_items, e)) {
            return false;
        }
        (0, utils_ts_1.preventDefault)(e, true);
        // perform removal
        if (typeof caret !== 'undefined') {
            self.setCaret(caret);
        }
        while (rm_items.length) {
            self.removeItem(rm_items.pop());
        }
        self.inputState();
        self.positionDropdown();
        self.refreshOptions(false);
        return true;
    };
    /**
     * Return true if the items should be deleted
     */
    TomSelect.prototype.shouldDelete = function (items, evt) {
        var values = items.map(function (item) { return item.dataset.value; });
        // allow the callback to abort
        if (!values.length || (typeof this.settings.onDelete === 'function' && this.settings.onDelete(values, evt) === false)) {
            return false;
        }
        return true;
    };
    /**
     * Selects the previous / next item (depending on the `direction` argument).
     *
     * > 0 - right
     * < 0 - left
     *
     */
    TomSelect.prototype.advanceSelection = function (direction, e) {
        var last_active, adjacent, self = this;
        if (self.rtl)
            direction *= -1;
        if (self.inputValue().length)
            return;
        // add or remove to active items
        if ((0, utils_ts_1.isKeyDown)(constants.KEY_SHORTCUT, e) || (0, utils_ts_1.isKeyDown)('shiftKey', e)) {
            last_active = self.getLastActive(direction);
            if (last_active) {
                if (!last_active.classList.contains('active')) {
                    adjacent = last_active;
                }
                else {
                    adjacent = self.getAdjacent(last_active, direction, 'item');
                }
                // if no active item, get items adjacent to the control input
            }
            else if (direction > 0) {
                adjacent = self.control_input.nextElementSibling;
            }
            else {
                adjacent = self.control_input.previousElementSibling;
            }
            if (adjacent) {
                if (adjacent.classList.contains('active')) {
                    self.removeActiveItem(last_active);
                }
                self.setActiveItemClass(adjacent); // mark as last_active !! after removeActiveItem() on last_active
            }
            // move caret to the left or right
        }
        else {
            self.moveCaret(direction);
        }
    };
    TomSelect.prototype.moveCaret = function (direction) { };
    /**
     * Get the last active item
     *
     */
    TomSelect.prototype.getLastActive = function (direction) {
        var last_active = this.control.querySelector('.last-active');
        if (last_active) {
            return last_active;
        }
        var result = this.control.querySelectorAll('.active');
        if (result) {
            return (0, vanilla_ts_1.getTail)(result, direction);
        }
    };
    /**
     * Moves the caret to the specified index.
     *
     * The input must be moved by leaving it in place and moving the
     * siblings, due to the fact that focus cannot be restored once lost
     * on mobile webkit devices
     *
     */
    TomSelect.prototype.setCaret = function (new_pos) {
        this.caretPos = this.items.length;
    };
    /**
     * Return list of item dom elements
     *
     */
    TomSelect.prototype.controlChildren = function () {
        return Array.from(this.control.querySelectorAll('[data-ts-item]'));
    };
    /**
     * Disables user input on the control. Used while
     * items are being asynchronously created.
     */
    TomSelect.prototype.lock = function () {
        this.setLocked(true);
    };
    /**
     * Re-enables user input on the control.
     */
    TomSelect.prototype.unlock = function () {
        this.setLocked(false);
    };
    /**
     * Disable or enable user input on the control
     */
    TomSelect.prototype.setLocked = function (lock) {
        if (lock === void 0) { lock = this.isReadOnly || this.isDisabled; }
        this.isLocked = lock;
        this.refreshState();
    };
    /**
     * Disables user input on the control completely.
     * While disabled, it cannot receive focus.
     */
    TomSelect.prototype.disable = function () {
        this.setDisabled(true);
        this.close();
    };
    /**
     * Enables the control so that it can respond
     * to focus and user input.
     */
    TomSelect.prototype.enable = function () {
        this.setDisabled(false);
    };
    TomSelect.prototype.setDisabled = function (disabled) {
        this.focus_node.tabIndex = disabled ? -1 : this.tabIndex;
        this.isDisabled = disabled;
        this.input.disabled = disabled;
        this.control_input.disabled = disabled;
        this.setLocked();
    };
    TomSelect.prototype.setReadOnly = function (isReadOnly) {
        this.isReadOnly = isReadOnly;
        this.input.readOnly = isReadOnly;
        this.control_input.readOnly = isReadOnly;
        this.setLocked();
    };
    /**
     * Completely destroys the control and
     * unbinds all event listeners so that it can
     * be garbage collected.
     */
    TomSelect.prototype.destroy = function () {
        var self = this;
        var revertSettings = self.revertSettings;
        self.trigger('destroy');
        self.off();
        self.wrapper.remove();
        self.dropdown.remove();
        self.input.innerHTML = revertSettings.innerHTML;
        self.input.tabIndex = revertSettings.tabIndex;
        (0, vanilla_ts_1.removeClasses)(self.input, 'tomselected', 'ts-hidden-accessible');
        self._destroy();
        delete self.input.tomselect;
    };
    /**
     * A helper method for rendering "item" and
     * "option" templates, given the data.
     *
     */
    TomSelect.prototype.render = function (templateName, data) {
        var id, html;
        var self = this;
        if (typeof this.settings.render[templateName] !== 'function') {
            return null;
        }
        // render markup
        html = self.settings.render[templateName].call(this, data, utils_ts_1.escape_html);
        if (!html) {
            return null;
        }
        html = (0, vanilla_ts_1.getDom)(html);
        // add mandatory attributes
        if (templateName === 'option' || templateName === 'option_create') {
            if (data[self.settings.disabledField]) {
                (0, vanilla_ts_1.setAttr)(html, { 'aria-disabled': 'true' });
            }
            else {
                (0, vanilla_ts_1.setAttr)(html, { 'data-selectable': '' });
            }
        }
        else if (templateName === 'optgroup') {
            id = data.group[self.settings.optgroupValueField];
            (0, vanilla_ts_1.setAttr)(html, { 'data-group': id });
            if (data.group[self.settings.disabledField]) {
                (0, vanilla_ts_1.setAttr)(html, { 'data-disabled': '' });
            }
        }
        if (templateName === 'option' || templateName === 'item') {
            var value = (0, utils_ts_1.get_hash)(data[self.settings.valueField]);
            (0, vanilla_ts_1.setAttr)(html, { 'data-value': value });
            // make sure we have some classes if a template is overwritten
            if (templateName === 'item') {
                (0, vanilla_ts_1.addClasses)(html, self.settings.itemClass);
                (0, vanilla_ts_1.setAttr)(html, { 'data-ts-item': '' });
            }
            else {
                (0, vanilla_ts_1.addClasses)(html, self.settings.optionClass);
                (0, vanilla_ts_1.setAttr)(html, {
                    role: 'option',
                    id: data.$id
                });
                // update cache
                data.$div = html;
                self.options[value] = data;
            }
        }
        return html;
    };
    /**
     * Type guarded rendering
     *
     */
    TomSelect.prototype._render = function (templateName, data) {
        var html = this.render(templateName, data);
        if (html == null) {
            throw 'HTMLElement expected';
        }
        return html;
    };
    /**
     * Clears the render cache for a template. If
     * no template is given, clears all render
     * caches.
     *
     */
    TomSelect.prototype.clearCache = function () {
        (0, utils_ts_1.iterate)(this.options, function (option) {
            if (option.$div) {
                option.$div.remove();
                delete option.$div;
            }
        });
    };
    /**
     * Removes a value from item and option caches
     *
     */
    TomSelect.prototype.uncacheValue = function (value) {
        var option_el = this.getOption(value);
        if (option_el)
            option_el.remove();
    };
    /**
     * Determines whether or not to display the
     * create item prompt, given a user input.
     *
     */
    TomSelect.prototype.canCreate = function (input) {
        return this.settings.create && (input.length > 0) && this.settings.createFilter.call(this, input);
    };
    /**
     * Wraps this.`method` so that `new_fn` can be invoked 'before', 'after', or 'instead' of the original method
     *
     * this.hook('instead','onKeyDown',function( arg1, arg2 ...){
     *
     * });
     */
    TomSelect.prototype.hook = function (when, method, new_fn) {
        var self = this;
        var orig_method = self[method];
        self[method] = function () {
            var result, result_new;
            if (when === 'after') {
                result = orig_method.apply(self, arguments);
            }
            result_new = new_fn.apply(self, arguments);
            if (when === 'instead') {
                return result_new;
            }
            if (when === 'before') {
                result = orig_method.apply(self, arguments);
            }
            return result;
        };
    };
    return TomSelect;
}((0, microplugin_ts_1.default)(microevent_ts_1.default)));
exports.default = TomSelect;
;
