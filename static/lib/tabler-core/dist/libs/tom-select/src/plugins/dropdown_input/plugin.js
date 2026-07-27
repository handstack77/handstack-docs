"use strict";
/**
 * Plugin: "dropdown_input" (Tom Select)
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
var constants = require("../../constants.ts");
var vanilla_ts_1 = require("../../vanilla.ts");
var utils_ts_1 = require("../../utils.ts");
function default_1() {
    var self = this;
    self.settings.shouldOpen = true; // make sure the input is shown even if there are no options to display in the dropdown
    self.hook('before', 'setup', function () {
        self.focus_node = self.control;
        (0, vanilla_ts_1.addClasses)(self.control_input, 'dropdown-input');
        var div = (0, vanilla_ts_1.getDom)('<div class="dropdown-input-wrap">');
        div.append(self.control_input);
        self.dropdown.insertBefore(div, self.dropdown.firstChild);
        // set a placeholder in the select control
        var placeholder = (0, vanilla_ts_1.getDom)('<input class="items-placeholder" tabindex="-1" />');
        placeholder.placeholder = self.settings.placeholder || '';
        self.control.append(placeholder);
    });
    self.on('initialize', function () {
        // set tabIndex on control to -1, otherwise [shift+tab] will put focus right back on control_input
        self.control_input.addEventListener('keydown', function (evt) {
            //addEvent(self.control_input,'keydown' as const,(evt:KeyboardEvent) =>{
            switch (evt.keyCode) {
                case constants.KEY_ESC:
                    if (self.isOpen) {
                        (0, utils_ts_1.preventDefault)(evt, true);
                        self.close();
                    }
                    self.clearActiveItems();
                    return;
                case constants.KEY_TAB:
                    self.focus_node.tabIndex = -1;
                    break;
            }
            return self.onKeyDown.call(self, evt);
        });
        self.on('blur', function () {
            self.focus_node.tabIndex = self.isDisabled ? -1 : self.tabIndex;
        });
        // give the control_input focus when the dropdown is open
        self.on('dropdown_open', function () {
            self.control_input.focus();
        });
        // prevent onBlur from closing when focus is on the control_input
        var orig_onBlur = self.onBlur;
        self.hook('instead', 'onBlur', function (evt) {
            if (evt && evt.relatedTarget == self.control_input)
                return;
            return orig_onBlur.call(self);
        });
        (0, utils_ts_1.addEvent)(self.control_input, 'blur', function () { return self.onBlur(); });
        // return focus to control to allow further keyboard input
        self.hook('before', 'close', function () {
            if (!self.isOpen)
                return;
            self.focus_node.focus({ preventScroll: true });
        });
    });
}
exports.default = default_1;
;
