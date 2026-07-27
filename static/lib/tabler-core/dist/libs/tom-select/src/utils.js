"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.iterate = exports.append = exports.addSlashes = exports.getId = exports.isKeyDown = exports.addEvent = exports.preventDefault = exports.getSelection = exports.debounce_events = exports.loadDebounce = exports.timeout = exports.escape_html = exports.get_hash = exports.hash_key = void 0;
/**
 * Converts a scalar to its best string representation
 * for hash keys and HTML attribute values.
 *
 * Transformations:
 *   'str'     -> 'str'
 *   null      -> ''
 *   undefined -> ''
 *   true      -> '1'
 *   false     -> '0'
 *   0         -> '0'
 *   1         -> '1'
 *
 */
var hash_key = function (value) {
    if (typeof value === 'undefined' || value === null)
        return null;
    return (0, exports.get_hash)(value);
};
exports.hash_key = hash_key;
var get_hash = function (value) {
    if (typeof value === 'boolean')
        return value ? '1' : '0';
    return value + '';
};
exports.get_hash = get_hash;
/**
 * Escapes a string for use within HTML.
 *
 */
var escape_html = function (str) {
    return (str + '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
};
exports.escape_html = escape_html;
/**
 * use setTimeout if timeout > 0
 */
var timeout = function (fn, timeout) {
    if (timeout > 0) {
        return window.setTimeout(fn, timeout);
    }
    fn.call(null);
    return null;
};
exports.timeout = timeout;
/**
 * Debounce the user provided load function
 *
 */
var loadDebounce = function (fn, delay) {
    var timeout;
    return function (value, callback) {
        var self = this;
        if (timeout) {
            self.loading = Math.max(self.loading - 1, 0);
            clearTimeout(timeout);
        }
        timeout = setTimeout(function () {
            timeout = null;
            self.loadedSearches[value] = true;
            fn.call(self, value, callback);
        }, delay);
    };
};
exports.loadDebounce = loadDebounce;
/**
 * Debounce all fired events types listed in `types`
 * while executing the provided `fn`.
 *
 */
var debounce_events = function (self, types, fn) {
    var type;
    var trigger = self.trigger;
    var event_args = {};
    // override trigger method
    self.trigger = function () {
        var type = arguments[0];
        if (types.indexOf(type) !== -1) {
            event_args[type] = arguments;
        }
        else {
            return trigger.apply(self, arguments);
        }
    };
    // invoke provided function
    fn.apply(self, []);
    self.trigger = trigger;
    // trigger queued events
    for (var _i = 0, types_1 = types; _i < types_1.length; _i++) {
        type = types_1[_i];
        if (type in event_args) {
            trigger.apply(self, event_args[type]);
        }
    }
};
exports.debounce_events = debounce_events;
/**
 * Determines the current selection within a text input control.
 * Returns an object containing:
 *   - start
 *   - length
 *
 * Note: "selectionStart, selectionEnd ... apply only to inputs of types text, search, URL, tel and password"
 * 	- https://developer.mozilla.org/en-US/docs/Web/API/HTMLInputElement/setSelectionRange
 */
var getSelection = function (input) {
    return {
        start: input.selectionStart || 0,
        length: (input.selectionEnd || 0) - (input.selectionStart || 0),
    };
};
exports.getSelection = getSelection;
/**
 * Prevent default
 *
 */
var preventDefault = function (evt, stop) {
    if (stop === void 0) { stop = false; }
    if (evt) {
        evt.preventDefault();
        if (stop) {
            evt.stopPropagation();
        }
    }
};
exports.preventDefault = preventDefault;
/**
 * Add event helper
 *
 */
var addEvent = function (target, type, callback, options) {
    target.addEventListener(type, callback, options);
};
exports.addEvent = addEvent;
/**
 * Return true if the requested key is down
 * Will return false if more than one control character is pressed ( when [ctrl+shift+a] != [ctrl+a] )
 * The current evt may not always set ( eg calling advanceSelection() )
 *
 */
var isKeyDown = function (key_name, evt) {
    if (!evt) {
        return false;
    }
    if (!evt[key_name]) {
        return false;
    }
    var count = (evt.altKey ? 1 : 0) + (evt.ctrlKey ? 1 : 0) + (evt.shiftKey ? 1 : 0) + (evt.metaKey ? 1 : 0);
    if (count === 1) {
        return true;
    }
    return false;
};
exports.isKeyDown = isKeyDown;
/**
 * Get the id of an element
 * If the id attribute is not set, set the attribute with the given id
 *
 */
var getId = function (el, id) {
    var existing_id = el.getAttribute('id');
    if (existing_id) {
        return existing_id;
    }
    el.setAttribute('id', id);
    return id;
};
exports.getId = getId;
/**
 * Returns a string with backslashes added before characters that need to be escaped.
 */
var addSlashes = function (str) {
    return str.replace(/[\\"']/g, '\\$&');
};
exports.addSlashes = addSlashes;
/**
 *
 */
var append = function (parent, node) {
    if (node)
        parent.append(node);
};
exports.append = append;
/**
 * Iterates over arrays and hashes.
 *
 * ```
 * iterate(this.items, function(item, id) {
 *    // invoked for each item
 * });
 * ```
 *
 */
var iterate = function (object, callback) {
    if (Array.isArray(object)) {
        object.forEach(callback);
    }
    else {
        for (var key in object) {
            if (object.hasOwnProperty(key)) {
                callback(object[key], key);
            }
        }
    }
};
exports.iterate = iterate;
