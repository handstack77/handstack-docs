"use strict";
/**
 * Plugin: "checkbox_options" (Tom Select)
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
function default_1(userOptions) {
    var self = this;
    var orig_onOptionSelect = self.onOptionSelect;
    self.settings.hideSelected = false;
    var cbOptions = Object.assign({
        // so that the user may add different ones as well
        className: "tomselect-checkbox",
        // the following default to the historic plugin's values
        checkedClassNames: undefined,
        uncheckedClassNames: undefined,
    }, userOptions);
    var UpdateChecked = function (checkbox, toCheck) {
        var _a, _b, _c, _d;
        if (toCheck) {
            checkbox.checked = true;
            if (cbOptions.uncheckedClassNames) {
                (_a = checkbox.classList).remove.apply(_a, cbOptions.uncheckedClassNames);
            }
            if (cbOptions.checkedClassNames) {
                (_b = checkbox.classList).add.apply(_b, cbOptions.checkedClassNames);
            }
        }
        else {
            checkbox.checked = false;
            if (cbOptions.checkedClassNames) {
                (_c = checkbox.classList).remove.apply(_c, cbOptions.checkedClassNames);
            }
            if (cbOptions.uncheckedClassNames) {
                (_d = checkbox.classList).add.apply(_d, cbOptions.uncheckedClassNames);
            }
        }
    };
    // update the checkbox for an option
    var UpdateCheckbox = function (option) {
        setTimeout(function () {
            var checkbox = option.querySelector('input.' + cbOptions.className);
            if (checkbox instanceof HTMLInputElement) {
                UpdateChecked(checkbox, option.classList.contains('selected'));
            }
        }, 1);
    };
    // add checkbox to option template
    self.hook('after', 'setupTemplates', function () {
        var orig_render_option = self.settings.render.option;
        self.settings.render.option = (function (data, escape_html) {
            var rendered = (0, vanilla_ts_1.getDom)(orig_render_option.call(self, data, escape_html));
            var checkbox = document.createElement('input');
            if (cbOptions.className) {
                checkbox.classList.add(cbOptions.className);
            }
            checkbox.addEventListener('click', function (evt) {
                (0, utils_ts_1.preventDefault)(evt);
            });
            checkbox.type = 'checkbox';
            var hashed = (0, utils_ts_1.hash_key)(data[self.settings.valueField]);
            UpdateChecked(checkbox, !!(hashed && self.items.indexOf(hashed) > -1));
            rendered.prepend(checkbox);
            return rendered;
        });
    });
    // uncheck when item removed
    self.on('item_remove', function (value) {
        var option = self.getOption(value);
        if (option) { // if dropdown hasn't been opened yet, the option won't exist
            option.classList.remove('selected'); // selected class won't be removed yet
            UpdateCheckbox(option);
        }
    });
    // check when item added
    self.on('item_add', function (value) {
        var option = self.getOption(value);
        if (option) { // if dropdown hasn't been opened yet, the option won't exist
            UpdateCheckbox(option);
        }
    });
    // remove items when selected option is clicked
    self.hook('instead', 'onOptionSelect', function (evt, option) {
        if (option.classList.contains('selected')) {
            option.classList.remove('selected');
            self.removeItem(option.dataset.value);
            self.refreshOptions();
            (0, utils_ts_1.preventDefault)(evt, true);
            return;
        }
        orig_onOptionSelect.call(self, evt, option);
        UpdateCheckbox(option);
    });
}
exports.default = default_1;
;
