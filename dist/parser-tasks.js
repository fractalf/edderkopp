'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.js = _js;
exports.json = _json;
exports.match = _match;
exports.prepend = _prepend;
exports.append = _append;
exports.split = _split;
exports.replace = _replace;
exports.parseInt = _parseInt;

// task: 'js'

function _js(args, value) {
    return eval(value);
}

// task: 'json'
function _json(args, value) {
    return JSON.parse(value);
}

// task: [ 'match', '\\/(\\w+)-(\\d+)' ] => returns value or null
// task: [ 'match', '\\/(\\w+)-(\\d+)', 2 ] => returns matches[2] or null
function _match(args, value) {
    var matches = value.match(new RegExp(args[0]));
    if (matches) {
        return args[1] === undefined ? value : matches[args[1]];
    } else {
        return null;
    }
}

// task: [ 'prepend',  'http://foo.bar/' ]
function _prepend(args, value) {
    return args[0] + value;
}

// task: [ 'append',  '&foo=bar' ]
function _append(args, value) {
    return value + args[0];
}

// task: [ 'split',  '&foo=bar' ]
function _split(args, value) {
    return value.split(args[0]);
}

// Replace a with b in c supporting arrays
// task: [ 'replace',  'foo', 'bar' ]
// task: [ 'replace',  [ 'a', 'b' ],  [ 'c', 'e' ] ]
// task: [ 'replace',  '[\\r\\n\\t\\s]+', '', 'regexp' ]
function _replace(args, value) {
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
function _parseInt(args, value) {
    if (typeof value === 'number') {
        return value;
    }
    value = value ? value.replace(/[^\d]/g, '') : null;
    return value ? parseInt(value, 10) : null;
}
//# sourceMappingURL=parser-tasks.js.map