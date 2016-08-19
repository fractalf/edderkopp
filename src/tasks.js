class Tasks {

    inject(tasks) {
        for (var prop in tasks) {
            if (this[prop]) {
                log.warn('[parser] Overriding task: ' + prop);
            }
            this[prop] = tasks[prop];
        }
    }

    // task: 'js'
    js(args, value) {
        return eval(value);
    }

    // task: 'json'
    json(args, value) {
        return JSON.parse(value);
    }

    // task: [ 'match', '\\/(\\w+)-(\\d+)' ] => returns value or null
    // task: [ 'match', '\\/(\\w+)-(\\d+)', 2 ] => returns matches[2] or null
    match(args, value) {
        let matches = value.match(new RegExp(args[0]));
        if (matches) {
            return args[1] === undefined ? value : matches[args[1]];
        } else {
            return null;
        }
    }

    // task: [ 'prepend',  'http://foo.bar/' ]
    prepend(args, value) {
        return args[0] + value;
    }

    // task: [ 'append',  '&foo=bar' ]
    append(args, value) {
        return value + args[0];
    }

    // task: [ 'split',  '&foo=bar' ]
    split(args, value) {
        return value.split(args[0]);
    }

    // Replace a with b in c supporting arrays
    // task: [ 'replace',  'foo', 'bar' ]
    // task: [ 'replace',  [ 'a', 'b' ],  [ 'c', 'e' ] ]
    // task: [ 'replace',  '[\\r\\n\\t\\s]+', '', 'regexp' ]
    replace(args, value) {
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

    // task: 'parseInt'
    parseInt(args, value) {
        if (typeof value === 'number') {
            return value;
        }
        value = value ? value.replace(/[^\d]/g, '') : null;
        return value ? parseInt(value, 10) : null;
    }
}

const tasks = new Tasks();
export default tasks;
