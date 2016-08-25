'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _getIterator2 = require('babel-runtime/core-js/get-iterator');

var _getIterator3 = _interopRequireDefault(_getIterator2);

var _isInteger = require('babel-runtime/core-js/number/is-integer');

var _isInteger2 = _interopRequireDefault(_isInteger);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _url = require('url');

var _url2 = _interopRequireDefault(_url);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var Config = function () {
    function Config() {
        (0, _classCallCheck3.default)(this, Config);
        this._cache = {};

        this._dir = process.env.NODE_CONFIG_DIR || process.cwd() + '/config';
    }

    // Set config dir


    (0, _createClass3.default)(Config, [{
        key: 'get',


        // Get config
        value: function get(arg) {
            if (!this._cache[arg]) {
                if ((0, _isInteger2.default)(arg)) {
                    // support id in filename (ex: configfile-<id>.js)
                    this._cache[arg] = this._getById(arg);
                } else if (arg.indexOf('http') !== -1) {
                    // support url (will look for the url property in all config files)
                    this._cache[arg] = this._getByUrl(arg);
                } else if (arg.indexOf('/') !== -1) {
                    // support full path of file (ex: /home/user/config.js)
                    this._cache[arg] = this._parse(arg);
                } else {
                    // support recursive search for config file in dir. return first found (ex: configfile.js)
                    this._cache[arg] = this._getByFile(arg);
                }
            }
            return this._cache[arg];
        }

        // Get config by id. Match id with all files found in _getFiles

    }, {
        key: '_getById',
        value: function _getById(id) {
            this._init();
            var _iteratorNormalCompletion = true;
            var _didIteratorError = false;
            var _iteratorError = undefined;

            try {
                for (var _iterator = (0, _getIterator3.default)(this._files), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                    var file = _step.value;

                    var match = file.match(/-(\d+)\./);
                    if (match && match[1] == id) {
                        return this._parse(file);
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

            return false;
        }

        // Get config by filename. Match file with all files found in _getFiles

    }, {
        key: '_getByFile',
        value: function _getByFile(file) {
            this._init();
            var _iteratorNormalCompletion2 = true;
            var _didIteratorError2 = false;
            var _iteratorError2 = undefined;

            try {
                for (var _iterator2 = (0, _getIterator3.default)(this._files), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                    var f = _step2.value;

                    if (f.indexOf(file) > -1) {
                        return this._parse(f);
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

            return false;
        }

        // Get config by url. Open all files found in _getFiles and look at the url property

    }, {
        key: '_getByUrl',
        value: function _getByUrl(url) {
            this._init();
            var hostname = _url2.default.parse(url).hostname;
            var _iteratorNormalCompletion3 = true;
            var _didIteratorError3 = false;
            var _iteratorError3 = undefined;

            try {
                for (var _iterator3 = (0, _getIterator3.default)(this._files), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
                    var file = _step3.value;

                    var _config = this._parse(file);
                    if (_config.url && hostname == _url2.default.parse(_config.url).hostname) {
                        return _config;
                    }
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

            return false;
        }

        // Get filenames

    }, {
        key: '_init',
        value: function _init() {
            if (!this._files) {
                this._files = this._getFiles(this._dir);
            }
        }

        // Open and parse file

    }, {
        key: '_parse',
        value: function _parse(file) {
            var match = file.match(/.*\.([^.]*)$/);
            if (match[1] == 'json') {
                return JSON.parse(_fs2.default.readFileSync(file).toString());
            } else if (match[1] == 'js') {
                return require(file);
            }
        }

        // Recursivly find all filenames

    }, {
        key: '_getFiles',
        value: function _getFiles(dir) {
            var files = [];
            var _iteratorNormalCompletion4 = true;
            var _didIteratorError4 = false;
            var _iteratorError4 = undefined;

            try {
                for (var _iterator4 = (0, _getIterator3.default)(_fs2.default.readdirSync(dir)), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
                    var file = _step4.value;

                    if (_fs2.default.statSync(dir + '/' + file).isDirectory()) {
                        files = files.concat(this._getFiles(dir + '/' + file));
                    } else {
                        files.push(dir + '/' + file);
                    }
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

            ;
            return files;
        }
    }, {
        key: 'dir',
        set: function set(dir) {
            this._dir = dir;
        }
    }]);
    return Config;
}();

var config = new Config();
exports.default = config;
//# sourceMappingURL=config.js.map