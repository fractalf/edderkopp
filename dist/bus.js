'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _getPrototypeOf = require('babel-runtime/core-js/object/get-prototype-of');

var _getPrototypeOf2 = _interopRequireDefault(_getPrototypeOf);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _possibleConstructorReturn2 = require('babel-runtime/helpers/possibleConstructorReturn');

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _inherits2 = require('babel-runtime/helpers/inherits');

var _inherits3 = _interopRequireDefault(_inherits2);

exports.warn = warn;

var _events = require('events');

var _events2 = _interopRequireDefault(_events);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var Bus = function (_EventEmitter) {
    (0, _inherits3.default)(Bus, _EventEmitter);

    function Bus() {
        (0, _classCallCheck3.default)(this, Bus);
        return (0, _possibleConstructorReturn3.default)(this, (0, _getPrototypeOf2.default)(Bus).apply(this, arguments));
    }

    return Bus;
}(_events2.default);

var bus = new Bus();

exports.default = bus;
function warn(message) {
    bus.emit('log', 'warn', message);
}
//# sourceMappingURL=bus.js.map