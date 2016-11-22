import log from './log';

export default class Tasks {

    static inject(tasks) {
        for (var prop in tasks) {
            if (this._tasks[prop]) {
                log.warn('[parser] Overriding task: ' + prop);
            }
            this._tasks[prop] = tasks[prop];
        }
    }

    // Run task(s) on value(s)
    static run(tasks, values) {
        // Support one or more tasks
        // a) "task": "foobar"
        // b) "task": [ "foobar", "arg1", "arg2" ]
        // c) "task": [
        //     [ "foobar1", "arg1a", "arg1b" ],
        //     [ "foobar2", "arg2a", "arg2b" ]
        //   ]
        // Rewrite a) and b) to c)
        if (typeof tasks == 'string') { // a
            tasks = [ [ tasks ] ];
        } else if (!Array.isArray(tasks[0])) { // b
            tasks = [ tasks ];
        }

        // Support one or more values
        if (typeof values == 'string') {
            values = [ values ];
        }

        // Run tasks and pipe result from one to the next unless !!<result> === false
        for (let task of tasks) {
            let name = task[0];
            if (!!this._tasks[name]) {
                let args = task.slice(1);
                let tmp = [];
                for (let value of values) {
                    let res = this._tasks[name](value, args);
                    if (res) {
                        tmp = tmp.concat(res);
                    }
                }
                values = tmp;
                if (!values.length) {
                    break;
                }
            } else {
                log.warn('[tasks] Task doesn\'t exist: ' + name);
            }
        }

        // No need to wrap single/empty values in an array
        if (values.length <= 1) {
            values = values.length == 1 ? values.pop() : null;
        }

        return values;
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

        // task: [ 'insert',  'http://foo.com/{value}/bar' ]
        insert: function(value, args) {
            return args[0].replace(/\{.+\}/, value);
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
        },

        // task: 'urldecode'
        urldecode: function(value) {
            return decodeURIComponent(value);
        }
    }

}
