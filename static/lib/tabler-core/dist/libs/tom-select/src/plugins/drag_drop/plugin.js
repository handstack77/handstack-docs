"use strict";
/**
 * Plugin: "drag_drop" (Tom Select)
 * Copyright (c) contributors
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this
 * file except in compliance with the License. You may obtain a copy of the License at:
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF
 * ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 *
 */
Object.defineProperty(exports, "__esModule", { value: true });
var utils_ts_1 = require("../../utils.ts");
var vanilla_ts_1 = require("../../vanilla.ts");
var insertAfter = function (referenceNode, newNode) {
    var _a;
    (_a = referenceNode.parentNode) === null || _a === void 0 ? void 0 : _a.insertBefore(newNode, referenceNode.nextSibling);
};
var insertBefore = function (referenceNode, newNode) {
    var _a;
    (_a = referenceNode.parentNode) === null || _a === void 0 ? void 0 : _a.insertBefore(newNode, referenceNode);
};
var isBefore = function (referenceNode, newNode) {
    do {
        newNode = newNode === null || newNode === void 0 ? void 0 : newNode.previousElementSibling;
        if (referenceNode == newNode) {
            return true;
        }
    } while (newNode && newNode.previousElementSibling);
    return false;
};
function default_1() {
    var self = this;
    if (self.settings.mode !== 'multi')
        return;
    var orig_lock = self.lock;
    var orig_unlock = self.unlock;
    var sortable = true;
    var drag_item;
    /**
     * Add draggable attribute to item
     */
    self.hook('after', 'setupTemplates', function () {
        var orig_render_item = self.settings.render.item;
        self.settings.render.item = function (data, escape) {
            var item = (0, vanilla_ts_1.getDom)(orig_render_item.call(self, data, escape));
            (0, vanilla_ts_1.setAttr)(item, { 'draggable': 'true' });
            // prevent doc_mousedown (see tom-select.ts)
            var mousedown = function (evt) {
                if (!sortable)
                    (0, utils_ts_1.preventDefault)(evt);
                evt.stopPropagation();
            };
            var dragStart = function (evt) {
                drag_item = item;
                setTimeout(function () {
                    item.classList.add('ts-dragging');
                }, 0);
            };
            var dragOver = function (evt) {
                evt.preventDefault();
                item.classList.add('ts-drag-over');
                moveitem(item, drag_item);
            };
            var dragLeave = function () {
                item.classList.remove('ts-drag-over');
            };
            var moveitem = function (targetitem, dragitem) {
                if (dragitem === undefined)
                    return;
                if (isBefore(dragitem, item)) {
                    insertAfter(targetitem, dragitem);
                }
                else {
                    insertBefore(targetitem, dragitem);
                }
            };
            var dragend = function () {
                document.querySelectorAll('.ts-drag-over').forEach(function (el) { return el.classList.remove('ts-drag-over'); });
                drag_item === null || drag_item === void 0 ? void 0 : drag_item.classList.remove('ts-dragging');
                drag_item = undefined;
                var values = [];
                self.control.querySelectorAll("[data-value]").forEach(function (el) {
                    if (el.dataset.value) {
                        var value = el.dataset.value;
                        if (value) {
                            values.push(value);
                        }
                    }
                });
                self.setValue(values);
            };
            (0, utils_ts_1.addEvent)(item, 'mousedown', mousedown);
            (0, utils_ts_1.addEvent)(item, 'dragstart', dragStart);
            (0, utils_ts_1.addEvent)(item, 'dragenter', dragOver);
            (0, utils_ts_1.addEvent)(item, 'dragover', dragOver);
            (0, utils_ts_1.addEvent)(item, 'dragleave', dragLeave);
            (0, utils_ts_1.addEvent)(item, 'dragend', dragend);
            return item;
        };
    });
    self.hook('instead', 'lock', function () {
        sortable = false;
        return orig_lock.call(self);
    });
    self.hook('instead', 'unlock', function () {
        sortable = true;
        return orig_unlock.call(self);
    });
}
exports.default = default_1;
;
