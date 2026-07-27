"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SignatureEventTarget = void 0;
var SignatureEventTarget = /** @class */ (function () {
    /* tslint:enable: variable-name */
    function SignatureEventTarget() {
        try {
            this._et = new EventTarget();
        }
        catch (_a) {
            // Using document as EventTarget to support iOS 13 and older.
            // Because EventTarget constructor just exists at iOS 14 and later.
            this._et = document;
        }
    }
    SignatureEventTarget.prototype.addEventListener = function (type, listener, options) {
        this._et.addEventListener(type, listener, options);
    };
    SignatureEventTarget.prototype.dispatchEvent = function (event) {
        return this._et.dispatchEvent(event);
    };
    SignatureEventTarget.prototype.removeEventListener = function (type, callback, options) {
        this._et.removeEventListener(type, callback, options);
    };
    return SignatureEventTarget;
}());
exports.SignatureEventTarget = SignatureEventTarget;
