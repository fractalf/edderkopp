'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var Tasks = function () {
    function Tasks() {
        (0, _classCallCheck3.default)(this, Tasks);
    }

    (0, _createClass3.default)(Tasks, [{
        key: 'inject',
        value: function inject(tasks) {
            for (var prop in tasks) {
                if (this[prop]) {
                    log.warn('[parser] Overriding task: ' + prop);
                }
                this[prop] = tasks[prop];
            }
        }

        // task: 'js'

    }, {
        key: 'js',
        value: function js(args, value) {
            return eval(value);
        }

        // task: 'json'

    }, {
        key: 'json',
        value: function json(args, value) {
            return JSON.parse(value);
        }

        // task: [ 'match', '\\/(\\w+)-(\\d+)' ] => returns value or null
        // task: [ 'match', '\\/(\\w+)-(\\d+)', 2 ] => returns matches[2] or null

    }, {
        key: 'match',
        value: function match(args, value) {
            var matches = value.match(new RegExp(args[0]));
            if (matches) {
                return args[1] === undefined ? value : matches[args[1]];
            } else {
                return null;
            }
        }

        // task: [ 'prepend',  'http://foo.bar/' ]

    }, {
        key: 'prepend',
        value: function prepend(args, value) {
            return args[0] + value;
        }

        // task: [ 'append',  '&foo=bar' ]

    }, {
        key: 'append',
        value: function append(args, value) {
            return value + args[0];
        }

        // task: [ 'split',  '&foo=bar' ]

    }, {
        key: 'split',
        value: function split(args, value) {
            return value.split(args[0]);
        }

        // Replace a with b in c supporting arrays
        // task: [ 'replace',  'foo', 'bar' ]
        // task: [ 'replace',  [ 'a', 'b' ],  [ 'c', 'e' ] ]
        // task: [ 'replace',  '[\\r\\n\\t\\s]+', '', 'regexp' ]

    }, {
        key: 'replace',
        value: function replace(args, value) {
            var s = args[0]; // search for
            var r = args[1]; // replace with
            var re = args[2]; // optional regexp
            if (typeof s == 'string' && typeof r == 'string') {
                s = [s];
                r = [r];
            }
            var pattern;
            for (var i = 0; i < s.length; i++) {
                pattern = re == 'regexp' ? new RegExp(s[i], 'g') : s[i];
                value = value.replace(pattern, r[i]);
            }
            return value;
        }

        // task: 'parseInt'

    }, {
        key: 'parseInt',
        value: function (_parseInt) {
            function parseInt(_x, _x2) {
                return _parseInt.apply(this, arguments);
            }

            parseInt.toString = function () {
                return _parseInt.toString();
            };

            return parseInt;
        }(function (args, value) {
            if (typeof value === 'number') {
                return value;
            }
            value = value ? value.replace(/[^\d]/g, '') : null;
            return value ? parseInt(value, 10) : null;
        })
    }]);
    return Tasks;
}();

var tasks = new Tasks();
exports.default = tasks;
//# sourceMappingURL=tasks.js.map