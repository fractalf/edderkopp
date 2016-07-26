'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _getIterator2 = require('babel-runtime/core-js/get-iterator');

var _getIterator3 = _interopRequireDefault(_getIterator2);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _cheerio = require('cheerio');

var _cheerio2 = _interopRequireDefault(_cheerio);

var _log = require('./log');

var _log2 = _interopRequireDefault(_log);

var _parserTasks = require('./parser-tasks');

var parserTasks = _interopRequireWildcard(_parserTasks);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// Parser
var _class = function () {
    // Keep values=null in dataset

    function _class(html) {
        (0, _classCallCheck3.default)(this, _class);
        this.includeNull = true;

        if (html) {
            this._load(html);
        }
    }

    (0, _createClass3.default)(_class, [{
        key: '_load',
        value: function _load(html) {
            this._html = html;
            this._$ = _cheerio2.default.load(html);
        }
    }, {
        key: 'find',
        value: function find(selector) {
            var $ = this._$;
            return !!$(selector).length;
        }
    }, {
        key: 'getData',
        value: function getData(rules) {
            return this._recParse(rules);
        }
    }, {
        key: 'getLinks',
        value: function getLinks() {
            var _this = this;

            var follow = arguments.length <= 0 || arguments[0] === undefined ? [{ elem: 'a' }] : arguments[0];
            var skip = arguments.length <= 1 || arguments[1] === undefined ? [] : arguments[1];

            var $ = this._$;
            var links = [];

            // Handle follow
            if (!Array.isArray(follow)) {
                follow = [follow];
            }

            // Handle skip
            skip.push('a[rel=nofollow]');

            var _loop = function _loop(i) {
                var f = follow[i];
                // Convert "shortcut" for regexp match to proper task
                // link: [ '<regexp>', .. ]
                if (typeof f === 'string') {
                    f = { task: ['match', f] };
                }
                if (!f.elem) {
                    f.elem = 'a';
                }

                // Handle skip => add :not(<skip>) to selectors
                var selector = f.elem.split(',');
                for (var j = 0; j < selector.length; j++) {
                    selector[j] += ':not(' + skip.join(',') + ')';
                }
                selector = selector.join(',');

                // Find stuff
                $(selector).each(function (i, elem) {
                    var url = $(elem).attr('href').trim();
                    if (url && f.task) {
                        url = _this._runTasks(f.task, url);
                    }
                    if (url) {
                        links.push(url);
                    }
                });
            };

            for (var i = 0; i < follow.length; i++) {
                _loop(i);
            }

            return links;
        }

        // Recursively parse DOM

    }, {
        key: '_recParse',
        value: function _recParse(rules, data, $container) {
            var _this2 = this;

            var $ = this._$;
            data = data || {};

            var _loop2 = function _loop2(i) {
                var rule = rules[i];
                if (rule.name) {
                    // const $elem = rule.elem ? $(rule.elem, $container) : $container;
                    var $elem = void 0,
                        optional = false;
                    if (rule.elem) {
                        if (Array.isArray(rule.elem)) {
                            $elem = $(rule.elem[0], $container);
                            optional = rule.elem[1] == 'optional';
                        } else {
                            $elem = $(rule.elem, $container);
                        }
                    } else {
                        $elem = $container;
                    }
                    if ($elem.length > 0) {
                        if (rule.data == 'array') {
                            data[rule.name] = data[rule.name] || [];
                            $elem.each(function (i, e) {
                                var obj = {};
                                data[rule.name].push(obj);
                                _this2._recParse(rule.kids, obj, $(e));
                            });
                        } else if (rule.data == 'object') {
                            data[rule.name] = {};
                            _this2._recParse(rule.kids, data[rule.name], $elem);
                        } else if (rule.data && rule.data[0] == 'constant') {
                            data[rule.name] = rule.data[1];
                        } else {
                            var values = _this2._getContent($elem, rule);
                            if (values !== null || _this2.includeNull) {
                                // Join values with same name
                                data[rule.name] = data[rule.name] ? [].concat(data[rule.name], values) : values;
                            }
                        }
                    } else if (!optional) {
                        _log2.default.warn('[parser] Element not found: ' + rule.elem);
                    }
                } else if (rule.elem) {
                    _this2._recParse(rule.kids, data, $(rule.elem, $container));
                }
            };

            for (var i = 0; i < rules.length; i++) {
                _loop2(i);
            }
            return data;
        }

        // Get values

    }, {
        key: '_getContent',
        value: function _getContent($elem, rule) {
            var $ = this._$;
            var value = void 0,
                values = [];
            var dataType = Array.isArray(rule.data) ? rule.data[0] : rule.data;
            $elem.each(function () {
                var _this3 = this;

                (function () {
                    switch (dataType) {
                        case 'html':
                            // Get all content including tags
                            // Ex: <p>paragraph 1</p> <p>paragraph 2</p> <p>paragraph 3</p>
                            value = $(_this3).html().trim();
                            if (value) {
                                values.push(value);
                            }
                            break;
                        case 'text':
                            // Get only text nodes
                            // Ex: <span>skip this</span> get this <span>skip this</span>
                            var nodes = [];
                            $(_this3).contents().each(function (i, el) {
                                if (el.nodeType == 3) {
                                    // 3 = TEXT_NODE
                                    value = el.data.trim();
                                    if (value) {
                                        nodes.push(el.data.trim());
                                    }
                                }
                            });
                            var index = typeof rule.data !== 'string' ? rule.data[1] : false;
                            if (index !== false) {
                                values.push(nodes[index]);
                            } else {
                                values = [].concat(values, nodes);
                            }
                            break;
                        case 'attr':
                            // Get content from attribute
                            // Ex: <img src="value">, <a href="value">foo</a>
                            for (var i = 1; i < rule.data.length; i++) {
                                value = $(_this3).attr(rule.data[i]);
                                if (value) {
                                    values.push(value);
                                } else {
                                    _log2.default.warn('[parser] Attribute not found: ' + rule.data[i]);
                                }
                            }
                            break;
                        case 'data':
                            // Get content from data
                            // Ex: <div data-img-a="value" data-img-b="value" data-img-c="value">
                            for (var _i = 1; _i < rule.data.length; _i++) {
                                value = $(_this3).data(rule.data[_i]);
                                if (value) {
                                    values.push(value);
                                } else {
                                    _log2.default.warn('[parser] Data attribute not found: ' + rule.data[_i]);
                                }
                            }
                            break;
                        default:
                            // Get only text (strip away tags)
                            value = $(_this3).text().trim();
                            if (value) {
                                values.push(value);
                            }
                    }
                })();
            });

            // Run tasks on values
            if (rule.task && values.length) {
                values = this._runTasks(rule.task, values);
            }

            // No need to wrap single/empty values in an array
            if (values.length <= 1) {
                values = values.length == 1 ? values.pop() : null;
            }

            return values;
        }
    }, {
        key: '_runTasks',
        value: function _runTasks(tasks, values) {
            // Code handles multiple values
            if (typeof values == 'string') {
                values = [values];
            }

            // Rewrite different task formats to:
            // "task": [
            //     [ "foobar1", "arg1a", "arg1b" ],
            //     [ "foobar2", "arg2a", "arg2b" ]
            //  ]
            if (typeof tasks == 'string') {
                // "task": "foobar"
                tasks = [[tasks]];
            } else if (!Array.isArray(tasks[0])) {
                // "task": [ "foobar", "arg1", "arg2" ]
                tasks = [tasks];
            }

            // Run tasks and pipe result from one to the next
            var _iteratorNormalCompletion = true;
            var _didIteratorError = false;
            var _iteratorError = undefined;

            try {
                for (var _iterator = (0, _getIterator3.default)(tasks), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                    var task = _step.value;

                    var name = task[0];
                    if (parserTasks[name]) {
                        var args = task.slice(1);
                        var tmp = [];
                        var _iteratorNormalCompletion2 = true;
                        var _didIteratorError2 = false;
                        var _iteratorError2 = undefined;

                        try {
                            for (var _iterator2 = (0, _getIterator3.default)(values), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                                var value = _step2.value;

                                var res = parserTasks[name](args, value);
                                if (res) {
                                    tmp = tmp.concat(res);
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

                        values = tmp;
                        if (!values.length) {
                            break;
                        }
                    } else {
                        _log2.default.warn('[parser] Task doesn\'t exist: ' + name);
                    }
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

            if (values.length <= 1) {
                values = values.length == 1 ? values.pop() : null;
            }
            return values;
        }

        // Support custom tasks

    }, {
        key: 'html',
        get: function get() {
            return this._html;
        },
        set: function set(html) {
            this._load(html);
        }
    }], [{
        key: 'injectTasks',
        value: function injectTasks(customTasks) {
            for (var prop in customTasks) {
                if (parserTasks[prop]) {
                    _log2.default.warn('[parser] Overriding task: ' + prop);
                }
                parserTasks[prop] = customTasks[prop];
            }
        }
    }]);
    return _class;
}();

exports.default = _class;
//# sourceMappingURL=parser.js.map