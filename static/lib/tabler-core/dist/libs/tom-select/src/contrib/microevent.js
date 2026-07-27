"use strict";
/**
 * MicroEvent - to make any js object an event emitter
 *
 * - pure javascript - server compatible, browser compatible
 * - dont rely on the browser doms
 * - super simple - you get it immediatly, no mistery, no magic involved
 *
 * @author Jerome Etienne (https://github.com/jeromeetienne)
 */
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Execute callback for each event in space separated list of event names
 *
 */
function forEvents(events, callback) {
    events.split(/\s+/).forEach(function (event) {
        callback(event);
    });
}
var MicroEvent = /** @class */ (function () {
    function MicroEvent() {
        this._events = {};
    }
    MicroEvent.prototype.on = function (events, fct) {
        var _this = this;
        forEvents(events, function (event) {
            var event_array = _this._events[event] || [];
            event_array.push(fct);
            _this._events[event] = event_array;
        });
    };
    MicroEvent.prototype.off = function (events, fct) {
        var _this = this;
        var n = arguments.length;
        if (n === 0) {
            this._events = {};
            return;
        }
        forEvents(events, function (event) {
            if (n === 1) {
                delete _this._events[event];
                return;
            }
            var event_array = _this._events[event];
            if (event_array === undefined)
                return;
            event_array.splice(event_array.indexOf(fct), 1);
            _this._events[event] = event_array;
        });
    };
    MicroEvent.prototype.trigger = function (events) {
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        var self = this;
        forEvents(events, function (event) {
            var event_array = self._events[event];
            if (event_array === undefined)
                return;
            event_array.forEach(function (fct) {
                fct.apply(self, args);
            });
        });
    };
    return MicroEvent;
}());
exports.default = MicroEvent;
;
