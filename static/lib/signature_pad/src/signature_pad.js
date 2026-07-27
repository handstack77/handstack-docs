"use strict";
/**
 * The main idea and some parts of the code (e.g. drawing variable width Bézier curve) are taken from:
 * http://corner.squareup.com/2012/07/smoother-signatures.html
 *
 * Implementation of interpolation using cubic Bézier curves is taken from:
 * https://web.archive.org/web/20160323213433/http://www.benknowscode.com/2012/09/path-interpolation-using-cubic-bezier_9742.html
 *
 * Algorithm for approximated length of a Bézier curve is taken from:
 * http://www.lemoda.net/maths/bezier-length/index.html
 */
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
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
var bezier_1 = require("./bezier");
var point_1 = require("./point");
var signature_event_target_1 = require("./signature_event_target");
var throttle_1 = require("./throttle");
var SignaturePad = /** @class */ (function (_super) {
    __extends(SignaturePad, _super);
    /* tslint:enable: variable-name */
    function SignaturePad(canvas, options) {
        if (options === void 0) { options = {}; }
        var _a, _b, _c;
        var _this = _super.call(this) || this;
        _this.canvas = canvas;
        _this._drawingStroke = false;
        _this._isEmpty = true;
        _this._lastPoints = []; // Stores up to 4 most recent points; used to generate a new curve
        _this._data = []; // Stores all points in groups (one group per line or dot)
        _this._lastVelocity = 0;
        _this._lastWidth = 0;
        // Event handlers
        _this._handleMouseDown = function (event) {
            if (!_this._isLeftButtonPressed(event, true) || _this._drawingStroke) {
                return;
            }
            _this._strokeBegin(_this._pointerEventToSignatureEvent(event));
        };
        _this._handleMouseMove = function (event) {
            if (!_this._isLeftButtonPressed(event, true) || !_this._drawingStroke) {
                // Stop when not pressing primary button or pressing multiple buttons
                _this._strokeEnd(_this._pointerEventToSignatureEvent(event), false);
                return;
            }
            _this._strokeMoveUpdate(_this._pointerEventToSignatureEvent(event));
        };
        _this._handleMouseUp = function (event) {
            if (_this._isLeftButtonPressed(event)) {
                return;
            }
            _this._strokeEnd(_this._pointerEventToSignatureEvent(event));
        };
        _this._handleTouchStart = function (event) {
            if (event.targetTouches.length !== 1 || _this._drawingStroke) {
                return;
            }
            // Prevent scrolling.
            if (event.cancelable) {
                event.preventDefault();
            }
            _this._strokeBegin(_this._touchEventToSignatureEvent(event));
        };
        _this._handleTouchMove = function (event) {
            if (event.targetTouches.length !== 1) {
                return;
            }
            // Prevent scrolling.
            if (event.cancelable) {
                event.preventDefault();
            }
            if (!_this._drawingStroke) {
                _this._strokeEnd(_this._touchEventToSignatureEvent(event), false);
                return;
            }
            _this._strokeMoveUpdate(_this._touchEventToSignatureEvent(event));
        };
        _this._handleTouchEnd = function (event) {
            if (event.targetTouches.length !== 0) {
                return;
            }
            if (event.cancelable) {
                event.preventDefault();
            }
            _this.canvas.removeEventListener('touchmove', _this._handleTouchMove);
            _this._strokeEnd(_this._touchEventToSignatureEvent(event));
        };
        _this._handlePointerDown = function (event) {
            if (!event.isPrimary || !_this._isLeftButtonPressed(event) || _this._drawingStroke) {
                return;
            }
            event.preventDefault();
            _this._strokeBegin(_this._pointerEventToSignatureEvent(event));
        };
        _this._handlePointerMove = function (event) {
            if (!event.isPrimary) {
                return;
            }
            if (!_this._isLeftButtonPressed(event, true) || !_this._drawingStroke) {
                // Stop when primary button not pressed or multiple buttons pressed
                _this._strokeEnd(_this._pointerEventToSignatureEvent(event), false);
                return;
            }
            event.preventDefault();
            _this._strokeMoveUpdate(_this._pointerEventToSignatureEvent(event));
        };
        _this._handlePointerUp = function (event) {
            if (!event.isPrimary || _this._isLeftButtonPressed(event)) {
                return;
            }
            event.preventDefault();
            _this._strokeEnd(_this._pointerEventToSignatureEvent(event));
        };
        _this.velocityFilterWeight = options.velocityFilterWeight || 0.7;
        _this.minWidth = options.minWidth || 0.5;
        _this.maxWidth = options.maxWidth || 2.5;
        // We need to handle 0 value, so use `??` instead of `||`
        _this.throttle = (_a = options.throttle) !== null && _a !== void 0 ? _a : 16; // in milliseconds
        _this.minDistance = (_b = options.minDistance) !== null && _b !== void 0 ? _b : 5; // in pixels
        _this.dotSize = options.dotSize || 0;
        _this.penColor = options.penColor || 'black';
        _this.backgroundColor = options.backgroundColor || 'rgba(0,0,0,0)';
        _this.compositeOperation = options.compositeOperation || 'source-over';
        _this.canvasContextOptions = (_c = options.canvasContextOptions) !== null && _c !== void 0 ? _c : {};
        _this._strokeMoveUpdate = _this.throttle
            ? (0, throttle_1.throttle)(SignaturePad.prototype._strokeUpdate, _this.throttle)
            : SignaturePad.prototype._strokeUpdate;
        _this._ctx = canvas.getContext('2d', _this.canvasContextOptions);
        _this.clear();
        // Enable mouse and touch event handlers
        _this.on();
        return _this;
    }
    SignaturePad.prototype.clear = function () {
        var _a = this, ctx = _a._ctx, canvas = _a.canvas;
        // Clear canvas using background color
        ctx.fillStyle = this.backgroundColor;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        this._data = [];
        this._reset(this._getPointGroupOptions());
        this._isEmpty = true;
    };
    SignaturePad.prototype.fromDataURL = function (dataUrl, options) {
        var _this = this;
        if (options === void 0) { options = {}; }
        return new Promise(function (resolve, reject) {
            var image = new Image();
            var ratio = options.ratio || window.devicePixelRatio || 1;
            var width = options.width || _this.canvas.width / ratio;
            var height = options.height || _this.canvas.height / ratio;
            var xOffset = options.xOffset || 0;
            var yOffset = options.yOffset || 0;
            _this._reset(_this._getPointGroupOptions());
            image.onload = function () {
                _this._ctx.drawImage(image, xOffset, yOffset, width, height);
                resolve();
            };
            image.onerror = function (error) {
                reject(error);
            };
            image.crossOrigin = 'anonymous';
            image.src = dataUrl;
            _this._isEmpty = false;
        });
    };
    SignaturePad.prototype.toDataURL = function (type, encoderOptions) {
        if (type === void 0) { type = 'image/png'; }
        switch (type) {
            case 'image/svg+xml':
                if (typeof encoderOptions !== 'object') {
                    encoderOptions = undefined;
                }
                return "data:image/svg+xml;base64,".concat(btoa(this.toSVG(encoderOptions)));
            default:
                if (typeof encoderOptions !== 'number') {
                    encoderOptions = undefined;
                }
                return this.canvas.toDataURL(type, encoderOptions);
        }
    };
    SignaturePad.prototype.on = function () {
        // Disable panning/zooming when touching canvas element
        this.canvas.style.touchAction = 'none';
        this.canvas.style.msTouchAction = 'none';
        this.canvas.style.userSelect = 'none';
        var isIOS = /Macintosh/.test(navigator.userAgent) && 'ontouchstart' in document;
        // The "Scribble" feature of iOS intercepts point events. So that we can
        // lose some of them when tapping rapidly. Use touch events for iOS
        // platforms to prevent it. See
        // https://developer.apple.com/forums/thread/664108 for more information.
        if (window.PointerEvent && !isIOS) {
            this._handlePointerEvents();
        }
        else {
            this._handleMouseEvents();
            if ('ontouchstart' in window) {
                this._handleTouchEvents();
            }
        }
    };
    SignaturePad.prototype.off = function () {
        // Enable panning/zooming when touching canvas element
        this.canvas.style.touchAction = 'auto';
        this.canvas.style.msTouchAction = 'auto';
        this.canvas.style.userSelect = 'auto';
        this.canvas.removeEventListener('pointerdown', this._handlePointerDown);
        this.canvas.removeEventListener('mousedown', this._handleMouseDown);
        this.canvas.removeEventListener('touchstart', this._handleTouchStart);
        this._removeMoveUpEventListeners();
    };
    SignaturePad.prototype._getListenerFunctions = function () {
        var _a;
        var canvasWindow = window.document === this.canvas.ownerDocument
            ? window
            : (_a = this.canvas.ownerDocument.defaultView) !== null && _a !== void 0 ? _a : this.canvas.ownerDocument;
        return {
            addEventListener: canvasWindow.addEventListener.bind(canvasWindow),
            removeEventListener: canvasWindow.removeEventListener.bind(canvasWindow),
        };
    };
    SignaturePad.prototype._removeMoveUpEventListeners = function () {
        var removeEventListener = this._getListenerFunctions().removeEventListener;
        removeEventListener('pointermove', this._handlePointerMove);
        removeEventListener('pointerup', this._handlePointerUp);
        removeEventListener('mousemove', this._handleMouseMove);
        removeEventListener('mouseup', this._handleMouseUp);
        removeEventListener('touchmove', this._handleTouchMove);
        removeEventListener('touchend', this._handleTouchEnd);
    };
    SignaturePad.prototype.isEmpty = function () {
        return this._isEmpty;
    };
    SignaturePad.prototype.fromData = function (pointGroups, _a) {
        var _b = _a === void 0 ? {} : _a, _c = _b.clear, clear = _c === void 0 ? true : _c;
        if (clear) {
            this.clear();
        }
        this._fromData(pointGroups, this._drawCurve.bind(this), this._drawDot.bind(this));
        this._data = this._data.concat(pointGroups);
    };
    SignaturePad.prototype.toData = function () {
        return this._data;
    };
    SignaturePad.prototype._isLeftButtonPressed = function (event, only) {
        if (only) {
            return event.buttons === 1;
        }
        return (event.buttons & 1) === 1;
    };
    SignaturePad.prototype._pointerEventToSignatureEvent = function (event) {
        return {
            event: event,
            type: event.type,
            x: event.clientX,
            y: event.clientY,
            pressure: 'pressure' in event ? event.pressure : 0,
        };
    };
    SignaturePad.prototype._touchEventToSignatureEvent = function (event) {
        var touch = event.changedTouches[0];
        return {
            event: event,
            type: event.type,
            x: touch.clientX,
            y: touch.clientY,
            pressure: touch.force,
        };
    };
    SignaturePad.prototype._getPointGroupOptions = function (group) {
        return {
            penColor: group && 'penColor' in group ? group.penColor : this.penColor,
            dotSize: group && 'dotSize' in group ? group.dotSize : this.dotSize,
            minWidth: group && 'minWidth' in group ? group.minWidth : this.minWidth,
            maxWidth: group && 'maxWidth' in group ? group.maxWidth : this.maxWidth,
            velocityFilterWeight: group && 'velocityFilterWeight' in group
                ? group.velocityFilterWeight
                : this.velocityFilterWeight,
            compositeOperation: group && 'compositeOperation' in group
                ? group.compositeOperation
                : this.compositeOperation,
        };
    };
    // Private methods
    SignaturePad.prototype._strokeBegin = function (event) {
        var cancelled = !this.dispatchEvent(new CustomEvent('beginStroke', { detail: event, cancelable: true }));
        if (cancelled) {
            return;
        }
        var addEventListener = this._getListenerFunctions().addEventListener;
        switch (event.event.type) {
            case 'mousedown':
                addEventListener('mousemove', this._handleMouseMove);
                addEventListener('mouseup', this._handleMouseUp);
                break;
            case 'touchstart':
                addEventListener('touchmove', this._handleTouchMove);
                addEventListener('touchend', this._handleTouchEnd);
                break;
            case 'pointerdown':
                addEventListener('pointermove', this._handlePointerMove);
                addEventListener('pointerup', this._handlePointerUp);
                break;
            default:
            // do nothing
        }
        this._drawingStroke = true;
        var pointGroupOptions = this._getPointGroupOptions();
        var newPointGroup = __assign(__assign({}, pointGroupOptions), { points: [] });
        this._data.push(newPointGroup);
        this._reset(pointGroupOptions);
        this._strokeUpdate(event);
    };
    SignaturePad.prototype._strokeUpdate = function (event) {
        if (!this._drawingStroke) {
            return;
        }
        if (this._data.length === 0) {
            // This can happen if clear() was called while a signature is still in progress,
            // or if there is a race condition between start/update events.
            this._strokeBegin(event);
            return;
        }
        this.dispatchEvent(new CustomEvent('beforeUpdateStroke', { detail: event }));
        var point = this._createPoint(event.x, event.y, event.pressure);
        var lastPointGroup = this._data[this._data.length - 1];
        var lastPoints = lastPointGroup.points;
        var lastPoint = lastPoints.length > 0 && lastPoints[lastPoints.length - 1];
        var isLastPointTooClose = lastPoint
            ? point.distanceTo(lastPoint) <= this.minDistance
            : false;
        var pointGroupOptions = this._getPointGroupOptions(lastPointGroup);
        // Skip this point if it's too close to the previous one
        if (!lastPoint || !(lastPoint && isLastPointTooClose)) {
            var curve = this._addPoint(point, pointGroupOptions);
            if (!lastPoint) {
                this._drawDot(point, pointGroupOptions);
            }
            else if (curve) {
                this._drawCurve(curve, pointGroupOptions);
            }
            lastPoints.push({
                time: point.time,
                x: point.x,
                y: point.y,
                pressure: point.pressure,
            });
        }
        this.dispatchEvent(new CustomEvent('afterUpdateStroke', { detail: event }));
    };
    SignaturePad.prototype._strokeEnd = function (event, shouldUpdate) {
        if (shouldUpdate === void 0) { shouldUpdate = true; }
        this._removeMoveUpEventListeners();
        if (!this._drawingStroke) {
            return;
        }
        if (shouldUpdate) {
            this._strokeUpdate(event);
        }
        this._drawingStroke = false;
        this.dispatchEvent(new CustomEvent('endStroke', { detail: event }));
    };
    SignaturePad.prototype._handlePointerEvents = function () {
        this._drawingStroke = false;
        this.canvas.addEventListener('pointerdown', this._handlePointerDown);
    };
    SignaturePad.prototype._handleMouseEvents = function () {
        this._drawingStroke = false;
        this.canvas.addEventListener('mousedown', this._handleMouseDown);
    };
    SignaturePad.prototype._handleTouchEvents = function () {
        this.canvas.addEventListener('touchstart', this._handleTouchStart);
    };
    // Called when a new line is started
    SignaturePad.prototype._reset = function (options) {
        this._lastPoints = [];
        this._lastVelocity = 0;
        this._lastWidth = (options.minWidth + options.maxWidth) / 2;
        this._ctx.fillStyle = options.penColor;
        this._ctx.globalCompositeOperation = options.compositeOperation;
    };
    SignaturePad.prototype._createPoint = function (x, y, pressure) {
        var rect = this.canvas.getBoundingClientRect();
        return new point_1.Point(x - rect.left, y - rect.top, pressure, new Date().getTime());
    };
    // Add point to _lastPoints array and generate a new curve if there are enough points (i.e. 3)
    SignaturePad.prototype._addPoint = function (point, options) {
        var _lastPoints = this._lastPoints;
        _lastPoints.push(point);
        if (_lastPoints.length > 2) {
            // To reduce the initial lag make it work with 3 points
            // by copying the first point to the beginning.
            if (_lastPoints.length === 3) {
                _lastPoints.unshift(_lastPoints[0]);
            }
            // _points array will always have 4 points here.
            var widths = this._calculateCurveWidths(_lastPoints[1], _lastPoints[2], options);
            var curve = bezier_1.Bezier.fromPoints(_lastPoints, widths);
            // Remove the first element from the list, so that there are no more than 4 points at any time.
            _lastPoints.shift();
            return curve;
        }
        return null;
    };
    SignaturePad.prototype._calculateCurveWidths = function (startPoint, endPoint, options) {
        var velocity = options.velocityFilterWeight * endPoint.velocityFrom(startPoint) +
            (1 - options.velocityFilterWeight) * this._lastVelocity;
        var newWidth = this._strokeWidth(velocity, options);
        var widths = {
            end: newWidth,
            start: this._lastWidth,
        };
        this._lastVelocity = velocity;
        this._lastWidth = newWidth;
        return widths;
    };
    SignaturePad.prototype._strokeWidth = function (velocity, options) {
        return Math.max(options.maxWidth / (velocity + 1), options.minWidth);
    };
    SignaturePad.prototype._drawCurveSegment = function (x, y, width) {
        var ctx = this._ctx;
        ctx.moveTo(x, y);
        ctx.arc(x, y, width, 0, 2 * Math.PI, false);
        this._isEmpty = false;
    };
    SignaturePad.prototype._drawCurve = function (curve, options) {
        var ctx = this._ctx;
        var widthDelta = curve.endWidth - curve.startWidth;
        // '2' is just an arbitrary number here. If only length is used, then
        // there are gaps between curve segments :/
        var drawSteps = Math.ceil(curve.length()) * 2;
        ctx.beginPath();
        ctx.fillStyle = options.penColor;
        for (var i = 0; i < drawSteps; i += 1) {
            // Calculate the Bezier (x, y) coordinate for this step.
            var t = i / drawSteps;
            var tt = t * t;
            var ttt = tt * t;
            var u = 1 - t;
            var uu = u * u;
            var uuu = uu * u;
            var x = uuu * curve.startPoint.x;
            x += 3 * uu * t * curve.control1.x;
            x += 3 * u * tt * curve.control2.x;
            x += ttt * curve.endPoint.x;
            var y = uuu * curve.startPoint.y;
            y += 3 * uu * t * curve.control1.y;
            y += 3 * u * tt * curve.control2.y;
            y += ttt * curve.endPoint.y;
            var width = Math.min(curve.startWidth + ttt * widthDelta, options.maxWidth);
            this._drawCurveSegment(x, y, width);
        }
        ctx.closePath();
        ctx.fill();
    };
    SignaturePad.prototype._drawDot = function (point, options) {
        var ctx = this._ctx;
        var width = options.dotSize > 0
            ? options.dotSize
            : (options.minWidth + options.maxWidth) / 2;
        ctx.beginPath();
        this._drawCurveSegment(point.x, point.y, width);
        ctx.closePath();
        ctx.fillStyle = options.penColor;
        ctx.fill();
    };
    SignaturePad.prototype._fromData = function (pointGroups, drawCurve, drawDot) {
        for (var _i = 0, pointGroups_1 = pointGroups; _i < pointGroups_1.length; _i++) {
            var group = pointGroups_1[_i];
            var points = group.points;
            var pointGroupOptions = this._getPointGroupOptions(group);
            if (points.length > 1) {
                for (var j = 0; j < points.length; j += 1) {
                    var basicPoint = points[j];
                    var point = new point_1.Point(basicPoint.x, basicPoint.y, basicPoint.pressure, basicPoint.time);
                    if (j === 0) {
                        this._reset(pointGroupOptions);
                    }
                    var curve = this._addPoint(point, pointGroupOptions);
                    if (curve) {
                        drawCurve(curve, pointGroupOptions);
                    }
                }
            }
            else {
                this._reset(pointGroupOptions);
                drawDot(points[0], pointGroupOptions);
            }
        }
    };
    SignaturePad.prototype.toSVG = function (_a) {
        var _b = _a === void 0 ? {} : _a, _c = _b.includeBackgroundColor, includeBackgroundColor = _c === void 0 ? false : _c;
        var pointGroups = this._data;
        var ratio = Math.max(window.devicePixelRatio || 1, 1);
        var minX = 0;
        var minY = 0;
        var maxX = this.canvas.width / ratio;
        var maxY = this.canvas.height / ratio;
        var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
        svg.setAttribute('xmlns:xlink', 'http://www.w3.org/1999/xlink');
        svg.setAttribute('viewBox', "".concat(minX, " ").concat(minY, " ").concat(maxX, " ").concat(maxY));
        svg.setAttribute('width', maxX.toString());
        svg.setAttribute('height', maxY.toString());
        if (includeBackgroundColor && this.backgroundColor) {
            var rect = document.createElement('rect');
            rect.setAttribute('width', '100%');
            rect.setAttribute('height', '100%');
            rect.setAttribute('fill', this.backgroundColor);
            svg.appendChild(rect);
        }
        this._fromData(pointGroups, function (curve, _a) {
            var penColor = _a.penColor;
            var path = document.createElement('path');
            // Need to check curve for NaN values, these pop up when drawing
            // lines on the canvas that are not continuous. E.g. Sharp corners
            // or stopping mid-stroke and than continuing without lifting mouse.
            if (!isNaN(curve.control1.x) &&
                !isNaN(curve.control1.y) &&
                !isNaN(curve.control2.x) &&
                !isNaN(curve.control2.y)) {
                var attr = "M ".concat(curve.startPoint.x.toFixed(3), ",").concat(curve.startPoint.y.toFixed(3), " ") +
                    "C ".concat(curve.control1.x.toFixed(3), ",").concat(curve.control1.y.toFixed(3), " ") +
                    "".concat(curve.control2.x.toFixed(3), ",").concat(curve.control2.y.toFixed(3), " ") +
                    "".concat(curve.endPoint.x.toFixed(3), ",").concat(curve.endPoint.y.toFixed(3));
                path.setAttribute('d', attr);
                path.setAttribute('stroke-width', (curve.endWidth * 2.25).toFixed(3));
                path.setAttribute('stroke', penColor);
                path.setAttribute('fill', 'none');
                path.setAttribute('stroke-linecap', 'round');
                svg.appendChild(path);
            }
        }, function (point, _a) {
            var penColor = _a.penColor, dotSize = _a.dotSize, minWidth = _a.minWidth, maxWidth = _a.maxWidth;
            var circle = document.createElement('circle');
            var size = dotSize > 0 ? dotSize : (minWidth + maxWidth) / 2;
            circle.setAttribute('r', size.toString());
            circle.setAttribute('cx', point.x.toString());
            circle.setAttribute('cy', point.y.toString());
            circle.setAttribute('fill', penColor);
            svg.appendChild(circle);
        });
        return svg.outerHTML;
    };
    return SignaturePad;
}(signature_event_target_1.SignatureEventTarget));
exports.default = SignaturePad;
