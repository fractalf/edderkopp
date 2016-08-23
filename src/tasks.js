export default class Tasks {

    static inject(tasks) {
        for (var prop in tasks) {
            if (this._tasks[prop]) {
                log.warn('[parser] Overriding task: ' + prop);
            }
            this._tasks[prop] = tasks[prop];
        }
    }

    static run(task, value, args) {
        return this._tasks[task](value, args);
    }

    static has(task) {
        return !!this._tasks[task];
    }

    // Default tasks
    static _tasks = {
        // task: [ 'js', '((v)=>{ return "custom"+v;})(value)' ]
        js: function(value, args) {
            return eval(args[0]);
        },

        // task: 'json'
        json: function(value) {
            return JSON.parse(value);
        },

        // task: [ 'match', '\\/(\\w+)-(\\d+)' ] => returns value or null
        // task: [ 'match', '\\/(\\w+)-(\\d+)', 2 ] => returns matches[2] or null
        match: function(value, args) {
            let matches = value.match(new RegExp(args[0]));
            if (matches) {
                return args[1] === undefined ? value : matches[args[1]];
            } else {
                return null;
            }
        },

        // task: [ 'prepend',  'http://foo.bar/' ]
        prepend: function(value, args) {
            return args[0] + value;
        },

        // task: [ 'append',  '&foo=bar' ]
        append: function(value, args) {
            return value + args[0];
        },

        // task: [ 'split',  '&foo=bar' ]
        split: function(value, args) {
            return value.split(args[0]);
        },

        // Replace a with b in c supporting arrays
        // task: [ 'replace',  'foo', 'bar' ]
        // task: [ 'replace',  [ 'a', 'b' ],  [ 'c', 'e' ] ]
        // task: [ 'replace',  '[\\r\\n\\t\\s]+', '', 'regexp' ]
        replace: function(value, args) {
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
        },

        // task: 'parseInt'
        parseInt: function(value) {
            if (typeof value === 'number') {
                return value;
            }
            value = value ? value.replace(/[^\d]/g, '') : null;
            return value ? parseInt(value, 10) : null;
        }

    }

}
