export {
    _match as match,
    _prepend as prepend,
    _append as append,
    _split as split,
    _replace as replace,
    _parseInt as parseInt
};

// 'task': [ 'match', '\\/(\\w+)-(\\d+)', 2 ]
function _match(args, value) {
    var matches = value.match(new RegExp(args[0]));
    if (matches) {
        return args[1] ? matches[args[1]] : matches[1];
    } else {
        return null;
    }
}

// 'task': [ 'prepend',  'http://foo.bar/' ]
function _prepend(args, value) {
    return args[0] + value;
}

// 'task': [ 'append',  '&foo=bar' ]
function _append(args, value) {
    return value + args[0];
}

// 'task': [ 'split',  '&foo=bar' ]
function _split(args, value) {
    return value.split(args[0]);
}

// Replace a with b in c supporting arrays
// 'task': [ 'replace',  'foo', 'bar' ]
// 'task': [ 'replace',  [ 'a', 'b' ],  [ 'c', 'e' ] ]
// 'task': [ 'replace',  '[\\r\\n\\t\\s]+', '', 'regexp' ]
function _replace(args, value) {
    let s = args[0]; // search for
    let r = args[1]; // replace with
    let re = args[2]; // optional regexp
    if (typeof s == 'string' && typeof r == 'string') {
        s = [ s ];
        r = [ r ];
    }
    var pattern;
    for (let i = 0; i < s.length; i++) {
        pattern = re == 'regexp' ? new RegExp(s[i], 'g') : s[i];
        value = value.replace(pattern, r[i]);
    }
    return value;
}

// 'task': [ 'parseInt' ]
function _parseInt(args, value) {
    if (typeof value === 'number') {
        return value;
    }
    value = value ? value.replace(/[^\d]/g, '') : null;
    return value ? parseInt(value, 10) : null;
}
