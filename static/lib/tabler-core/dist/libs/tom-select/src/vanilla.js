"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.replaceNode = exports.setAttr = exports.nodeIndex = exports.isEmptyObject = exports.getTail = exports.parentMatch = exports.castAsArray = exports.classesArray = exports.removeClasses = exports.addClasses = exports.applyCSS = exports.triggerEvent = exports.escapeQuery = exports.isHtmlString = exports.getDom = void 0;
var utils_ts_1 = require("./utils.ts");
/**
 * Return a dom element from either a dom query string, jQuery object, a dom element or html string
 * https://stackoverflow.com/questions/494143/creating-a-new-dom-element-from-an-html-string-using-built-in-dom-methods-or-pro/35385518#35385518
 *
 * param query should be {}
 */
var getDom = function (query) {
    if (query.jquery) {
        return query[0];
    }
    if (query instanceof HTMLElement) {
        return query;
    }
    if ((0, exports.isHtmlString)(query)) {
        var tpl = document.createElement('template');
        tpl.innerHTML = query.trim(); // Never return a text node of whitespace as the result
        return tpl.content.firstChild;
    }
    return document.querySelector(query);
};
exports.getDom = getDom;
var isHtmlString = function (arg) {
    if (typeof arg === 'string' && arg.indexOf('<') > -1) {
        return true;
    }
    return false;
};
exports.isHtmlString = isHtmlString;
var escapeQuery = function (query) {
    return query.replace(/['"\\]/g, '\\$&');
};
exports.escapeQuery = escapeQuery;
/**
 * Dispatch an event
 *
 */
var triggerEvent = function (dom_el, event_name) {
    var event = document.createEvent('HTMLEvents');
    event.initEvent(event_name, true, false);
    dom_el.dispatchEvent(event);
};
exports.triggerEvent = triggerEvent;
/**
 * Apply CSS rules to a dom element
 *
 */
var applyCSS = function (dom_el, css) {
    Object.assign(dom_el.style, css);
};
exports.applyCSS = applyCSS;
/**
 * Add css classes
 *
 */
var addClasses = function (elmts) {
    var classes = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        classes[_i - 1] = arguments[_i];
    }
    var norm_classes = (0, exports.classesArray)(classes);
    elmts = (0, exports.castAsArray)(elmts);
    elmts.map(function (el) {
        norm_classes.map(function (cls) {
            el.classList.add(cls);
        });
    });
};
exports.addClasses = addClasses;
/**
 * Remove css classes
 *
 */
var removeClasses = function (elmts) {
    var classes = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        classes[_i - 1] = arguments[_i];
    }
    var norm_classes = (0, exports.classesArray)(classes);
    elmts = (0, exports.castAsArray)(elmts);
    elmts.map(function (el) {
        norm_classes.map(function (cls) {
            el.classList.remove(cls);
        });
    });
};
exports.removeClasses = removeClasses;
/**
 * Return arguments
 *
 */
var classesArray = function (args) {
    var classes = [];
    (0, utils_ts_1.iterate)(args, function (_classes) {
        if (typeof _classes === 'string') {
            _classes = _classes.trim().split(/[\t\n\f\r\s]/);
        }
        if (Array.isArray(_classes)) {
            classes = classes.concat(_classes);
        }
    });
    return classes.filter(Boolean);
};
exports.classesArray = classesArray;
/**
 * Create an array from arg if it's not already an array
 *
 */
var castAsArray = function (arg) {
    if (!Array.isArray(arg)) {
        arg = [arg];
    }
    return arg;
};
exports.castAsArray = castAsArray;
/**
 * Get the closest node to the evt.target matching the selector
 * Stops at wrapper
 *
 */
var parentMatch = function (target, selector, wrapper) {
    if (wrapper && !wrapper.contains(target)) {
        return;
    }
    while (target && target.matches) {
        if (target.matches(selector)) {
            return target;
        }
        target = target.parentNode;
    }
};
exports.parentMatch = parentMatch;
/**
 * Get the first or last item from an array
 *
 * > 0 - right (last)
 * <= 0 - left (first)
 *
 */
var getTail = function (list, direction) {
    if (direction === void 0) { direction = 0; }
    if (direction > 0) {
        return list[list.length - 1];
    }
    return list[0];
};
exports.getTail = getTail;
/**
 * Return true if an object is empty
 *
 */
var isEmptyObject = function (obj) {
    return (Object.keys(obj).length === 0);
};
exports.isEmptyObject = isEmptyObject;
/**
 * Get the index of an element amongst sibling nodes of the same type
 *
 */
var nodeIndex = function (el, amongst) {
    if (!el)
        return -1;
    amongst = amongst || el.nodeName;
    var i = 0;
    while (el = el.previousElementSibling) {
        if (el.matches(amongst)) {
            i++;
        }
    }
    return i;
};
exports.nodeIndex = nodeIndex;
/**
 * Set attributes of an element
 *
 */
var setAttr = function (el, attrs) {
    (0, utils_ts_1.iterate)(attrs, function (val, attr) {
        if (val == null) {
            el.removeAttribute(attr);
        }
        else {
            el.setAttribute(attr, '' + val);
        }
    });
};
exports.setAttr = setAttr;
/**
 * Replace a node
 */
var replaceNode = function (existing, replacement) {
    if (existing.parentNode)
        existing.parentNode.replaceChild(replacement, existing);
};
exports.replaceNode = replaceNode;
