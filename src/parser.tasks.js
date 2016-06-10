export {
    match,
    prepend,
    append,
    join,
    replace,
    parseInt
};

// "task": [ "match", "\\/(\\d+)\\.", 1 ]
function match(args, value) {
    var matches = value.match(new RegExp(args[0]));
    if (matches) {
        return args[1] ? matches[args[1]] : matches;
    } else {
        return null;
    }
}

// "task": [ "prepend",  "http://foo.bar/" ]
function prepend(args, value) {
    return args[0] + value;
}

// "task": [ "append",  "&foo=bar" ]
function append(args, value) {
    return value + args[0];
}

// "task": [ "join", "http://foo.bar/", "$1" ]
// "task": [ "join", "$1", "$3", "(foobar)", "$2" ]
function join(args, value) {
    var str = '';
    for (var i = 0; i < args.length; i++) {
        if (args[i].charAt(0) === '$') {
            str += value[args[i].substr(1)];
        } else {
            str += args[i];
        }
    }
    return str;
}

// "task": [ "replace",  "foo", "bar" ]
// "task": [ "replace",  "[\\r\\n\\t\\s]+", "", "regexp" ]
function replace(args, value) {
    if (typeof args[0] == 'string' && typeof args[1] == 'string') {
        args[0] = [ args[0] ];
        args[1] = [ args[1] ];
    }
    var pattern;
    for (var i = 0; i < args[0].length; i++) {
        pattern = args[2] && args[2] == 'regexp' ? new RegExp(args[0][i], 'g') : args[0][i];
        value = value.replace(pattern, args[1][i]);
    }
    return value;
}

// "task": [ "parseInt" ]
function parseInt(args, value) {
    value = value ? value.replace(/[^\d]/g, '') : null;
    return value ? parseInt(value, 10) : null;
}
