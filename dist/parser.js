'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _cheerio = require('cheerio');

var _cheerio2 = _interopRequireDefault(_cheerio);

var _log = require('./log');

var _log2 = _interopRequireDefault(_log);

var _tasks = require('./tasks');

var _tasks2 = _interopRequireDefault(_tasks);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var Parser = function () {
    function Parser() {
        (0, _classCallCheck3.default)(this, Parser);
    }

    (0, _createClass3.default)(Parser, null, [{
        key: 'find',
        value: function find(selector) {
            var $ = this._$;
            return !!$(selector).length;
        }
    }, {
        key: 'getLinks',
        value: function getLinks() {
            var link = arguments.length <= 0 || arguments[0] === undefined ? [{ elem: 'a' }] : arguments[0];
            var skip = arguments.length <= 1 || arguments[1] === undefined ? [] : arguments[1];

            var $ = this._$;
            var links = [];

            // Handle link
            if (!Array.isArray(link)) {
                link = [link];
            }

            // Handle skip
            skip.push('a[rel=nofollow]');

            var _loop = function _loop(i) {
                var l = link[i];
                // Convert "shortcut" for regexp match to proper task
                // link: [ '<regexp>', .. ]
                if (typeof l === 'string') {
                    l = { task: ['match', l] };
                }
                if (!l.elem) {
                    l.elem = 'a';
                }

                // Handle skip => add :not(<skip>) to selectors
                var selector = l.elem.split(',');
                for (var j = 0; j < selector.length; j++) {
                    selector[j] += ':not(' + skip.join(',') + ')';
                }
                selector = selector.join(',');

                // Find stuff
                $(selector).each(function (i, elem) {
                    // Skip if no href attribute
                    var href = $(elem).attr('href');
                    if (!href) {
                        return;
                    }

                    // Trim and run tasks
                    var url = href.trim();
                    if (url && l.task) {
                        url = _tasks2.default.run(l.task, url);
                    }
                    if (url) {
                        links = [].concat(links, url); // because url can be string or array..
                    }
                });
            };

            for (var i = 0; i < link.length; i++) {
                _loop(i);
            }

            return links;
        }
    }, {
        key: 'getData',
        value: function getData(rules) {
            return this._recParse(rules);
        }

        // Recursively parse DOM

    }, {
        key: '_recParse',
        value: function _recParse(rules, data, $container) {
            var _this = this;

            if (!Array.isArray(rules)) {
                rules = [rules];
            }
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
                                _this._recParse(rule.kids, obj, $(e));
                            });
                        } else if (rule.data == 'object') {
                            data[rule.name] = {};
                            _this._recParse(rule.kids, data[rule.name], $elem);
                        } else if (rule.data && rule.data[0] == 'constant') {
                            data[rule.name] = rule.data[1];
                        } else {
                            var values = _this._getContent($elem, rule);
                            if (values !== null || _this.includeNull) {
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
                var _this2 = this;

                (function () {
                    switch (dataType) {
                        case 'html':
                            // Get all content including tags
                            // Ex: <p>paragraph 1</p> <p>paragraph 2</p> <p>paragraph 3</p>
                            value = $(_this2).html().trim();
                            if (value) {
                                values.push(value);
                            }
                            break;
                        case 'text':
                            // Get only text nodes
                            // Ex: <span>skip this</span> get this <span>skip this</span>
                            var nodes = [];
                            $(_this2).contents().each(function (i, el) {
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
                                value = $(_this2).attr(rule.data[i]);
                                if (value) {
                                    values.push(value);
                                } else if (value === undefined) {
                                    _log2.default.warn('[parser] Attribute not found: ' + rule.data[i]);
                                }
                            }
                            break;
                        case 'data':
                            // Get content from data
                            // Ex: <div data-img-a="value" data-img-b="value" data-img-c="value">
                            for (var _i = 1; _i < rule.data.length; _i++) {
                                value = $(_this2).data(rule.data[_i]);
                                if (value) {
                                    values.push(value);
                                } else if (value === undefined) {
                                    _log2.default.warn('[parser] Data attribute not found: ' + rule.data[_i]);
                                }
                            }
                            break;
                        default:
                            // Get only text (strip away tags)
                            value = $(_this2).text().trim();
                            if (value) {
                                values.push(value);
                            }
                    }
                })();
            });

            // Run tasks on values
            if (rule.task && values.length) {
                values = _tasks2.default.run(rule.task, values);
            }

            return values;
        }
    }, {
        key: 'html',
        // Keep values=null in dataset

        get: function get() {
            return this._html;
        },
        set: function set(html) {
            this._html = html;
            this._$ = _cheerio2.default.load(html);
        }
    }]);
    return Parser;
}();

Parser.includeNull = true;
exports.default = Parser;
//# sourceMappingURL=parser.js.map