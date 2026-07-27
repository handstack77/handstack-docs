"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function default_1(userOptions) {
    var self = this;
    var options = Object.assign({
        text: function (option) {
            return option[self.settings.labelField];
        }
    }, userOptions);
    self.on('item_remove', function (value) {
        if (!self.isFocused) {
            return;
        }
        if (self.control_input.value.trim() === '') {
            var option = self.options[value];
            if (option) {
                self.setTextboxValue(options.text.call(self, option));
            }
        }
    });
}
exports.default = default_1;
;
