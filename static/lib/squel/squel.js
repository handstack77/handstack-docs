;(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([], factory);
  } else if (typeof exports === 'object') {
    module.exports = factory();
  } else {
    root.squel = factory();
  }
}(this, function() {
'use strict';

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

// append to string if non-empty
function _pad(str, pad) {
  return str.length ? str + pad : str;
}

// Extend given object's with other objects' properties, overriding existing ones if necessary
function _extend(dst) {
  for (var _len = arguments.length, sources = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
    sources[_key - 1] = arguments[_key];
  }

  if (dst && sources) {
    var _loop = function _loop(src) {
      if ((typeof src === 'undefined' ? 'undefined' : _typeof(src)) === 'object') {
        Object.getOwnPropertyNames(src).forEach(function (key) {
          dst[key] = src[key];
        });
      }
    };

    var _iteratorNormalCompletion = true;
    var _didIteratorError = false;
    var _iteratorError = undefined;

    try {
      for (var _iterator = sources[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
        var src = _step.value;

        _loop(src);
      }
    } catch (err) {
      _didIteratorError = true;
      _iteratorError = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion && _iterator.return) {
          _iterator.return();
        }
      } finally {
        if (_didIteratorError) {
          throw _iteratorError;
        }
      }
    }
  }

  return dst;
};

// get whether object is a plain object
function _isPlainObject(obj) {
  return obj && obj.constructor.prototype === Object.prototype;
};

// get whether object is an array
function _isArray(obj) {
  return obj && obj.constructor.prototype === Array.prototype;
};

// clone given item
function _clone(src) {
  if (!src) {
    return src;
  }

  if (typeof src.clone === 'function') {
    return src.clone();
  } else if (_isPlainObject(src) || _isArray(src)) {
    var ret = new src.constructor();

    Object.getOwnPropertyNames(src).forEach(function (key) {
      if (typeof src[key] !== 'function') {
        ret[key] = _clone(src[key]);
      }
    });

    return ret;
  } else {
    return JSON.parse(JSON.stringify(src));
  }
};

/**
 * Register a value type handler
 *
 * Note: this will override any existing handler registered for this value type.
 */
function _registerValueHandler(handlers, type, handler) {
  var typeofType = typeof type === 'undefined' ? 'undefined' : _typeof(type);

  if (typeofType !== 'function' && typeofType !== 'string') {
    throw new Error("type must be a class constructor or string");
  }

  if (typeof handler !== 'function') {
    throw new Error("handler must be a function");
  }

  var _iteratorNormalCompletion2 = true;
  var _didIteratorError2 = false;
  var _iteratorError2 = undefined;

  try {
    for (var _iterator2 = handlers[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
      var typeHandler = _step2.value;

      if (typeHandler.type === type) {
        typeHandler.handler = handler;

        return;
      }
    }
  } catch (err) {
    _didIteratorError2 = true;
    _iteratorError2 = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion2 && _iterator2.return) {
        _iterator2.return();
      }
    } finally {
      if (_didIteratorError2) {
        throw _iteratorError2;
      }
    }
  }

  handlers.push({
    type: type,
    handler: handler
  });
};

/**
 * Get value type handler for given type
 */
function getValueHandler(value, localHandlers, globalHandlers) {
  return _getValueHandler(value, localHandlers) || _getValueHandler(value, globalHandlers);
};

function _getValueHandler(value, handlers) {
  for (var i = 0; i < handlers.length; i++) {
    var typeHandler = handlers[i];
    // if type is a string then use `typeof` or else use `instanceof`
    if ((typeof value === 'undefined' ? 'undefined' : _typeof(value)) === typeHandler.type || typeof typeHandler.type !== 'string' && value instanceof typeHandler.type) {
      return typeHandler.handler;
    }
  }
};

/**
 * Build base squel classes and methods
 */
function _buildSquel() {
  var flavour = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;

  var cls = {
    // Get whether obj is a query builder
    isSquelBuilder: function isSquelBuilder(obj) {
      return obj && !!obj._toParamString;
    }
  };

  // Get whether nesting should be applied for given item
  var _shouldApplyNesting = function _shouldApplyNesting(obj) {
    return !cls.isSquelBuilder(obj) || !obj.options.rawNesting;
  };

  // default query builder options
  cls.DefaultQueryBuilderOptions = {
    // If true then table names will be rendered inside quotes. The quote character used is configurable via the nameQuoteCharacter option.
    autoQuoteTableNames: false,
    // If true then field names will rendered inside quotes. The quote character used is configurable via the nameQuoteCharacter option.
    autoQuoteFieldNames: false,
    // If true then alias names will rendered inside quotes. The quote character used is configurable via the `tableAliasQuoteCharacter` and `fieldAliasQuoteCharacter` options.
    autoQuoteAliasNames: true,
    // If true then table alias names will rendered after AS keyword.
    useAsForTableAliasNames: false,
    // The quote character used for when quoting table and field names
    nameQuoteCharacter: '`',
    // The quote character used for when quoting table alias names
    tableAliasQuoteCharacter: '`',
    // The quote character used for when quoting table alias names
    fieldAliasQuoteCharacter: '"',
    // Custom value handlers where key is the value type and the value is the handler function
    valueHandlers: [],
    // Character used to represent a parameter value
    parameterCharacter: '?',
    // Numbered parameters returned from toParam() as $1, $2, etc.
    numberedParameters: false,
    // Numbered parameters prefix character(s)
    numberedParametersPrefix: '$',
    // Numbered parameters start at this number.
    numberedParametersStartAt: 1,
    // If true then replaces all single quotes within strings. The replacement string used is configurable via the `singleQuoteReplacement` option.
    replaceSingleQuotes: false,
    // The string to replace single quotes with in query strings
    singleQuoteReplacement: '\'\'',
    // String used to join individual blocks in a query when it's stringified
    separator: ' ',
    // Function for formatting string values prior to insertion into query string
    stringFormatter: null,
    // Whether to prevent the addition of brackets () when nesting this query builder's output
    rawNesting: false
  };

  // Global custom value handlers for all instances of builder
  cls.globalValueHandlers = [];

  /*
  # ---------------------------------------------------------------------------------------------------------
  # ---------------------------------------------------------------------------------------------------------
  # Custom value types
  # ---------------------------------------------------------------------------------------------------------
  # ---------------------------------------------------------------------------------------------------------
   */

  // Register a new value handler
  cls.registerValueHandler = function (type, handler) {
    _registerValueHandler(cls.globalValueHandlers, type, handler);
  };

  /*
  # ---------------------------------------------------------------------------------------------------------
  # ---------------------------------------------------------------------------------------------------------
  # Base classes
  # ---------------------------------------------------------------------------------------------------------
  # ---------------------------------------------------------------------------------------------------------
  */

  // Base class for cloneable builders
  cls.Cloneable = function () {
    function _class() {
      _classCallCheck(this, _class);
    }

    _createClass(_class, [{
      key: 'clone',

      /**
       * Clone this builder
       */
      value: function clone() {
        var newInstance = new this.constructor();

        return _extend(newInstance, _clone(_extend({}, this)));
      }
    }]);

    return _class;
  }();

  // Base class for all builders
  cls.BaseBuilder = function (_cls$Cloneable) {
    _inherits(_class2, _cls$Cloneable);

    /**
     * Constructor.
     * this.param  {Object} options Overriding one or more of `cls.DefaultQueryBuilderOptions`.
     */
    function _class2(options) {
      _classCallCheck(this, _class2);

      var _this = _possibleConstructorReturn(this, (_class2.__proto__ || Object.getPrototypeOf(_class2)).call(this));

      var defaults = JSON.parse(JSON.stringify(cls.DefaultQueryBuilderOptions));
      // for function values, etc we need to manually copy
      ['stringFormatter'].forEach(function (p) {
        defaults[p] = cls.DefaultQueryBuilderOptions[p];
      });

      _this.options = _extend({}, defaults, options);
      return _this;
    }

    /**
     * Register a custom value handler for this builder instance.
     *
     * Note: this will override any globally registered handler for this value type.
     */


    _createClass(_class2, [{
      key: 'registerValueHandler',
      value: function registerValueHandler(type, handler) {
        _registerValueHandler(this.options.valueHandlers, type, handler);
        return this;
      }

      /**
       * Sanitize given expression.
       */

    }, {
      key: '_sanitizeExpression',
      value: function _sanitizeExpression(expr) {
        // If it's not a base builder instance
        if (!cls.isSquelBuilder(expr)) {
          // It must then be a string
          if (typeof expr !== "string") {
            throw new Error("expression must be a string or builder instance");
          }
        }

        return expr;
      }

      /**
       * Sanitize the given name.
       *
       * The 'type' parameter is used to construct a meaningful error message in case validation fails.
       */

    }, {
      key: '_sanitizeName',
      value: function _sanitizeName(value, type) {
        if (typeof value !== "string") {
          throw new Error(type + ' must be a string');
        }

        return value;
      }
    }, {
      key: '_sanitizeField',
      value: function _sanitizeField(item) {
        if (!cls.isSquelBuilder(item)) {
          item = this._sanitizeName(item, "field name");
        }

        return item;
      }
    }, {
      key: '_sanitizeBaseBuilder',
      value: function _sanitizeBaseBuilder(item) {
        if (cls.isSquelBuilder(item)) {
          return item;
        }

        throw new Error("must be a builder instance");
      }
    }, {
      key: '_sanitizeTable',
      value: function _sanitizeTable(item) {
        if (typeof item !== "string") {
          try {
            item = this._sanitizeBaseBuilder(item);
          } catch (e) {
            throw new Error("table name must be a string or a builder");
          }
        } else {
          item = this._sanitizeName(item, 'table');
        }

        return item;
      }
    }, {
      key: '_sanitizeTableAlias',
      value: function _sanitizeTableAlias(item) {
        return this._sanitizeName(item, "table alias");
      }
    }, {
      key: '_sanitizeFieldAlias',
      value: function _sanitizeFieldAlias(item) {
        return this._sanitizeName(item, "field alias");
      }

      // Sanitize the given limit/offset value.

    }, {
      key: '_sanitizeLimitOffset',
      value: function _sanitizeLimitOffset(value) {
        value = parseInt(value);

        if (0 > value || isNaN(value)) {
          throw new Error("limit/offset must be >= 0");
        }

        return value;
      }

      // Santize the given field value

    }, {
      key: '_sanitizeValue',
      value: function _sanitizeValue(item) {
        var itemType = typeof item === 'undefined' ? 'undefined' : _typeof(item);

        if (null === item) {
          // null is allowed
        } else if ("string" === itemType || "number" === itemType || "boolean" === itemType) {
          // primitives are allowed
        } else if (cls.isSquelBuilder(item)) {
          // Builders allowed
        } else {
          var typeIsValid = !!getValueHandler(item, this.options.valueHandlers, cls.globalValueHandlers);

          if (!typeIsValid) {
            throw new Error("field value must be a string, number, boolean, null or one of the registered custom value types");
          }
        }

        return item;
      }

      // Escape a string value, e.g. escape quotes and other characters within it.

    }, {
      key: '_escapeValue',
      value: function _escapeValue(value) {
        return this.options.replaceSingleQuotes && value ? value.replace(/\'/g, this.options.singleQuoteReplacement) : value;
      }
    }, {
      key: '_formatTableName',
      value: function _formatTableName(item) {
        if (this.options.autoQuoteTableNames) {
          var quoteChar = this.options.nameQuoteCharacter;

          item = '' + quoteChar + item + quoteChar;
        }

        return item;
      }
    }, {
      key: '_formatFieldAlias',
      value: function _formatFieldAlias(item) {
        if (this.options.autoQuoteAliasNames) {
          var quoteChar = this.options.fieldAliasQuoteCharacter;

          item = '' + quoteChar + item + quoteChar;
        }

        return item;
      }
    }, {
      key: '_formatTableAlias',
      value: function _formatTableAlias(item) {
        if (this.options.autoQuoteAliasNames) {
          var quoteChar = this.options.tableAliasQuoteCharacter;

          item = '' + quoteChar + item + quoteChar;
        }

        return this.options.useAsForTableAliasNames ? 'AS ' + item : item;
      }
    }, {
      key: '_formatFieldName',
      value: function _formatFieldName(item) {
        var formattingOptions = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

        if (this.options.autoQuoteFieldNames) {
          var quoteChar = this.options.nameQuoteCharacter;

          if (formattingOptions.ignorePeriodsForFieldNameQuotes) {
            // a.b.c -> `a.b.c`
            item = '' + quoteChar + item + quoteChar;
          } else {
            // a.b.c -> `a`.`b`.`c`
            item = item.split('.').map(function (v) {
              // treat '*' as special case (#79)
              return '*' === v ? v : '' + quoteChar + v + quoteChar;
            }).join('.');
          }
        }

        return item;
      }

      // Format the given custom value

    }, {
      key: '_formatCustomValue',
      value: function _formatCustomValue(value, asParam, formattingOptions) {
        // user defined custom handlers takes precedence
        var customHandler = getValueHandler(value, this.options.valueHandlers, cls.globalValueHandlers);

        // use the custom handler if available
        if (customHandler) {
          value = customHandler(value, asParam, formattingOptions);

          // custom value handler can instruct caller not to process returned value
          if (value && value.rawNesting) {
            return {
              formatted: true,
              rawNesting: true,
              value: value.value
            };
          }
        }

        return {
          formatted: !!customHandler,
          value: value

        };
      }

      /**
       * Format given value for inclusion into parameter values array.
       */

    }, {
      key: '_formatValueForParamArray',
      value: function _formatValueForParamArray(value) {
        var _this2 = this;

        var formattingOptions = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

        if (_isArray(value)) {
          return value.map(function (v) {
            return _this2._formatValueForParamArray(v, formattingOptions);
          });
        } else {
          return this._formatCustomValue(value, true, formattingOptions).value;
        }
      }

      /**
       * Format the given field value for inclusion into the query string
       */

    }, {
      key: '_formatValueForQueryString',
      value: function _formatValueForQueryString(initialValue) {
        var _this3 = this;

        var formattingOptions = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

        // maybe we have a cusotm value handler
        var _formatCustomValue2 = this._formatCustomValue(initialValue, false, formattingOptions),
            rawNesting = _formatCustomValue2.rawNesting,
            formatted = _formatCustomValue2.formatted,
            value = _formatCustomValue2.value;

        // if formatting took place then return it directly


        if (formatted) {
          if (rawNesting) {
            return value;
          } else {
            return this._applyNestingFormatting(value, _shouldApplyNesting(initialValue));
          }
        }

        // if it's an array then format each element separately
        if (_isArray(value)) {
          value = value.map(function (v) {
            return _this3._formatValueForQueryString(v);
          });

          value = this._applyNestingFormatting(value.join(', '), _shouldApplyNesting(value));
        } else {
          var typeofValue = typeof value === 'undefined' ? 'undefined' : _typeof(value);

          if (null === value) {
            value = "NULL";
          } else if (typeofValue === "boolean") {
            value = value ? "TRUE" : "FALSE";
          } else if (cls.isSquelBuilder(value)) {
            value = this._applyNestingFormatting(value.toString(), _shouldApplyNesting(value));
          } else if (typeofValue !== "number") {
            // if it's a string and we have custom string formatting turned on then use that
            if ('string' === typeofValue && this.options.stringFormatter) {
              return this.options.stringFormatter(value);
            }

            if (formattingOptions.dontQuote) {
              value = '' + value;
            } else {
              var escapedValue = this._escapeValue(value);

              value = '\'' + escapedValue + '\'';
            }
          }
        }

        return value;
      }
    }, {
      key: '_applyNestingFormatting',
      value: function _applyNestingFormatting(str) {
        var nesting = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;

        if (str && typeof str === 'string' && nesting && !this.options.rawNesting) {
          // apply brackets if they're not already existing
          var alreadyHasBrackets = '(' === str.charAt(0) && ')' === str.charAt(str.length - 1);

          if (alreadyHasBrackets) {
            // check that it's the form "((x)..(y))" rather than "(x)..(y)"
            var idx = 0,
                open = 1;

            while (str.length - 1 > ++idx) {
              var c = str.charAt(idx);

              if ('(' === c) {
                open++;
              } else if (')' === c) {
                open--;
                if (1 > open) {
                  alreadyHasBrackets = false;

                  break;
                }
              }
            }
          }

          if (!alreadyHasBrackets) {
            str = '(' + str + ')';
          }
        }

        return str;
      }

      /**
       * Build given string and its corresponding parameter values into
       * output.
       *
       * @param {String} str
       * @param {Array}  values
       * @param {Object} [options] Additional options.
       * @param {Boolean} [options.buildParameterized] Whether to build paramterized string. Default is false.
       * @param {Boolean} [options.nested] Whether this expression is nested within another.
       * @param {Boolean} [options.formattingOptions] Formatting options for values in query string.
       * @return {Object}
       */

    }, {
      key: '_buildString',
      value: function _buildString(str, values) {
        var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
        var nested = options.nested,
            buildParameterized = options.buildParameterized,
            formattingOptions = options.formattingOptions;


        values = values || [];
        str = str || '';

        var formattedStr = '',
            curValue = -1,
            formattedValues = [];

        var paramChar = this.options.parameterCharacter;

        var idx = 0;

        while (str.length > idx) {
          // param char?
          if (str.substr(idx, paramChar.length) === paramChar) {
            var value = values[++curValue];

            if (buildParameterized) {
              if (cls.isSquelBuilder(value)) {
                var ret = value._toParamString({
                  buildParameterized: buildParameterized,
                  nested: true
                });

                formattedStr += ret.text;
                ret.values.forEach(function (value) {
                  return formattedValues.push(value);
                });
              } else {
                value = this._formatValueForParamArray(value, formattingOptions);

                if (_isArray(value)) {
                  // Array(6) -> "(??, ??, ??, ??, ??, ??)"
                  var tmpStr = value.map(function () {
                    return paramChar;
                  }).join(', ');

                  formattedStr += '(' + tmpStr + ')';

                  value.forEach(function (val) {
                    return formattedValues.push(val);
                  });
                } else {
                  formattedStr += paramChar;

                  formattedValues.push(value);
                }
              }
            } else {
              formattedStr += this._formatValueForQueryString(value, formattingOptions);
            }

            idx += paramChar.length;
          } else {
            formattedStr += str.charAt(idx);

            idx++;
          }
        }

        return {
          text: this._applyNestingFormatting(formattedStr, !!nested),
          values: formattedValues
        };
      }

      /**
       * Build all given strings and their corresponding parameter values into
       * output.
       *
       * @param {Array} strings
       * @param {Array}  strValues array of value arrays corresponding to each string.
       * @param {Object} [options] Additional options.
       * @param {Boolean} [options.buildParameterized] Whether to build paramterized string. Default is false.
       * @param {Boolean} [options.nested] Whether this expression is nested within another.
       * @return {Object}
       */

    }, {
      key: '_buildManyStrings',
      value: function _buildManyStrings(strings, strValues) {
        var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

        var totalStr = [],
            totalValues = [];

        for (var idx = 0; strings.length > idx; ++idx) {
          var inputString = strings[idx],
              inputValues = strValues[idx];

          var _buildString2 = this._buildString(inputString, inputValues, {
            buildParameterized: options.buildParameterized,
            nested: false
          }),
              text = _buildString2.text,
              values = _buildString2.values;

          totalStr.push(text);
          values.forEach(function (value) {
            return totalValues.push(value);
          });
        }

        totalStr = totalStr.join(this.options.separator);

        return {
          text: totalStr.length ? this._applyNestingFormatting(totalStr, !!options.nested) : '',
          values: totalValues
        };
      }

      /**
       * Get parameterized representation of this instance.
       *
       * @param {Object} [options] Options.
       * @param {Boolean} [options.buildParameterized] Whether to build paramterized string. Default is false.
       * @param {Boolean} [options.nested] Whether this expression is nested within another.
       * @return {Object}
       */

    }, {
      key: '_toParamString',
      value: function _toParamString(options) {
        throw new Error('Not yet implemented');
      }

      /**
       * Get the expression string.
       * @return {String}
       */

    }, {
      key: 'toString',
      value: function toString() {
        var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

        return this._toParamString(options).text;
      }

      /**
       * Get the parameterized expression string.
       * @return {Object}
       */

    }, {
      key: 'toParam',
      value: function toParam() {
        var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

        return this._toParamString(_extend({}, options, {
          buildParameterized: true
        }));
      }
    }]);

    return _class2;
  }(cls.Cloneable);

  /*
  # ---------------------------------------------------------------------------------------------------------
  # ---------------------------------------------------------------------------------------------------------
  # cls.Expressions
  # ---------------------------------------------------------------------------------------------------------
  # ---------------------------------------------------------------------------------------------------------
  */

  /**
   * An SQL expression builder.
   *
   * SQL expressions are used in WHERE and ON clauses to filter data by various criteria.
   *
   * Expressions can be nested. Nested expression contains can themselves
   * contain nested expressions. When rendered a nested expression will be
   * fully contained within brackets.
   *
   * All the build methods in this object return the object instance for chained method calling purposes.
   */
  cls.Expression = function (_cls$BaseBuilder) {
    _inherits(_class3, _cls$BaseBuilder);

    // Initialise the expression.
    function _class3(options) {
      _classCallCheck(this, _class3);

      var _this4 = _possibleConstructorReturn(this, (_class3.__proto__ || Object.getPrototypeOf(_class3)).call(this, options));

      _this4._nodes = [];
      return _this4;
    }

    // Combine the current expression with the given expression using the intersection operator (AND).


    _createClass(_class3, [{
      key: 'and',
      value: function and(expr) {
        for (var _len2 = arguments.length, params = Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
          params[_key2 - 1] = arguments[_key2];
        }

        expr = this._sanitizeExpression(expr);

        this._nodes.push({
          type: 'AND',
          expr: expr,
          para: params
        });

        return this;
      }

      // Combine the current expression with the given expression using the union operator (OR).

    }, {
      key: 'or',
      value: function or(expr) {
        for (var _len3 = arguments.length, params = Array(_len3 > 1 ? _len3 - 1 : 0), _key3 = 1; _key3 < _len3; _key3++) {
          params[_key3 - 1] = arguments[_key3];
        }

        expr = this._sanitizeExpression(expr);

        this._nodes.push({
          type: 'OR',
          expr: expr,
          para: params
        });

        return this;
      }
    }, {
      key: '_toParamString',
      value: function _toParamString() {
        var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

        var totalStr = [],
            totalValues = [];

        var _iteratorNormalCompletion3 = true;
        var _didIteratorError3 = false;
        var _iteratorError3 = undefined;

        try {
          for (var _iterator3 = this._nodes[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
            var node = _step3.value;
            var type = node.type,
                expr = node.expr,
                para = node.para;

            var _ref = cls.isSquelBuilder(expr) ? expr._toParamString({
              buildParameterized: options.buildParameterized,
              nested: true
            }) : this._buildString(expr, para, {
              buildParameterized: options.buildParameterized
            }),
                text = _ref.text,
                values = _ref.values;

            if (totalStr.length) {
              totalStr.push(type);
            }

            totalStr.push(text);
            values.forEach(function (value) {
              return totalValues.push(value);
            });
          }
        } catch (err) {
          _didIteratorError3 = true;
          _iteratorError3 = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion3 && _iterator3.return) {
              _iterator3.return();
            }
          } finally {
            if (_didIteratorError3) {
              throw _iteratorError3;
            }
          }
        }

        totalStr = totalStr.join(' ');

        return {
          text: this._applyNestingFormatting(totalStr, !!options.nested),
          values: totalValues
        };
      }
    }]);

    return _class3;
  }(cls.BaseBuilder);

  /*
  # ---------------------------------------------------------------------------------------------------------
  # ---------------------------------------------------------------------------------------------------------
  # cls.Case
  # ---------------------------------------------------------------------------------------------------------
  # ---------------------------------------------------------------------------------------------------------
  */

  /**
   * An SQL CASE expression builder.
   *
   * SQL cases are used to select proper values based on specific criteria.
   */
  cls.Case = function (_cls$BaseBuilder2) {
    _inherits(_class4, _cls$BaseBuilder2);

    function _class4(fieldName) {
      var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

      _classCallCheck(this, _class4);

      var _this5 = _possibleConstructorReturn(this, (_class4.__proto__ || Object.getPrototypeOf(_class4)).call(this, options));

      if (_isPlainObject(fieldName)) {
        options = fieldName;

        fieldName = null;
      }

      if (fieldName) {
        _this5._fieldName = _this5._sanitizeField(fieldName);
      }

      _this5.options = _extend({}, cls.DefaultQueryBuilderOptions, options);

      _this5._cases = [];
      _this5._elseValue = null;
      return _this5;
    }

    _createClass(_class4, [{
      key: 'when',
      value: function when(expression) {
        for (var _len4 = arguments.length, values = Array(_len4 > 1 ? _len4 - 1 : 0), _key4 = 1; _key4 < _len4; _key4++) {
          values[_key4 - 1] = arguments[_key4];
        }

        this._cases.unshift({
          expression: expression,
          values: values || []
        });

        return this;
      }
    }, {
      key: 'then',
      value: function then(result) {
        if (this._cases.length == 0) {
          throw new Error("when() needs to be called first");
        }

        this._cases[0].result = result;

        return this;
      }
    }, {
      key: 'else',
      value: function _else(elseValue) {
        this._elseValue = elseValue;

        return this;
      }
    }, {
      key: '_toParamString',
      value: function _toParamString() {
        var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

        var totalStr = '',
            totalValues = [];

        var _iteratorNormalCompletion4 = true;
        var _didIteratorError4 = false;
        var _iteratorError4 = undefined;

        try {
          for (var _iterator4 = this._cases[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
            var _ref2 = _step4.value;
            var expression = _ref2.expression;
            var _values = _ref2.values;
            var result = _ref2.result;

            totalStr = _pad(totalStr, ' ');

            var ret = this._buildString(expression, _values, {
              buildParameterized: options.buildParameterized,
              nested: true
            });

            totalStr += 'WHEN ' + ret.text + ' THEN ' + this._formatValueForQueryString(result);
            ret.values.forEach(function (value) {
              return totalValues.push(value);
            });
          }
        } catch (err) {
          _didIteratorError4 = true;
          _iteratorError4 = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion4 && _iterator4.return) {
              _iterator4.return();
            }
          } finally {
            if (_didIteratorError4) {
              throw _iteratorError4;
            }
          }
        }

        if (totalStr.length) {
          totalStr += ' ELSE ' + this._formatValueForQueryString(this._elseValue) + ' END';

          if (this._fieldName) {
            totalStr = this._fieldName + ' ' + totalStr;
          }

          totalStr = 'CASE ' + totalStr;
        } else {
          totalStr = this._formatValueForQueryString(this._elseValue);
        }

        return {
          text: totalStr,
          values: totalValues
        };
      }
    }]);

    return _class4;
  }(cls.BaseBuilder);

  /*
  # ---------------------------------------------------------------------------------------------------------
  # ---------------------------------------------------------------------------------------------------------
  # Building blocks
  # ---------------------------------------------------------------------------------------------------------
  # ---------------------------------------------------------------------------------------------------------
  */

  /*
  # A building block represents a single build-step within a query building process.
  #
  # Query builders consist of one or more building blocks which get run in a particular order. Building blocks can
  # optionally specify methods to expose through the query builder interface. They can access all the input data for
  # the query builder and manipulate it as necessary, as well as append to the final query string output.
  #
  # If you wish to customize how queries get built or add proprietary query phrases and content then it is recommended
  # that you do so using one or more custom building blocks.
  #
  # Original idea posted in https://github.com/hiddentao/export/issues/10#issuecomment-15016427
  */
  cls.Block = function (_cls$BaseBuilder3) {
    _inherits(_class5, _cls$BaseBuilder3);

    function _class5(options) {
      _classCallCheck(this, _class5);

      return _possibleConstructorReturn(this, (_class5.__proto__ || Object.getPrototypeOf(_class5)).call(this, options));
    }

    /**
    # Get input methods to expose within the query builder.
    #
    # By default all methods except the following get returned:
    #   methods prefixed with _
    #   constructor and toString()
    #
    # @return Object key -> function pairs
    */


    _createClass(_class5, [{
      key: 'exposedMethods',
      value: function exposedMethods() {
        var ret = {};

        var obj = this;

        while (obj) {
          Object.getOwnPropertyNames(obj).forEach(function (prop) {
            if ('constructor' !== prop && typeof obj[prop] === "function" && prop.charAt(0) !== '_' && !cls.Block.prototype[prop]) {
              ret[prop] = obj[prop];
            }
          });

          obj = Object.getPrototypeOf(obj);
        };

        return ret;
      }
    }]);

    return _class5;
  }(cls.BaseBuilder);

  // A fixed string which always gets output
  cls.StringBlock = function (_cls$Block) {
    _inherits(_class6, _cls$Block);

    function _class6(options, str) {
      _classCallCheck(this, _class6);

      var _this7 = _possibleConstructorReturn(this, (_class6.__proto__ || Object.getPrototypeOf(_class6)).call(this, options));

      _this7._str = str;
      return _this7;
    }

    _createClass(_class6, [{
      key: '_toParamString',
      value: function _toParamString() {
        var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

        return {
          text: this._str,
          values: []
        };
      }
    }]);

    return _class6;
  }(cls.Block);

  // A function string block
  cls.FunctionBlock = function (_cls$Block2) {
    _inherits(_class7, _cls$Block2);

    function _class7(options) {
      _classCallCheck(this, _class7);

      var _this8 = _possibleConstructorReturn(this, (_class7.__proto__ || Object.getPrototypeOf(_class7)).call(this, options));

      _this8._strings = [];
      _this8._values = [];
      return _this8;
    }

    _createClass(_class7, [{
      key: 'function',
      value: function _function(str) {
        this._strings.push(str);

        for (var _len5 = arguments.length, values = Array(_len5 > 1 ? _len5 - 1 : 0), _key5 = 1; _key5 < _len5; _key5++) {
          values[_key5 - 1] = arguments[_key5];
        }

        this._values.push(values);
      }
    }, {
      key: '_toParamString',
      value: function _toParamString() {
        var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

        return this._buildManyStrings(this._strings, this._values, options);
      }
    }]);

    return _class7;
  }(cls.Block);

  // value handler for FunctionValueBlock objects
  cls.registerValueHandler(cls.FunctionBlock, function (value) {
    var asParam = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

    return asParam ? value.toParam() : value.toString();
  });

  /*
  # Table specifier base class
  */
  cls.AbstractTableBlock = function (_cls$Block3) {
    _inherits(_class8, _cls$Block3);

    /**
     * @param {Boolean} [options.singleTable] If true then only allow one table spec.
     * @param {String} [options.prefix] String prefix for output.
     */
    function _class8(options, prefix) {
      _classCallCheck(this, _class8);

      var _this9 = _possibleConstructorReturn(this, (_class8.__proto__ || Object.getPrototypeOf(_class8)).call(this, options));

      _this9._tables = [];
      return _this9;
    }

    /**
    # Update given table.
    #
    # An alias may also be specified for the table.
    #
    # Concrete subclasses should provide a method which calls this
    */


    _createClass(_class8, [{
      key: '_table',
      value: function _table(table) {
        var alias = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;

        alias = alias ? this._sanitizeTableAlias(alias) : alias;
        table = this._sanitizeTable(table);

        if (this.options.singleTable) {
          this._tables = [];
        }

        this._tables.push({
          table: table,
          alias: alias
        });
      }

      // get whether a table has been set

    }, {
      key: '_hasTable',
      value: function _hasTable() {
        return 0 < this._tables.length;
      }

      /**
       * @override
       */

    }, {
      key: '_toParamString',
      value: function _toParamString() {
        var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

        var totalStr = '',
            totalValues = [];

        if (this._hasTable()) {
          // retrieve the parameterised queries
          var _iteratorNormalCompletion5 = true;
          var _didIteratorError5 = false;
          var _iteratorError5 = undefined;

          try {
            for (var _iterator5 = this._tables[Symbol.iterator](), _step5; !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true) {
              var _ref3 = _step5.value;
              var table = _ref3.table;
              var alias = _ref3.alias;

              totalStr = _pad(totalStr, ', ');

              var tableStr = void 0;

              if (cls.isSquelBuilder(table)) {
                var _table$_toParamString = table._toParamString({
                  buildParameterized: options.buildParameterized,
                  nested: true
                }),
                    text = _table$_toParamString.text,
                    values = _table$_toParamString.values;

                tableStr = text;
                values.forEach(function (value) {
                  return totalValues.push(value);
                });
              } else {
                tableStr = this._formatTableName(table);
              }

              if (alias) {
                tableStr += ' ' + this._formatTableAlias(alias);
              }

              totalStr += tableStr;
            }
          } catch (err) {
            _didIteratorError5 = true;
            _iteratorError5 = err;
          } finally {
            try {
              if (!_iteratorNormalCompletion5 && _iterator5.return) {
                _iterator5.return();
              }
            } finally {
              if (_didIteratorError5) {
                throw _iteratorError5;
              }
            }
          }

          if (this.options.prefix) {
            totalStr = this.options.prefix + ' ' + totalStr;
          }
        }

        return {
          text: totalStr,
          values: totalValues
        };
      }
    }]);

    return _class8;
  }(cls.Block);

  // target table for DELETE queries, DELETE <??> FROM
  cls.TargetTableBlock = function (_cls$AbstractTableBlo) {
    _inherits(_class9, _cls$AbstractTableBlo);

    function _class9() {
      _classCallCheck(this, _class9);

      return _possibleConstructorReturn(this, (_class9.__proto__ || Object.getPrototypeOf(_class9)).apply(this, arguments));
    }

    _createClass(_class9, [{
      key: 'target',
      value: function target(table) {
        this._table(table);
      }
    }]);

    return _class9;
  }(cls.AbstractTableBlock);

  // Update Table
  cls.UpdateTableBlock = function (_cls$AbstractTableBlo2) {
    _inherits(_class10, _cls$AbstractTableBlo2);

    function _class10() {
      _classCallCheck(this, _class10);

      return _possibleConstructorReturn(this, (_class10.__proto__ || Object.getPrototypeOf(_class10)).apply(this, arguments));
    }

    _createClass(_class10, [{
      key: 'table',
      value: function table(_table2) {
        var alias = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;

        this._table(_table2, alias);
      }
    }, {
      key: '_toParamString',
      value: function _toParamString() {
        var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

        if (!this._hasTable()) {
          throw new Error("table() needs to be called");
        }

        return _get(_class10.prototype.__proto__ || Object.getPrototypeOf(_class10.prototype), '_toParamString', this).call(this, options);
      }
    }]);

    return _class10;
  }(cls.AbstractTableBlock);

  // FROM table
  cls.FromTableBlock = function (_cls$AbstractTableBlo3) {
    _inherits(_class11, _cls$AbstractTableBlo3);

    function _class11(options) {
      _classCallCheck(this, _class11);

      return _possibleConstructorReturn(this, (_class11.__proto__ || Object.getPrototypeOf(_class11)).call(this, _extend({}, options, {
        prefix: 'FROM'
      })));
    }

    _createClass(_class11, [{
      key: 'from',
      value: function from(table) {
        var alias = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;

        this._table(table, alias);
      }
    }]);

    return _class11;
  }(cls.AbstractTableBlock);

  // INTO table
  cls.IntoTableBlock = function (_cls$AbstractTableBlo4) {
    _inherits(_class12, _cls$AbstractTableBlo4);

    function _class12(options) {
      _classCallCheck(this, _class12);

      return _possibleConstructorReturn(this, (_class12.__proto__ || Object.getPrototypeOf(_class12)).call(this, _extend({}, options, {
        prefix: 'INTO',
        singleTable: true
      })));
    }

    _createClass(_class12, [{
      key: 'into',
      value: function into(table) {
        this._table(table);
      }
    }, {
      key: '_toParamString',
      value: function _toParamString() {
        var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

        if (!this._hasTable()) {
          throw new Error("into() needs to be called");
        }

        return _get(_class12.prototype.__proto__ || Object.getPrototypeOf(_class12.prototype), '_toParamString', this).call(this, options);
      }
    }]);

    return _class12;
  }(cls.AbstractTableBlock);

  // (SELECT) Get field
  cls.GetFieldBlock = function (_cls$Block4) {
    _inherits(_class13, _cls$Block4);

    function _class13(options) {
      _classCallCheck(this, _class13);

      var _this14 = _possibleConstructorReturn(this, (_class13.__proto__ || Object.getPrototypeOf(_class13)).call(this, options));

      _this14._fields = [];
      return _this14;
    }

    /**
    # Add the given fields to the final result set.
    #
    # The parameter is an Object containing field names (or database functions) as the keys and aliases for the fields
    # as the values. If the value for a key is null then no alias is set for that field.
    #
    # Internally this method simply calls the field() method of this block to add each individual field.
    #
    # options.ignorePeriodsForFieldNameQuotes - whether to ignore period (.) when automatically quoting the field name
    */


    _createClass(_class13, [{
      key: 'fields',
      value: function fields(_fields) {
        var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

        if (_isArray(_fields)) {
          var _iteratorNormalCompletion6 = true;
          var _didIteratorError6 = false;
          var _iteratorError6 = undefined;

          try {
            for (var _iterator6 = _fields[Symbol.iterator](), _step6; !(_iteratorNormalCompletion6 = (_step6 = _iterator6.next()).done); _iteratorNormalCompletion6 = true) {
              var field = _step6.value;

              this.field(field, null, options);
            }
          } catch (err) {
            _didIteratorError6 = true;
            _iteratorError6 = err;
          } finally {
            try {
              if (!_iteratorNormalCompletion6 && _iterator6.return) {
                _iterator6.return();
              }
            } finally {
              if (_didIteratorError6) {
                throw _iteratorError6;
              }
            }
          }
        } else {
          for (var _field2 in _fields) {
            var alias = _fields[_field2];

            this.field(_field2, alias, options);
          }
        }
      }

      /**
      # Add the given field to the final result set.
      #
      # The 'field' parameter does not necessarily have to be a fieldname. It can use database functions too,
      # e.g. DATE_FORMAT(a.started, "%H")
      #
      # An alias may also be specified for this field.
      #
      # options.ignorePeriodsForFieldNameQuotes - whether to ignore period (.) when automatically quoting the field name
      */

    }, {
      key: 'field',
      value: function field(_field) {
        var alias = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
        var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

        alias = alias ? this._sanitizeFieldAlias(alias) : alias;
        _field = this._sanitizeField(_field);

        // if field-alias combo already present then don't add
        var existingField = this._fields.filter(function (f) {
          return f.name === _field && f.alias === alias;
        });
        if (existingField.length) {
          return this;
        }

        this._fields.push({
          name: _field,
          alias: alias,
          options: options
        });
      }
    }, {
      key: '_toParamString',
      value: function _toParamString() {
        var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
        var queryBuilder = options.queryBuilder,
            buildParameterized = options.buildParameterized;


        var totalStr = '',
            totalValues = [];

        var _iteratorNormalCompletion7 = true;
        var _didIteratorError7 = false;
        var _iteratorError7 = undefined;

        try {
          for (var _iterator7 = this._fields[Symbol.iterator](), _step7; !(_iteratorNormalCompletion7 = (_step7 = _iterator7.next()).done); _iteratorNormalCompletion7 = true) {
            var field = _step7.value;

            totalStr = _pad(totalStr, ", ");

            var name = field.name,
                alias = field.alias,
                _options = field.options;


            if (typeof name === 'string') {
              totalStr += this._formatFieldName(name, _options);
            } else {
              var ret = name._toParamString({
                nested: true,
                buildParameterized: buildParameterized
              });

              totalStr += ret.text;
              ret.values.forEach(function (value) {
                return totalValues.push(value);
              });
            }

            if (alias) {
              totalStr += ' AS ' + this._formatFieldAlias(alias);
            }
          }
        } catch (err) {
          _didIteratorError7 = true;
          _iteratorError7 = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion7 && _iterator7.return) {
              _iterator7.return();
            }
          } finally {
            if (_didIteratorError7) {
              throw _iteratorError7;
            }
          }
        }

        if (!totalStr.length) {
          // if select query and a table is set then all fields wanted
          var fromTableBlock = queryBuilder && queryBuilder.getBlock(cls.FromTableBlock);
          if (fromTableBlock && fromTableBlock._hasTable()) {
            totalStr = "*";
          }
        }

        return {
          text: totalStr,
          values: totalValues
        };
      }
    }]);

    return _class13;
  }(cls.Block);

  // Base class for setting fields to values (used for INSERT and UPDATE queries)
  cls.AbstractSetFieldBlock = function (_cls$Block5) {
    _inherits(_class14, _cls$Block5);

    function _class14(options) {
      _classCallCheck(this, _class14);

      var _this15 = _possibleConstructorReturn(this, (_class14.__proto__ || Object.getPrototypeOf(_class14)).call(this, options));

      _this15._reset();
      return _this15;
    }

    _createClass(_class14, [{
      key: '_reset',
      value: function _reset() {
        this._fields = [];
        this._values = [[]];
        this._valueOptions = [[]];
      }

      // Update the given field with the given value.
      // This will override any previously set value for the given field.

    }, {
      key: '_set',
      value: function _set(field, value) {
        var valueOptions = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

        if (this._values.length > 1) {
          throw new Error("Cannot set multiple rows of fields this way.");
        }

        if (typeof value !== 'undefined') {
          value = this._sanitizeValue(value);
        }

        field = this._sanitizeField(field);

        // Explicity overwrite existing fields
        var index = this._fields.indexOf(field);

        // if field not defined before
        if (-1 === index) {
          this._fields.push(field);
          index = this._fields.length - 1;
        }

        this._values[0][index] = value;
        this._valueOptions[0][index] = valueOptions;
      }

      // Insert fields based on the key/value pairs in the given object

    }, {
      key: '_setFields',
      value: function _setFields(fields) {
        var valueOptions = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

        if ((typeof fields === 'undefined' ? 'undefined' : _typeof(fields)) !== 'object') {
          throw new Error("Expected an object but got " + (typeof fields === 'undefined' ? 'undefined' : _typeof(fields)));
        }

        for (var field in fields) {
          this._set(field, fields[field], valueOptions);
        }
      }

      // Insert multiple rows for the given fields. Accepts an array of objects.
      // This will override all previously set values for every field.

    }, {
      key: '_setFieldsRows',
      value: function _setFieldsRows(fieldsRows) {
        var valueOptions = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

        if (!_isArray(fieldsRows)) {
          throw new Error("Expected an array of objects but got " + (typeof fieldsRows === 'undefined' ? 'undefined' : _typeof(fieldsRows)));
        }

        // Reset the objects stored fields and values
        this._reset();

        // for each row
        for (var i = 0; fieldsRows.length > i; ++i) {
          var fieldRow = fieldsRows[i];

          // for each field
          for (var field in fieldRow) {
            var value = fieldRow[field];

            field = this._sanitizeField(field);
            value = this._sanitizeValue(value);

            var index = this._fields.indexOf(field);

            if (0 < i && -1 === index) {
              throw new Error('All fields in subsequent rows must match the fields in the first row');
            }

            // Add field only if it hasn't been added before
            if (-1 === index) {
              this._fields.push(field);
              index = this._fields.length - 1;
            }

            // The first value added needs to add the array
            if (!_isArray(this._values[i])) {
              this._values[i] = [];
              this._valueOptions[i] = [];
            }

            this._values[i][index] = value;
            this._valueOptions[i][index] = valueOptions;
          }
        }
      }
    }]);

    return _class14;
  }(cls.Block);

  // (UPDATE) SET field=value
  cls.SetFieldBlock = function (_cls$AbstractSetField) {
    _inherits(_class15, _cls$AbstractSetField);

    function _class15() {
      _classCallCheck(this, _class15);

      return _possibleConstructorReturn(this, (_class15.__proto__ || Object.getPrototypeOf(_class15)).apply(this, arguments));
    }

    _createClass(_class15, [{
      key: 'set',
      value: function set(field, value, options) {
        this._set(field, value, options);
      }
    }, {
      key: 'setFields',
      value: function setFields(fields, valueOptions) {
        this._setFields(fields, valueOptions);
      }
    }, {
      key: '_toParamString',
      value: function _toParamString() {
        var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
        var buildParameterized = options.buildParameterized;


        if (0 >= this._fields.length) {
          throw new Error("set() needs to be called");
        }

        var totalStr = '',
            totalValues = [];

        for (var i = 0; i < this._fields.length; ++i) {
          totalStr = _pad(totalStr, ', ');

          var field = this._formatFieldName(this._fields[i]);
          var value = this._values[0][i];

          // e.g. field can be an expression such as `count = count + 1`
          if (0 > field.indexOf('=')) {
            field = field + ' = ' + this.options.parameterCharacter;
          }

          var ret = this._buildString(field, [value], {
            buildParameterized: buildParameterized,
            formattingOptions: this._valueOptions[0][i]
          });

          totalStr += ret.text;
          ret.values.forEach(function (value) {
            return totalValues.push(value);
          });
        }

        return {
          text: 'SET ' + totalStr,
          values: totalValues
        };
      }
    }]);

    return _class15;
  }(cls.AbstractSetFieldBlock);

  // (INSERT INTO) ... field ... value
  cls.InsertFieldValueBlock = function (_cls$AbstractSetField2) {
    _inherits(_class16, _cls$AbstractSetField2);

    function _class16() {
      _classCallCheck(this, _class16);

      return _possibleConstructorReturn(this, (_class16.__proto__ || Object.getPrototypeOf(_class16)).apply(this, arguments));
    }

    _createClass(_class16, [{
      key: 'set',
      value: function set(field, value) {
        var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

        this._set(field, value, options);
      }
    }, {
      key: 'setFields',
      value: function setFields(fields, valueOptions) {
        this._setFields(fields, valueOptions);
      }
    }, {
      key: 'setFieldsRows',
      value: function setFieldsRows(fieldsRows, valueOptions) {
        this._setFieldsRows(fieldsRows, valueOptions);
      }
    }, {
      key: '_toParamString',
      value: function _toParamString() {
        var _this18 = this;

        var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
        var buildParameterized = options.buildParameterized;


        var fieldString = this._fields.map(function (f) {
          return _this18._formatFieldName(f);
        }).join(', ');

        var valueStrings = [],
            totalValues = [];

        for (var i = 0; i < this._values.length; ++i) {
          valueStrings[i] = '';

          for (var j = 0; j < this._values[i].length; ++j) {
            var ret = this._buildString(this.options.parameterCharacter, [this._values[i][j]], {
              buildParameterized: buildParameterized,
              formattingOptions: this._valueOptions[i][j]
            });

            ret.values.forEach(function (value) {
              return totalValues.push(value);
            });

            valueStrings[i] = _pad(valueStrings[i], ', ');
            valueStrings[i] += ret.text;
          }
        }

        return {
          text: fieldString.length ? '(' + fieldString + ') VALUES (' + valueStrings.join('), (') + ')' : '',
          values: totalValues
        };
      }
    }]);

    return _class16;
  }(cls.AbstractSetFieldBlock);

  // (INSERT INTO) ... field ... (SELECT ... FROM ...)
  cls.InsertFieldsFromQueryBlock = function (_cls$Block6) {
    _inherits(_class17, _cls$Block6);

    function _class17(options) {
      _classCallCheck(this, _class17);

      var _this19 = _possibleConstructorReturn(this, (_class17.__proto__ || Object.getPrototypeOf(_class17)).call(this, options));

      _this19._fields = [];
      _this19._query = null;
      return _this19;
    }

    _createClass(_class17, [{
      key: 'fromQuery',
      value: function fromQuery(fields, selectQuery) {
        var _this20 = this;

        this._fields = fields.map(function (v) {
          return _this20._sanitizeField(v);
        });

        this._query = this._sanitizeBaseBuilder(selectQuery);
      }
    }, {
      key: '_toParamString',
      value: function _toParamString() {
        var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

        var totalStr = '',
            totalValues = [];

        if (this._fields.length && this._query) {
          var _query$_toParamString = this._query._toParamString({
            buildParameterized: options.buildParameterized,
            nested: true
          }),
              text = _query$_toParamString.text,
              values = _query$_toParamString.values;

          totalStr = '(' + this._fields.join(', ') + ') ' + this._applyNestingFormatting(text);
          totalValues = values;
        }

        return {
          text: totalStr,
          values: totalValues
        };
      }
    }]);

    return _class17;
  }(cls.Block);

  // DISTINCT
  cls.DistinctBlock = function (_cls$Block7) {
    _inherits(_class18, _cls$Block7);

    function _class18() {
      _classCallCheck(this, _class18);

      return _possibleConstructorReturn(this, (_class18.__proto__ || Object.getPrototypeOf(_class18)).apply(this, arguments));
    }

    _createClass(_class18, [{
      key: 'distinct',

      // Add the DISTINCT keyword to the query.
      value: function distinct() {
        this._useDistinct = true;
      }
    }, {
      key: '_toParamString',
      value: function _toParamString() {
        return {
          text: this._useDistinct ? "DISTINCT" : "",
          values: []
        };
      }
    }]);

    return _class18;
  }(cls.Block);

  // GROUP BY
  cls.GroupByBlock = function (_cls$Block8) {
    _inherits(_class19, _cls$Block8);

    function _class19(options) {
      _classCallCheck(this, _class19);

      var _this22 = _possibleConstructorReturn(this, (_class19.__proto__ || Object.getPrototypeOf(_class19)).call(this, options));

      _this22._groups = [];
      return _this22;
    }

    // Add a GROUP BY transformation for the given field.


    _createClass(_class19, [{
      key: 'group',
      value: function group(field) {
        this._groups.push(this._sanitizeField(field));
      }
    }, {
      key: '_toParamString',
      value: function _toParamString() {
        var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

        return {
          text: this._groups.length ? 'GROUP BY ' + this._groups.join(', ') : '',
          values: []
        };
      }
    }]);

    return _class19;
  }(cls.Block);

  cls.AbstractVerbSingleValueBlock = function (_cls$Block9) {
    _inherits(_class20, _cls$Block9);

    /**
     * @param options.verb The prefix verb string.
     */
    function _class20(options) {
      _classCallCheck(this, _class20);

      var _this23 = _possibleConstructorReturn(this, (_class20.__proto__ || Object.getPrototypeOf(_class20)).call(this, options));

      _this23._value = null;
      return _this23;
    }

    _createClass(_class20, [{
      key: '_setValue',
      value: function _setValue(value) {
        this._value = null !== value ? this._sanitizeLimitOffset(value) : value;
      }
    }, {
      key: '_toParamString',
      value: function _toParamString() {
        var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

        var expr = null !== this._value ? this.options.verb + ' ' + this.options.parameterCharacter : '';

        var values = null !== this._value ? [this._value] : [];

        return this._buildString(expr, values, options);
      }
    }]);

    return _class20;
  }(cls.Block);

  // OFFSET x
  cls.OffsetBlock = function (_cls$AbstractVerbSing) {
    _inherits(_class21, _cls$AbstractVerbSing);

    function _class21(options) {
      _classCallCheck(this, _class21);

      return _possibleConstructorReturn(this, (_class21.__proto__ || Object.getPrototypeOf(_class21)).call(this, _extend({}, options, {
        verb: 'OFFSET'
      })));
    }

    /**
    # Set the OFFSET transformation.
    #
    # Call this will override the previously set offset for this query. Also note that Passing 0 for 'max' will remove
    # the offset.
    */


    _createClass(_class21, [{
      key: 'offset',
      value: function offset(start) {
        this._setValue(start);
      }
    }]);

    return _class21;
  }(cls.AbstractVerbSingleValueBlock);

  // LIMIT
  cls.LimitBlock = function (_cls$AbstractVerbSing2) {
    _inherits(_class22, _cls$AbstractVerbSing2);

    function _class22(options) {
      _classCallCheck(this, _class22);

      return _possibleConstructorReturn(this, (_class22.__proto__ || Object.getPrototypeOf(_class22)).call(this, _extend({}, options, {
        verb: 'LIMIT'
      })));
    }

    /**
    # Set the LIMIT transformation.
    #
    # Call this will override the previously set limit for this query. Also note that Passing `null` will remove
    # the limit.
    */


    _createClass(_class22, [{
      key: 'limit',
      value: function limit(_limit2) {
        this._setValue(_limit2);
      }
    }]);

    return _class22;
  }(cls.AbstractVerbSingleValueBlock);

  // Abstract condition base class
  cls.AbstractConditionBlock = function (_cls$Block10) {
    _inherits(_class23, _cls$Block10);

    /**
     * @param {String} options.verb The condition verb.
     */
    function _class23(options) {
      _classCallCheck(this, _class23);

      var _this26 = _possibleConstructorReturn(this, (_class23.__proto__ || Object.getPrototypeOf(_class23)).call(this, options));

      _this26._conditions = [];
      return _this26;
    }

    /**
    # Add a condition.
    #
    # When the final query is constructed all the conditions are combined using the intersection (AND) operator.
    #
    # Concrete subclasses should provide a method which calls this
    */


    _createClass(_class23, [{
      key: '_condition',
      value: function _condition(condition) {
        condition = this._sanitizeExpression(condition);

        for (var _len6 = arguments.length, values = Array(_len6 > 1 ? _len6 - 1 : 0), _key6 = 1; _key6 < _len6; _key6++) {
          values[_key6 - 1] = arguments[_key6];
        }

        this._conditions.push({
          expr: condition,
          values: values || []
        });
      }
    }, {
      key: '_toParamString',
      value: function _toParamString() {
        var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

        var totalStr = [],
            totalValues = [];

        var _iteratorNormalCompletion8 = true;
        var _didIteratorError8 = false;
        var _iteratorError8 = undefined;

        try {
          for (var _iterator8 = this._conditions[Symbol.iterator](), _step8; !(_iteratorNormalCompletion8 = (_step8 = _iterator8.next()).done); _iteratorNormalCompletion8 = true) {
            var _ref4 = _step8.value;
            var expr = _ref4.expr;
            var _values2 = _ref4.values;

            var ret = cls.isSquelBuilder(expr) ? expr._toParamString({
              buildParameterized: options.buildParameterized
            }) : this._buildString(expr, _values2, {
              buildParameterized: options.buildParameterized
            });

            if (ret.text.length) {
              totalStr.push(ret.text);
            }

            ret.values.forEach(function (value) {
              return totalValues.push(value);
            });
          }
        } catch (err) {
          _didIteratorError8 = true;
          _iteratorError8 = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion8 && _iterator8.return) {
              _iterator8.return();
            }
          } finally {
            if (_didIteratorError8) {
              throw _iteratorError8;
            }
          }
        }

        if (totalStr.length) {
          totalStr = totalStr.join(') AND (');
        }

        return {
          text: totalStr.length ? this.options.verb + ' (' + totalStr + ')' : '',
          values: totalValues
        };
      }
    }]);

    return _class23;
  }(cls.Block);

  // WHERE
  cls.WhereBlock = function (_cls$AbstractConditio) {
    _inherits(_class24, _cls$AbstractConditio);

    function _class24(options) {
      _classCallCheck(this, _class24);

      return _possibleConstructorReturn(this, (_class24.__proto__ || Object.getPrototypeOf(_class24)).call(this, _extend({}, options, {
        verb: 'WHERE'
      })));
    }

    _createClass(_class24, [{
      key: 'where',
      value: function where(condition) {
        for (var _len7 = arguments.length, values = Array(_len7 > 1 ? _len7 - 1 : 0), _key7 = 1; _key7 < _len7; _key7++) {
          values[_key7 - 1] = arguments[_key7];
        }

        this._condition.apply(this, [condition].concat(values));
      }
    }]);

    return _class24;
  }(cls.AbstractConditionBlock);

  // HAVING
  cls.HavingBlock = function (_cls$AbstractConditio2) {
    _inherits(_class25, _cls$AbstractConditio2);

    function _class25(options) {
      _classCallCheck(this, _class25);

      return _possibleConstructorReturn(this, (_class25.__proto__ || Object.getPrototypeOf(_class25)).call(this, _extend({}, options, {
        verb: 'HAVING'
      })));
    }

    _createClass(_class25, [{
      key: 'having',
      value: function having(condition) {
        for (var _len8 = arguments.length, values = Array(_len8 > 1 ? _len8 - 1 : 0), _key8 = 1; _key8 < _len8; _key8++) {
          values[_key8 - 1] = arguments[_key8];
        }

        this._condition.apply(this, [condition].concat(values));
      }
    }]);

    return _class25;
  }(cls.AbstractConditionBlock);

  // ORDER BY
  cls.OrderByBlock = function (_cls$Block11) {
    _inherits(_class26, _cls$Block11);

    function _class26(options) {
      _classCallCheck(this, _class26);

      var _this29 = _possibleConstructorReturn(this, (_class26.__proto__ || Object.getPrototypeOf(_class26)).call(this, options));

      _this29._orders = [];
      return _this29;
    }

    /**
    # Add an ORDER BY transformation for the given field in the given order.
    #
    # To specify descending order pass false for the 'dir' parameter.
    */


    _createClass(_class26, [{
      key: 'order',
      value: function order(field, dir) {
        field = this._sanitizeField(field);

        if (!(typeof dir === 'string')) {
          if (dir === undefined) {
            dir = 'ASC'; // Default to asc
          } else if (dir !== null) {
            dir = dir ? 'ASC' : 'DESC'; // Convert truthy to asc
          }
        }

        for (var _len9 = arguments.length, values = Array(_len9 > 2 ? _len9 - 2 : 0), _key9 = 2; _key9 < _len9; _key9++) {
          values[_key9 - 2] = arguments[_key9];
        }

        this._orders.push({
          field: field,
          dir: dir,
          values: values || []
        });
      }
    }, {
      key: '_toParamString',
      value: function _toParamString() {
        var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

        var totalStr = '',
            totalValues = [];

        var _iteratorNormalCompletion9 = true;
        var _didIteratorError9 = false;
        var _iteratorError9 = undefined;

        try {
          for (var _iterator9 = this._orders[Symbol.iterator](), _step9; !(_iteratorNormalCompletion9 = (_step9 = _iterator9.next()).done); _iteratorNormalCompletion9 = true) {
            var _ref5 = _step9.value;
            var field = _ref5.field;
            var dir = _ref5.dir;
            var _values3 = _ref5.values;

            totalStr = _pad(totalStr, ', ');

            var ret = this._buildString(field, _values3, {
              buildParameterized: options.buildParameterized
            });

            totalStr += ret.text, _isArray(ret.values) && ret.values.forEach(function (value) {
              return totalValues.push(value);
            });

            if (dir !== null) {
              totalStr += ' ' + dir;
            }
          }
        } catch (err) {
          _didIteratorError9 = true;
          _iteratorError9 = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion9 && _iterator9.return) {
              _iterator9.return();
            }
          } finally {
            if (_didIteratorError9) {
              throw _iteratorError9;
            }
          }
        }

        return {
          text: totalStr.length ? 'ORDER BY ' + totalStr : '',
          values: totalValues
        };
      }
    }]);

    return _class26;
  }(cls.Block);

  // JOIN
  cls.JoinBlock = function (_cls$Block12) {
    _inherits(_class27, _cls$Block12);

    function _class27(options) {
      _classCallCheck(this, _class27);

      var _this30 = _possibleConstructorReturn(this, (_class27.__proto__ || Object.getPrototypeOf(_class27)).call(this, options));

      _this30._joins = [];
      return _this30;
    }

    /**
    # Add a JOIN with the given table.
    #
    # 'table' is the name of the table to join with.
    #
    # 'alias' is an optional alias for the table name.
    #
    # 'condition' is an optional condition (containing an SQL expression) for the JOIN.
    #
    # 'type' must be either one of INNER, OUTER, LEFT or RIGHT. Default is 'INNER'.
    #
    */


    _createClass(_class27, [{
      key: 'join',
      value: function join(table) {
        var alias = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
        var condition = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;
        var type = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 'INNER';

        table = this._sanitizeTable(table, true);
        alias = alias ? this._sanitizeTableAlias(alias) : alias;
        condition = condition ? this._sanitizeExpression(condition) : condition;

        this._joins.push({
          type: type,
          table: table,
          alias: alias,
          condition: condition
        });
      }
    }, {
      key: 'left_join',
      value: function left_join(table) {
        var alias = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
        var condition = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;

        this.join(table, alias, condition, 'LEFT');
      }
    }, {
      key: 'right_join',
      value: function right_join(table) {
        var alias = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
        var condition = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;

        this.join(table, alias, condition, 'RIGHT');
      }
    }, {
      key: 'outer_join',
      value: function outer_join(table) {
        var alias = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
        var condition = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;

        this.join(table, alias, condition, 'OUTER');
      }
    }, {
      key: 'left_outer_join',
      value: function left_outer_join(table) {
        var alias = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
        var condition = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;

        this.join(table, alias, condition, 'LEFT OUTER');
      }
    }, {
      key: 'full_join',
      value: function full_join(table) {
        var alias = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
        var condition = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;

        this.join(table, alias, condition, 'FULL');
      }
    }, {
      key: 'cross_join',
      value: function cross_join(table) {
        var alias = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
        var condition = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;

        this.join(table, alias, condition, 'CROSS');
      }
    }, {
      key: '_toParamString',
      value: function _toParamString() {
        var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

        var totalStr = "",
            totalValues = [];

        var _iteratorNormalCompletion10 = true;
        var _didIteratorError10 = false;
        var _iteratorError10 = undefined;

        try {
          for (var _iterator10 = this._joins[Symbol.iterator](), _step10; !(_iteratorNormalCompletion10 = (_step10 = _iterator10.next()).done); _iteratorNormalCompletion10 = true) {
            var _ref6 = _step10.value;
            var type = _ref6.type;
            var table = _ref6.table;
            var alias = _ref6.alias;
            var condition = _ref6.condition;

            totalStr = _pad(totalStr, this.options.separator);

            var tableStr = void 0;

            if (cls.isSquelBuilder(table)) {
              var ret = table._toParamString({
                buildParameterized: options.buildParameterized,
                nested: true
              });

              ret.values.forEach(function (value) {
                return totalValues.push(value);
              });
              tableStr = ret.text;
            } else {
              tableStr = this._formatTableName(table);
            }

            totalStr += type + ' JOIN ' + tableStr;

            if (alias) {
              totalStr += ' ' + this._formatTableAlias(alias);
            }

            if (condition) {
              totalStr += ' ON ';

              var _ret2 = void 0;

              if (cls.isSquelBuilder(condition)) {
                _ret2 = condition._toParamString({
                  buildParameterized: options.buildParameterized
                });
              } else {
                _ret2 = this._buildString(condition, [], {
                  buildParameterized: options.buildParameterized
                });
              }

              totalStr += this._applyNestingFormatting(_ret2.text);
              _ret2.values.forEach(function (value) {
                return totalValues.push(value);
              });
            }
          }
        } catch (err) {
          _didIteratorError10 = true;
          _iteratorError10 = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion10 && _iterator10.return) {
              _iterator10.return();
            }
          } finally {
            if (_didIteratorError10) {
              throw _iteratorError10;
            }
          }
        }

        return {
          text: totalStr,
          values: totalValues
        };
      }
    }]);

    return _class27;
  }(cls.Block);

  // UNION
  cls.UnionBlock = function (_cls$Block13) {
    _inherits(_class28, _cls$Block13);

    function _class28(options) {
      _classCallCheck(this, _class28);

      var _this31 = _possibleConstructorReturn(this, (_class28.__proto__ || Object.getPrototypeOf(_class28)).call(this, options));

      _this31._unions = [];
      return _this31;
    }

    /**
    # Add a UNION with the given table/query.
    #
    # 'table' is the name of the table or query to union with.
    #
    # 'type' must be either one of UNION or UNION ALL.... Default is 'UNION'.
    */


    _createClass(_class28, [{
      key: 'union',
      value: function union(table) {
        var type = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'UNION';

        table = this._sanitizeTable(table);

        this._unions.push({
          type: type,
          table: table
        });
      }

      // Add a UNION ALL with the given table/query.

    }, {
      key: 'union_all',
      value: function union_all(table) {
        this.union(table, 'UNION ALL');
      }
    }, {
      key: '_toParamString',
      value: function _toParamString() {
        var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

        var totalStr = '',
            totalValues = [];

        var _iteratorNormalCompletion11 = true;
        var _didIteratorError11 = false;
        var _iteratorError11 = undefined;

        try {
          for (var _iterator11 = this._unions[Symbol.iterator](), _step11; !(_iteratorNormalCompletion11 = (_step11 = _iterator11.next()).done); _iteratorNormalCompletion11 = true) {
            var _ref7 = _step11.value;
            var type = _ref7.type;
            var table = _ref7.table;

            totalStr = _pad(totalStr, this.options.separator);

            var tableStr = void 0;

            if (table instanceof cls.BaseBuilder) {
              var ret = table._toParamString({
                buildParameterized: options.buildParameterized,
                nested: true
              });

              tableStr = ret.text;
              ret.values.forEach(function (value) {
                return totalValues.push(value);
              });
            } else {
              totalStr = this._formatTableName(table);
            }

            totalStr += type + ' ' + tableStr;
          }
        } catch (err) {
          _didIteratorError11 = true;
          _iteratorError11 = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion11 && _iterator11.return) {
              _iterator11.return();
            }
          } finally {
            if (_didIteratorError11) {
              throw _iteratorError11;
            }
          }
        }

        return {
          text: totalStr,
          values: totalValues
        };
      }
    }]);

    return _class28;
  }(cls.Block);

  /*
  # ---------------------------------------------------------------------------------------------------------
  # ---------------------------------------------------------------------------------------------------------
  # Query builders
  # ---------------------------------------------------------------------------------------------------------
  # ---------------------------------------------------------------------------------------------------------
  */

  /**
  # Query builder base class
  #
  # Note that the query builder does not check the final query string for correctness.
  #
  # All the build methods in this object return the object instance for chained method calling purposes.
  */
  cls.QueryBuilder = function (_cls$BaseBuilder4) {
    _inherits(_class29, _cls$BaseBuilder4);

    /**
    # Constructor
    #
    # blocks - array of cls.BaseBuilderBlock instances to build the query with.
    */
    function _class29(options, blocks) {
      _classCallCheck(this, _class29);

      var _this32 = _possibleConstructorReturn(this, (_class29.__proto__ || Object.getPrototypeOf(_class29)).call(this, options));

      _this32.blocks = blocks || [];

      // Copy exposed methods into myself
      var _iteratorNormalCompletion12 = true;
      var _didIteratorError12 = false;
      var _iteratorError12 = undefined;

      try {
        for (var _iterator12 = _this32.blocks[Symbol.iterator](), _step12; !(_iteratorNormalCompletion12 = (_step12 = _iterator12.next()).done); _iteratorNormalCompletion12 = true) {
          var block = _step12.value;

          var exposedMethods = block.exposedMethods();

          for (var methodName in exposedMethods) {
            var methodBody = exposedMethods[methodName];

            if (undefined !== _this32[methodName]) {
              throw new Error('Builder already has a builder method called: ' + methodName);
            }

            (function (block, name, body) {
              _this32[name] = function () {
                for (var _len10 = arguments.length, args = Array(_len10), _key10 = 0; _key10 < _len10; _key10++) {
                  args[_key10] = arguments[_key10];
                }

                body.call.apply(body, [block].concat(args));

                return _this32;
              };
            })(block, methodName, methodBody);
          }
        }
      } catch (err) {
        _didIteratorError12 = true;
        _iteratorError12 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion12 && _iterator12.return) {
            _iterator12.return();
          }
        } finally {
          if (_didIteratorError12) {
            throw _iteratorError12;
          }
        }
      }

      return _this32;
    }

    /**
    # Register a custom value handler for this query builder and all its contained blocks.
    #
    # Note: This will override any globally registered handler for this value type.
    */


    _createClass(_class29, [{
      key: 'registerValueHandler',
      value: function registerValueHandler(type, handler) {
        var _iteratorNormalCompletion13 = true;
        var _didIteratorError13 = false;
        var _iteratorError13 = undefined;

        try {
          for (var _iterator13 = this.blocks[Symbol.iterator](), _step13; !(_iteratorNormalCompletion13 = (_step13 = _iterator13.next()).done); _iteratorNormalCompletion13 = true) {
            var block = _step13.value;

            block.registerValueHandler(type, handler);
          }
        } catch (err) {
          _didIteratorError13 = true;
          _iteratorError13 = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion13 && _iterator13.return) {
              _iterator13.return();
            }
          } finally {
            if (_didIteratorError13) {
              throw _iteratorError13;
            }
          }
        }

        _get(_class29.prototype.__proto__ || Object.getPrototypeOf(_class29.prototype), 'registerValueHandler', this).call(this, type, handler);

        return this;
      }

      /**
      # Update query builder options
      #
      # This will update the options for all blocks too. Use this method with caution as it allows you to change the
      # behaviour of your query builder mid-build.
      */

    }, {
      key: 'updateOptions',
      value: function updateOptions(options) {
        this.options = _extend({}, this.options, options);

        var _iteratorNormalCompletion14 = true;
        var _didIteratorError14 = false;
        var _iteratorError14 = undefined;

        try {
          for (var _iterator14 = this.blocks[Symbol.iterator](), _step14; !(_iteratorNormalCompletion14 = (_step14 = _iterator14.next()).done); _iteratorNormalCompletion14 = true) {
            var block = _step14.value;

            block.options = _extend({}, block.options, options);
          }
        } catch (err) {
          _didIteratorError14 = true;
          _iteratorError14 = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion14 && _iterator14.return) {
              _iterator14.return();
            }
          } finally {
            if (_didIteratorError14) {
              throw _iteratorError14;
            }
          }
        }
      }

      // Get the final fully constructed query param obj.

    }, {
      key: '_toParamString',
      value: function _toParamString() {
        var _this33 = this;

        var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

        options = _extend({}, this.options, options);

        var blockResults = this.blocks.map(function (b) {
          return b._toParamString({
            buildParameterized: options.buildParameterized,
            queryBuilder: _this33
          });
        });

        var blockTexts = blockResults.map(function (b) {
          return b.text;
        });
        var blockValues = blockResults.map(function (b) {
          return b.values;
        });

        var totalStr = blockTexts.filter(function (v) {
          return 0 < v.length;
        }).join(options.separator);

        var totalValues = [];
        blockValues.forEach(function (block) {
          return block.forEach(function (value) {
            return totalValues.push(value);
          });
        });

        if (!options.nested) {
          if (options.numberedParameters) {
            var i = undefined !== options.numberedParametersStartAt ? options.numberedParametersStartAt : 1;

            // construct regex for searching
            var regex = options.parameterCharacter.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");

            totalStr = totalStr.replace(new RegExp(regex, 'g'), function () {
              return '' + options.numberedParametersPrefix + i++;
            });
          }
        }

        return {
          text: this._applyNestingFormatting(totalStr, !!options.nested),
          values: totalValues
        };
      }

      // Deep clone

    }, {
      key: 'clone',
      value: function clone() {
        var blockClones = this.blocks.map(function (v) {
          return v.clone();
        });

        return new this.constructor(this.options, blockClones);
      }

      // Get a specific block

    }, {
      key: 'getBlock',
      value: function getBlock(blockType) {
        var filtered = this.blocks.filter(function (b) {
          return b instanceof blockType;
        });

        return filtered[0];
      }
    }]);

    return _class29;
  }(cls.BaseBuilder);

  // SELECT query builder.
  cls.Select = function (_cls$QueryBuilder) {
    _inherits(_class30, _cls$QueryBuilder);

    function _class30(options) {
      var blocks = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;

      _classCallCheck(this, _class30);

      blocks = blocks || [new cls.StringBlock(options, 'SELECT'), new cls.FunctionBlock(options), new cls.DistinctBlock(options), new cls.GetFieldBlock(options), new cls.FromTableBlock(options), new cls.JoinBlock(options), new cls.WhereBlock(options), new cls.GroupByBlock(options), new cls.HavingBlock(options), new cls.OrderByBlock(options), new cls.LimitBlock(options), new cls.OffsetBlock(options), new cls.UnionBlock(options)];

      return _possibleConstructorReturn(this, (_class30.__proto__ || Object.getPrototypeOf(_class30)).call(this, options, blocks));
    }

    return _class30;
  }(cls.QueryBuilder);

  // UPDATE query builder.
  cls.Update = function (_cls$QueryBuilder2) {
    _inherits(_class31, _cls$QueryBuilder2);

    function _class31(options) {
      var blocks = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;

      _classCallCheck(this, _class31);

      blocks = blocks || [new cls.StringBlock(options, 'UPDATE'), new cls.UpdateTableBlock(options), new cls.SetFieldBlock(options), new cls.WhereBlock(options), new cls.OrderByBlock(options), new cls.LimitBlock(options)];

      return _possibleConstructorReturn(this, (_class31.__proto__ || Object.getPrototypeOf(_class31)).call(this, options, blocks));
    }

    return _class31;
  }(cls.QueryBuilder);

  // DELETE query builder.
  cls.Delete = function (_cls$QueryBuilder3) {
    _inherits(_class32, _cls$QueryBuilder3);

    function _class32(options) {
      var blocks = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;

      _classCallCheck(this, _class32);

      blocks = blocks || [new cls.StringBlock(options, 'DELETE'), new cls.TargetTableBlock(options), new cls.FromTableBlock(_extend({}, options, {
        singleTable: true
      })), new cls.JoinBlock(options), new cls.WhereBlock(options), new cls.OrderByBlock(options), new cls.LimitBlock(options)];

      return _possibleConstructorReturn(this, (_class32.__proto__ || Object.getPrototypeOf(_class32)).call(this, options, blocks));
    }

    return _class32;
  }(cls.QueryBuilder);

  // An INSERT query builder.
  cls.Insert = function (_cls$QueryBuilder4) {
    _inherits(_class33, _cls$QueryBuilder4);

    function _class33(options) {
      var blocks = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;

      _classCallCheck(this, _class33);

      blocks = blocks || [new cls.StringBlock(options, 'INSERT'), new cls.IntoTableBlock(options), new cls.InsertFieldValueBlock(options), new cls.InsertFieldsFromQueryBlock(options)];

      return _possibleConstructorReturn(this, (_class33.__proto__ || Object.getPrototypeOf(_class33)).call(this, options, blocks));
    }

    return _class33;
  }(cls.QueryBuilder);

  var _squel = {
    VERSION: '5.13.0',
    flavour: flavour,
    expr: function expr(options) {
      return new cls.Expression(options);
    },
    case: function _case(name, options) {
      return new cls.Case(name, options);
    },
    select: function select(options, blocks) {
      return new cls.Select(options, blocks);
    },
    update: function update(options, blocks) {
      return new cls.Update(options, blocks);
    },
    insert: function insert(options, blocks) {
      return new cls.Insert(options, blocks);
    },
    delete: function _delete(options, blocks) {
      return new cls.Delete(options, blocks);
    },
    str: function str() {
      var inst = new cls.FunctionBlock();
      inst.function.apply(inst, arguments);
      return inst;
    },
    rstr: function rstr() {
      var inst = new cls.FunctionBlock({
        rawNesting: true
      });
      inst.function.apply(inst, arguments);
      return inst;
    },
    registerValueHandler: cls.registerValueHandler
  };

  // aliases
  _squel.remove = _squel.delete;

  // classes
  _squel.cls = cls;

  return _squel;
}

/**
# ---------------------------------------------------------------------------------------------------------
# ---------------------------------------------------------------------------------------------------------
# Exported instance (and for use by flavour definitions further down).
# ---------------------------------------------------------------------------------------------------------
# ---------------------------------------------------------------------------------------------------------
*/

var squel = _buildSquel();

/**
# ---------------------------------------------------------------------------------------------------------
# ---------------------------------------------------------------------------------------------------------
# Squel SQL flavours
# ---------------------------------------------------------------------------------------------------------
# ---------------------------------------------------------------------------------------------------------
*/

// Available flavours
squel.flavours = {};

// Setup Squel for a particular SQL flavour
squel.useFlavour = function () {
  var flavour = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;

  if (!flavour) {
    return squel;
  }

  if (squel.flavours[flavour] instanceof Function) {
    var s = _buildSquel(flavour);

    squel.flavours[flavour].call(null, s);

    // add in flavour methods
    s.flavours = squel.flavours;
    s.useFlavour = squel.useFlavour;

    return s;
  } else {
    throw new Error('Flavour not available: ' + flavour);
  }
};

squel.flavours['mssql'] = function (_squel) {
  var cls = _squel.cls;

  cls.DefaultQueryBuilderOptions.replaceSingleQuotes = true;
  cls.DefaultQueryBuilderOptions.autoQuoteAliasNames = false;
  cls.DefaultQueryBuilderOptions.numberedParametersPrefix = '@';

  _squel.registerValueHandler(Date, function (date) {
    return '\'' + date.getUTCFullYear() + '-' + (date.getUTCMonth() + 1) + '-' + date.getUTCDate() + ' ' + date.getUTCHours() + ':' + date.getUTCMinutes() + ':' + date.getUTCSeconds() + '\'';
  });

  //�LIMIT,  OFFSET x and TOP x
  cls.MssqlLimitOffsetTopBlock = function (_cls$Block14) {
    _inherits(_class34, _cls$Block14);

    function _class34(options) {
      _classCallCheck(this, _class34);

      var _this38 = _possibleConstructorReturn(this, (_class34.__proto__ || Object.getPrototypeOf(_class34)).call(this, options));

      _this38._limits = null;
      _this38._offsets = null;

      // This is setup as one block to return many as they all have to use each others data at different times
      // The build String of EITHER LIMIT OR TOP should execute, never both.

      /**
      # Set the LIMIT/TOP transformation.
      #
      # Call this will override the previously set limit for this query. Also note that Passing 0 for 'max' will remove
      # the limit.
      */
      var _limit = function _limit(max) {
        max = this._sanitizeLimitOffset(max);
        this._parent._limits = max;
      };

      _this38.ParentBlock = function (_cls$Block15) {
        _inherits(_class35, _cls$Block15);

        function _class35(parent) {
          _classCallCheck(this, _class35);

          var _this39 = _possibleConstructorReturn(this, (_class35.__proto__ || Object.getPrototypeOf(_class35)).call(this, parent.options));

          _this39._parent = parent;
          return _this39;
        }

        return _class35;
      }(cls.Block);

      _this38.LimitBlock = function (_this38$ParentBlock) {
        _inherits(_class36, _this38$ParentBlock);

        function _class36(parent) {
          _classCallCheck(this, _class36);

          var _this40 = _possibleConstructorReturn(this, (_class36.__proto__ || Object.getPrototypeOf(_class36)).call(this, parent));

          _this40.limit = _limit;
          return _this40;
        }

        _createClass(_class36, [{
          key: '_toParamString',
          value: function _toParamString() {
            var str = "";

            if (this._parent._limits && this._parent._offsets) {
              str = 'FETCH NEXT ' + this._parent._limits + ' ROWS ONLY';
            }

            return {
              text: str,
              values: []
            };
          }
        }]);

        return _class36;
      }(_this38.ParentBlock);

      _this38.TopBlock = function (_this38$ParentBlock2) {
        _inherits(_class37, _this38$ParentBlock2);

        function _class37(parent) {
          _classCallCheck(this, _class37);

          var _this41 = _possibleConstructorReturn(this, (_class37.__proto__ || Object.getPrototypeOf(_class37)).call(this, parent));

          _this41.top = _limit;
          return _this41;
        }

        _createClass(_class37, [{
          key: '_toParamString',
          value: function _toParamString() {
            var str = "";

            if (this._parent._limits && !this._parent._offsets) {
              str = 'TOP (' + this._parent._limits + ')';
            }

            return {
              text: str,
              values: []
            };
          }
        }]);

        return _class37;
      }(_this38.ParentBlock);

      _this38.OffsetBlock = function (_this38$ParentBlock3) {
        _inherits(_class38, _this38$ParentBlock3);

        function _class38() {
          _classCallCheck(this, _class38);

          return _possibleConstructorReturn(this, (_class38.__proto__ || Object.getPrototypeOf(_class38)).apply(this, arguments));
        }

        _createClass(_class38, [{
          key: 'offset',
          value: function offset(start) {
            this._parent._offsets = this._sanitizeLimitOffset(start);
          }
        }, {
          key: '_toParamString',
          value: function _toParamString() {
            var str = "";

            if (this._parent._offsets) {
              str = 'OFFSET ' + this._parent._offsets + ' ROWS';
            }

            return {
              text: str,
              values: []
            };
          }
        }]);

        return _class38;
      }(_this38.ParentBlock);
      return _this38;
    }

    _createClass(_class34, [{
      key: 'LIMIT',
      value: function LIMIT() {
        return new this.LimitBlock(this);
      }
    }, {
      key: 'TOP',
      value: function TOP() {
        return new this.TopBlock(this);
      }
    }, {
      key: 'OFFSET',
      value: function OFFSET() {
        return new this.OffsetBlock(this);
      }
    }]);

    return _class34;
  }(cls.Block);

  cls.MssqlUpdateTopBlock = function (_cls$Block16) {
    _inherits(_class39, _cls$Block16);

    function _class39(options) {
      _classCallCheck(this, _class39);

      var _this43 = _possibleConstructorReturn(this, (_class39.__proto__ || Object.getPrototypeOf(_class39)).call(this, options));

      _this43._limits = null;

      _this43.limit = _this43.top = function (max) {
        _this43._limits = _this43._sanitizeLimitOffset(max);
      };
      return _this43;
    }

    _createClass(_class39, [{
      key: '_toParamString',
      value: function _toParamString() {
        return {
          text: this._limits ? 'TOP (' + this._limits + ')' : "",
          values: []
        };
      }
    }]);

    return _class39;
  }(cls.Block);

  cls.MssqlInsertFieldValueBlock = function (_cls$InsertFieldValue) {
    _inherits(_class40, _cls$InsertFieldValue);

    function _class40(options) {
      _classCallCheck(this, _class40);

      var _this44 = _possibleConstructorReturn(this, (_class40.__proto__ || Object.getPrototypeOf(_class40)).call(this, options));

      _this44._outputs = [];
      return _this44;
    }

    // add fields to the output clause


    _createClass(_class40, [{
      key: 'output',
      value: function output(fields) {
        var _this45 = this;

        if ('string' === typeof fields) {
          this._outputs.push('INSERTED.' + this._sanitizeField(fields));
        } else {
          fields.forEach(function (f) {
            _this45._outputs.push('INSERTED.' + _this45._sanitizeField(f));
          });
        }
      }
    }, {
      key: '_toParamString',
      value: function _toParamString(options) {
        var ret = _get(_class40.prototype.__proto__ || Object.getPrototypeOf(_class40.prototype), '_toParamString', this).call(this, options);

        if (ret.text.length && 0 < this._outputs.length) {
          var innerStr = 'OUTPUT ' + this._outputs.join(', ') + ' ';

          var valuesPos = ret.text.indexOf('VALUES');

          ret.text = ret.text.substr(0, valuesPos) + innerStr + ret.text.substr(valuesPos);
        }

        return ret;
      }
    }]);

    return _class40;
  }(cls.InsertFieldValueBlock);

  cls.MssqlUpdateDeleteOutputBlock = function (_cls$Block17) {
    _inherits(_class41, _cls$Block17);

    function _class41(options) {
      _classCallCheck(this, _class41);

      var _this46 = _possibleConstructorReturn(this, (_class41.__proto__ || Object.getPrototypeOf(_class41)).call(this, options));

      _this46._outputs = [];
      return _this46;
    }

    /**
    # Add the given fields to the final result set.
    #
    # The parameter is an Object containing field names (or database functions) as the keys and aliases for the fields
    # as the values. If the value for a key is null then no alias is set for that field.
    #
    # Internally this method simply calls the field() method of this block to add each individual field.
    */


    _createClass(_class41, [{
      key: 'outputs',
      value: function outputs(_outputs) {
        for (var output in _outputs) {
          this.output(output, _outputs[output]);
        }
      }

      /**
      # Add the given field to the final result set.
      #
      # The 'field' parameter does not necessarily have to be a fieldname. It can use database functions too,
      # e.g. DATE_FORMAT(a.started, "%H")
      #
      # An alias may also be specified for this field.
      */

    }, {
      key: 'output',
      value: function output(_output) {
        var alias = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;

        _output = this._sanitizeField(_output);
        alias = alias ? this._sanitizeFieldAlias(alias) : alias;

        this._outputs.push({
          name: this.options.forDelete ? 'DELETED.' + _output : 'INSERTED.' + _output,
          alias: alias
        });
      }
    }, {
      key: '_toParamString',
      value: function _toParamString(queryBuilder) {
        var totalStr = "";

        if (this._outputs.length) {
          var _iteratorNormalCompletion15 = true;
          var _didIteratorError15 = false;
          var _iteratorError15 = undefined;

          try {
            for (var _iterator15 = this._outputs[Symbol.iterator](), _step15; !(_iteratorNormalCompletion15 = (_step15 = _iterator15.next()).done); _iteratorNormalCompletion15 = true) {
              var output = _step15.value;

              totalStr = _pad(totalStr, ", ");

              totalStr += output.name;

              if (output.alias) {
                totalStr += ' AS ' + this._formatFieldAlias(output.alias);
              }
            }
          } catch (err) {
            _didIteratorError15 = true;
            _iteratorError15 = err;
          } finally {
            try {
              if (!_iteratorNormalCompletion15 && _iterator15.return) {
                _iterator15.return();
              }
            } finally {
              if (_didIteratorError15) {
                throw _iteratorError15;
              }
            }
          }

          totalStr = 'OUTPUT ' + totalStr;
        }

        return {
          text: totalStr,
          values: []
        };
      }
    }]);

    return _class41;
  }(cls.Block);

  // SELECT query builder.
  cls.Select = function (_cls$QueryBuilder5) {
    _inherits(_class42, _cls$QueryBuilder5);

    function _class42(options) {
      var blocks = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;

      _classCallCheck(this, _class42);

      var limitOffsetTopBlock = new cls.MssqlLimitOffsetTopBlock(options);

      blocks = blocks || [new cls.StringBlock(options, 'SELECT'), new cls.DistinctBlock(options), limitOffsetTopBlock.TOP(), new cls.GetFieldBlock(options), new cls.FromTableBlock(options), new cls.JoinBlock(options), new cls.WhereBlock(options), new cls.GroupByBlock(options), new cls.OrderByBlock(options), limitOffsetTopBlock.OFFSET(), limitOffsetTopBlock.LIMIT(), new cls.UnionBlock(options)];

      return _possibleConstructorReturn(this, (_class42.__proto__ || Object.getPrototypeOf(_class42)).call(this, options, blocks));
    }

    return _class42;
  }(cls.QueryBuilder);

  // Order By in update requires subquery

  // UPDATE query builder.
  cls.Update = function (_cls$QueryBuilder6) {
    _inherits(_class43, _cls$QueryBuilder6);

    function _class43(options) {
      var blocks = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;

      _classCallCheck(this, _class43);

      blocks = blocks || [new cls.StringBlock(options, 'UPDATE'), new cls.MssqlUpdateTopBlock(options), new cls.UpdateTableBlock(options), new cls.SetFieldBlock(options), new cls.MssqlUpdateDeleteOutputBlock(options), new cls.WhereBlock(options)];

      return _possibleConstructorReturn(this, (_class43.__proto__ || Object.getPrototypeOf(_class43)).call(this, options, blocks));
    }

    return _class43;
  }(cls.QueryBuilder);

  // Order By and Limit/Top in delete requires subquery

  // DELETE query builder.
  cls.Delete = function (_cls$QueryBuilder7) {
    _inherits(_class44, _cls$QueryBuilder7);

    function _class44(options) {
      var blocks = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;

      _classCallCheck(this, _class44);

      blocks = blocks || [new cls.StringBlock(options, 'DELETE'), new cls.TargetTableBlock(options), new cls.FromTableBlock(_extend({}, options, { singleTable: true })), new cls.JoinBlock(options), new cls.MssqlUpdateDeleteOutputBlock(_extend({}, options, { forDelete: true })), new cls.WhereBlock(options), new cls.OrderByBlock(options), new cls.LimitBlock(options)];

      return _possibleConstructorReturn(this, (_class44.__proto__ || Object.getPrototypeOf(_class44)).call(this, options, blocks));
    }

    return _class44;
  }(cls.QueryBuilder);

  // An INSERT query builder.
  cls.Insert = function (_cls$QueryBuilder8) {
    _inherits(_class45, _cls$QueryBuilder8);

    function _class45(options) {
      var blocks = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;

      _classCallCheck(this, _class45);

      blocks = blocks || [new cls.StringBlock(options, 'INSERT'), new cls.IntoTableBlock(options), new cls.MssqlInsertFieldValueBlock(options), new cls.InsertFieldsFromQueryBlock(options)];

      return _possibleConstructorReturn(this, (_class45.__proto__ || Object.getPrototypeOf(_class45)).call(this, options, blocks));
    }

    return _class45;
  }(cls.QueryBuilder);
};

// This file contains additional Squel commands for use with MySQL

squel.flavours['mysql'] = function (_squel) {
  var cls = _squel.cls;

  // ON DUPLICATE KEY UPDATE ...
  cls.MysqlOnDuplicateKeyUpdateBlock = function (_cls$AbstractSetField3) {
    _inherits(_class46, _cls$AbstractSetField3);

    function _class46() {
      _classCallCheck(this, _class46);

      return _possibleConstructorReturn(this, (_class46.__proto__ || Object.getPrototypeOf(_class46)).apply(this, arguments));
    }

    _createClass(_class46, [{
      key: 'onDupUpdate',
      value: function onDupUpdate(field, value, options) {
        this._set(field, value, options);
      }
    }, {
      key: '_toParamString',
      value: function _toParamString() {
        var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

        var totalStr = "",
            totalValues = [];

        for (var i = 0; i < this._fields.length; ++i) {
          totalStr = _pad(totalStr, ', ');

          var field = this._fields[i];

          var value = this._values[0][i];

          var valueOptions = this._valueOptions[0][i];

          // e.g. if field is an expression such as: count = count + 1
          if (typeof value === 'undefined') {
            totalStr += field;
          } else {
            var ret = this._buildString(field + ' = ' + this.options.parameterCharacter, [value], {
              buildParameterized: options.buildParameterized,
              formattingOptions: valueOptions
            });

            totalStr += ret.text;
            ret.values.forEach(function (value) {
              return totalValues.push(value);
            });
          }
        }

        return {
          text: !totalStr.length ? "" : 'ON DUPLICATE KEY UPDATE ' + totalStr,
          values: totalValues
        };
      }
    }]);

    return _class46;
  }(cls.AbstractSetFieldBlock);

  // INSERT query builder.
  cls.Insert = function (_cls$QueryBuilder9) {
    _inherits(_class47, _cls$QueryBuilder9);

    function _class47(options) {
      var blocks = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;

      _classCallCheck(this, _class47);

      blocks = blocks || [new cls.StringBlock(options, 'INSERT'), new cls.IntoTableBlock(options), new cls.InsertFieldValueBlock(options), new cls.InsertFieldsFromQueryBlock(options), new cls.MysqlOnDuplicateKeyUpdateBlock(options)];

      return _possibleConstructorReturn(this, (_class47.__proto__ || Object.getPrototypeOf(_class47)).call(this, options, blocks));
    }

    return _class47;
  }(cls.QueryBuilder);

  // REPLACE query builder.
  cls.Replace = function (_cls$QueryBuilder10) {
    _inherits(_class48, _cls$QueryBuilder10);

    function _class48(options) {
      var blocks = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;

      _classCallCheck(this, _class48);

      blocks = blocks || [new cls.StringBlock(options, 'REPLACE'), new cls.IntoTableBlock(options), new cls.InsertFieldValueBlock(options), new cls.InsertFieldsFromQueryBlock(options)];

      return _possibleConstructorReturn(this, (_class48.__proto__ || Object.getPrototypeOf(_class48)).call(this, options, blocks));
    }

    return _class48;
  }(cls.QueryBuilder);

  _squel.replace = function (options, blocks) {
    return new cls.Replace(options, blocks);
  };
};

// This file contains additional Squel commands for use with the Postgres DB engine
squel.flavours['postgres'] = function (_squel) {
  var cls = _squel.cls;

  cls.DefaultQueryBuilderOptions.numberedParameters = true;
  cls.DefaultQueryBuilderOptions.numberedParametersStartAt = 1;
  cls.DefaultQueryBuilderOptions.autoQuoteAliasNames = false;
  cls.DefaultQueryBuilderOptions.useAsForTableAliasNames = true;

  cls.PostgresOnConflictKeyUpdateBlock = function (_cls$AbstractSetField4) {
    _inherits(_class49, _cls$AbstractSetField4);

    function _class49() {
      _classCallCheck(this, _class49);

      return _possibleConstructorReturn(this, (_class49.__proto__ || Object.getPrototypeOf(_class49)).apply(this, arguments));
    }

    _createClass(_class49, [{
      key: 'onConflict',
      value: function onConflict(conflictFields, fields) {
        var _this55 = this;

        this._onConflict = true;
        if (!conflictFields) {
          return;
        }
        if (!_isArray(conflictFields)) {
          conflictFields = [conflictFields];
        }
        this._dupFields = conflictFields.map(this._sanitizeField.bind(this));

        if (fields) {
          Object.keys(fields).forEach(function (key) {
            _this55._set(key, fields[key]);
          });
        }
      }
    }, {
      key: '_toParamString',
      value: function _toParamString() {
        var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

        var totalStr = "",
            totalValues = [];

        for (var i = 0; i < this._fields.length; ++i) {
          totalStr = _pad(totalStr, ', ');

          var field = this._fields[i];

          var value = this._values[0][i];

          var valueOptions = this._valueOptions[0][i];

          // e.g. if field is an expression such as: count = count + 1
          if (typeof value === 'undefined') {
            totalStr += field;
          } else {
            var ret = this._buildString(field + ' = ' + this.options.parameterCharacter, [value], {
              buildParameterized: options.buildParameterized,
              formattingOptions: valueOptions
            });

            totalStr += ret.text;
            ret.values.forEach(function (value) {
              return totalValues.push(value);
            });
          }
        }

        var returned = {
          text: '',
          values: totalValues
        };

        if (this._onConflict) {
          // note the trailing whitespace after the join
          var conflictFields = this._dupFields ? '(' + this._dupFields.join(', ') + ') ' : '';
          var action = totalStr.length ? 'UPDATE SET ' + totalStr : 'NOTHING';
          returned.text = 'ON CONFLICT ' + conflictFields + 'DO ' + action;
        }

        return returned;
      }
    }]);

    return _class49;
  }(cls.AbstractSetFieldBlock);

  // RETURNING
  cls.ReturningBlock = function (_cls$Block18) {
    _inherits(_class50, _cls$Block18);

    function _class50(options) {
      _classCallCheck(this, _class50);

      var _this56 = _possibleConstructorReturn(this, (_class50.__proto__ || Object.getPrototypeOf(_class50)).call(this, options));

      _this56._fields = [];
      return _this56;
    }

    _createClass(_class50, [{
      key: 'returning',
      value: function returning(field) {
        var alias = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
        var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

        alias = alias ? this._sanitizeFieldAlias(alias) : alias;
        field = this._sanitizeField(field);

        // if field-alias combo already present then don't add
        var existingField = this._fields.filter(function (f) {
          return f.name === field && f.alias === alias;
        });
        if (existingField.length) {
          return this;
        }

        this._fields.push({
          name: field,
          alias: alias,
          options: options
        });
      }
    }, {
      key: '_toParamString',
      value: function _toParamString() {
        var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
        var queryBuilder = options.queryBuilder,
            buildParameterized = options.buildParameterized;


        var totalStr = '',
            totalValues = [];

        var _iteratorNormalCompletion16 = true;
        var _didIteratorError16 = false;
        var _iteratorError16 = undefined;

        try {
          for (var _iterator16 = this._fields[Symbol.iterator](), _step16; !(_iteratorNormalCompletion16 = (_step16 = _iterator16.next()).done); _iteratorNormalCompletion16 = true) {
            var field = _step16.value;

            totalStr = _pad(totalStr, ", ");

            var name = field.name,
                alias = field.alias,
                _options2 = field.options;


            if (typeof name === 'string') {
              totalStr += this._formatFieldName(name, _options2);
            } else {
              var ret = name._toParamString({
                nested: true,
                buildParameterized: buildParameterized
              });

              totalStr += ret.text;
              ret.values.forEach(function (value) {
                return totalValues.push(value);
              });
            }

            if (alias) {
              totalStr += ' AS ' + this._formatFieldAlias(alias);
            }
          }
        } catch (err) {
          _didIteratorError16 = true;
          _iteratorError16 = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion16 && _iterator16.return) {
              _iterator16.return();
            }
          } finally {
            if (_didIteratorError16) {
              throw _iteratorError16;
            }
          }
        }

        return {
          text: totalStr.length > 0 ? 'RETURNING ' + totalStr : '',
          values: totalValues
        };
      }
    }]);

    return _class50;
  }(cls.Block);

  // WITH
  cls.WithBlock = function (_cls$Block19) {
    _inherits(_class51, _cls$Block19);

    function _class51(options) {
      _classCallCheck(this, _class51);

      var _this57 = _possibleConstructorReturn(this, (_class51.__proto__ || Object.getPrototypeOf(_class51)).call(this, options));

      _this57._tables = [];
      return _this57;
    }

    _createClass(_class51, [{
      key: 'with',
      value: function _with(alias, table) {
        this._tables.push({ alias: alias, table: table });
      }
    }, {
      key: '_toParamString',
      value: function _toParamString() {
        var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

        var parts = [];
        var values = [];

        var _iteratorNormalCompletion17 = true;
        var _didIteratorError17 = false;
        var _iteratorError17 = undefined;

        try {
          for (var _iterator17 = this._tables[Symbol.iterator](), _step17; !(_iteratorNormalCompletion17 = (_step17 = _iterator17.next()).done); _iteratorNormalCompletion17 = true) {
            var _ref8 = _step17.value;
            var alias = _ref8.alias;
            var table = _ref8.table;

            var ret = table._toParamString({
              buildParameterized: options.buildParameterized,
              nested: true
            });

            parts.push(alias + ' AS ' + ret.text);
            ret.values.forEach(function (value) {
              return values.push(value);
            });
          }
        } catch (err) {
          _didIteratorError17 = true;
          _iteratorError17 = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion17 && _iterator17.return) {
              _iterator17.return();
            }
          } finally {
            if (_didIteratorError17) {
              throw _iteratorError17;
            }
          }
        }

        return {
          text: parts.length ? 'WITH ' + parts.join(', ') : '',
          values: values
        };
      }
    }]);

    return _class51;
  }(cls.Block);

  // DISTINCT [ON]
  cls.DistinctOnBlock = function (_cls$Block20) {
    _inherits(_class52, _cls$Block20);

    function _class52(options) {
      _classCallCheck(this, _class52);

      var _this58 = _possibleConstructorReturn(this, (_class52.__proto__ || Object.getPrototypeOf(_class52)).call(this, options));

      _this58._distinctFields = [];
      return _this58;
    }

    _createClass(_class52, [{
      key: 'distinct',
      value: function distinct() {
        var _this59 = this;

        this._useDistinct = true;

        // Add all fields to the DISTINCT ON clause.

        for (var _len11 = arguments.length, fields = Array(_len11), _key11 = 0; _key11 < _len11; _key11++) {
          fields[_key11] = arguments[_key11];
        }

        fields.forEach(function (field) {
          _this59._distinctFields.push(_this59._sanitizeField(field));
        });
      }
    }, {
      key: '_toParamString',
      value: function _toParamString() {
        var text = '';

        if (this._useDistinct) {
          text = 'DISTINCT';

          if (this._distinctFields.length) {
            text += ' ON (' + this._distinctFields.join(', ') + ')';
          }
        }

        return {
          text: text,
          values: []
        };
      }
    }]);

    return _class52;
  }(cls.Block);

  // SELECT query builder.
  cls.Select = function (_cls$QueryBuilder11) {
    _inherits(_class53, _cls$QueryBuilder11);

    function _class53(options) {
      var blocks = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;

      _classCallCheck(this, _class53);

      blocks = blocks || [new cls.WithBlock(options), new cls.StringBlock(options, 'SELECT'), new cls.FunctionBlock(options), new cls.DistinctOnBlock(options), new cls.GetFieldBlock(options), new cls.FromTableBlock(options), new cls.JoinBlock(options), new cls.WhereBlock(options), new cls.GroupByBlock(options), new cls.HavingBlock(options), new cls.OrderByBlock(options), new cls.LimitBlock(options), new cls.OffsetBlock(options), new cls.UnionBlock(options)];

      return _possibleConstructorReturn(this, (_class53.__proto__ || Object.getPrototypeOf(_class53)).call(this, options, blocks));
    }

    return _class53;
  }(cls.QueryBuilder);

  // INSERT query builder
  cls.Insert = function (_cls$QueryBuilder12) {
    _inherits(_class54, _cls$QueryBuilder12);

    function _class54(options) {
      var blocks = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;

      _classCallCheck(this, _class54);

      blocks = blocks || [new cls.WithBlock(options), new cls.StringBlock(options, 'INSERT'), new cls.IntoTableBlock(options), new cls.InsertFieldValueBlock(options), new cls.InsertFieldsFromQueryBlock(options), new cls.PostgresOnConflictKeyUpdateBlock(options), new cls.ReturningBlock(options)];

      return _possibleConstructorReturn(this, (_class54.__proto__ || Object.getPrototypeOf(_class54)).call(this, options, blocks));
    }

    return _class54;
  }(cls.QueryBuilder);

  // UPDATE query builder
  cls.Update = function (_cls$QueryBuilder13) {
    _inherits(_class55, _cls$QueryBuilder13);

    function _class55(options) {
      var blocks = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;

      _classCallCheck(this, _class55);

      blocks = blocks || [new cls.WithBlock(options), new cls.StringBlock(options, 'UPDATE'), new cls.UpdateTableBlock(options), new cls.SetFieldBlock(options), new cls.FromTableBlock(options), new cls.WhereBlock(options), new cls.OrderByBlock(options), new cls.LimitBlock(options), new cls.ReturningBlock(options)];

      return _possibleConstructorReturn(this, (_class55.__proto__ || Object.getPrototypeOf(_class55)).call(this, options, blocks));
    }

    return _class55;
  }(cls.QueryBuilder);

  // DELETE query builder
  cls.Delete = function (_cls$QueryBuilder14) {
    _inherits(_class56, _cls$QueryBuilder14);

    function _class56(options) {
      var blocks = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;

      _classCallCheck(this, _class56);

      blocks = blocks || [new cls.WithBlock(options), new cls.StringBlock(options, 'DELETE'), new cls.TargetTableBlock(options), new cls.FromTableBlock(_extend({}, options, {
        singleTable: true
      })), new cls.JoinBlock(options), new cls.WhereBlock(options), new cls.OrderByBlock(options), new cls.LimitBlock(options), new cls.ReturningBlock(options)];

      return _possibleConstructorReturn(this, (_class56.__proto__ || Object.getPrototypeOf(_class56)).call(this, options, blocks));
    }

    return _class56;
  }(cls.QueryBuilder);
};
return squel;
}));
