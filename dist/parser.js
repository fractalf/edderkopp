'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _urijs = require('urijs');

var _urijs2 = _interopRequireDefault(_urijs);

var _cheerio = require('cheerio');

var _cheerio2 = _interopRequireDefault(_cheerio);

var _log = require('./log');

var _log2 = _interopRequireDefault(_log);

var _parserTasks = require('./parser-tasks');

var tasks = _interopRequireWildcard(_parserTasks);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

// Parser

var _class = function () {
    function _class(html) {
        _classCallCheck(this, _class);

        this.$ = _cheerio2.default.load(html);
    }

    _createClass(_class, [{
        key: 'getData',
        value: function getData(rules) {
            return this._recParse(rules);
        }
    }, {
        key: 'getLinks',
        value: function getLinks(skipClasses) {
            var $ = this.$;

            var links = [];

            // Build selector
            var selector = 'a[rel!=nofollow]';
            if (skipClasses) {
                selector += ':not(' + skipClasses.join(',') + ')';
            }

            // Find and handle elements
            $(selector).each(function (i, elem) {
                var url = $(elem).attr('href');
                url = typeof url === 'string' ? url.trim() : false;
                if (url) {
                    links.push(url);
                }
            });
            return links;
        }

        // Recursively parse DOM

    }, {
        key: '_recParse',
        value: function _recParse(rules, data, $container) {
            var _this = this;

            var $ = this.$;
            data = data || {};

            var _loop = function _loop(i) {
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
                                _this._recParse(rule.kids, obj, $(e));
                            });
                        } else if (rule.data == 'object') {
                            data[rule.name] = {};
                            _this._recParse(rule.kids, data[rule.name], $elem);
                        } else {
                            var values = _this._getContent($elem, rule);
                            if (values !== null) {
                                // Join values with same name
                                data[rule.name] = data[rule.name] ? [].concat(data[rule.name], values) : values;
                            }
                        }
                    } else if (!optional) {
                        _log2.default.warn('[parser] Element not found: ' + rule.elem);
                    }
                } else if (rule.elem) {
                    _this._recParse(rule.kids, data, $(rule.elem, $container));
                }
            };

            for (var i = 0; i < rules.length; i++) {
                _loop(i);
            }
            return data;
        }

        // Get values

    }, {
        key: '_getContent',
        value: function _getContent($elem, rule) {
            var $ = this.$;
            var values = [];
            var dataType = Array.isArray(rule.data) ? rule.data[0] : rule.data;
            $elem.each(function () {
                switch (dataType) {
                    case 'html':
                        // Get all content including tags
                        // Ex: <p>paragraph 1</p> <p>paragraph 2</p> <p>paragraph 3</p>
                        values.push($(this).html().trim());
                        break;
                    case 'text':
                        // Get only text nodes
                        // Ex: <span>skip this</span> get this <span>skip this</span>
                        var nodes = [];
                        $(this).contents().each(function (i, el) {
                            if (el.nodeType == 3) {
                                // 3 = TEXT_NODE
                                var value = el.data.trim();
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
                            var attr = $(this).attr(rule.data[i]);
                            if (attr) {
                                values.push(attr);
                            } else {
                                _log2.default.warn('[parser] Attribute not found: ' + rule.data[i]);
                            }
                        }
                        break;
                    case 'data':
                        // Get content from data
                        // Ex: <div data-img-a="value" data-img-b="value" data-img-c="value">
                        for (var _i = 1; _i < rule.data.length; _i++) {
                            var data = $(this).data(rule.data[_i]);
                            if (data) {
                                values.push(data);
                            } else {
                                _log2.default.warn('[parser] Data attribute not found: ' + rule.data[_i]);
                            }
                        }
                        break;
                    default:
                        // Get only text (strip away tags)
                        values.push($(this).text().trim());
                }
            });

            // Run tasks on values
            if (rule.task) {
                var task = void 0;
                if (typeof rule.task == 'string') {
                    // "task": "foobar"
                    task = [[rule.task]];
                } else if (!Array.isArray(rule.task[0])) {
                    // "task": [ "foobar", "arg1", "arg2" ]
                    task = [rule.task];
                } else {
                    // "task": [
                    //     [ "foobar1", "arg1", "arg2" ],
                    //     [ "foobar2", "arg1", "arg2" ]
                    //  ]
                    task = rule.task;
                }

                var _iteratorNormalCompletion = true;
                var _didIteratorError = false;
                var _iteratorError = undefined;

                try {
                    for (var _iterator = task[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                        var t = _step.value;

                        var name = t[0];
                        if (tasks[name]) {
                            var args = t.slice(1);
                            var tmp = [];
                            var _iteratorNormalCompletion2 = true;
                            var _didIteratorError2 = false;
                            var _iteratorError2 = undefined;

                            try {
                                for (var _iterator2 = values[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                                    var value = _step2.value;

                                    var res = tasks[name](args, value);
                                    if (Array.isArray(res)) {
                                        tmp = tmp.concat(res);
                                    } else if (res) {
                                        tmp.push(res);
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
            }

            // No need to wrap single/empty values in an array
            if (values.length <= 1) {
                values = values.length == 1 ? values.pop() : null;
            }

            return values;
        }

        // Support custom tasks

    }], [{
        key: 'injectTasks',
        value: function injectTasks(customTasks) {
            for (var prop in customTasks) {
                if (tasks[prop]) {
                    _log2.default.warn('[parser] Overriding task: ' + prop);
                }
                tasks[prop] = customTasks[prop];
            }
        }
    }]);

    return _class;
}();

exports.default = _class;