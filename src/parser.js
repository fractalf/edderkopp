import URI from 'urijs';
import cheerio from "cheerio";
import log from './log';
import * as tasks from './parser.tasks';

export default class {

    constructor(html) {
        this.$ = cheerio.load(html);
    }

    getData(rules) {
        return this._recParse(rules);
    }

    getLinks(skipClasses) {
        let $ = this.$;

        let links = [];

        // Build selector
        let selector = 'a[rel!=nofollow]';
        if (skipClasses) {
            selector += ':not(' + skipClasses.join(',') + ')';
        }

        // Find and handle elements
        $(selector).each((i, elem) => {
            let url = $(elem).attr('href');
            url = typeof url === 'string' ? url.trim() : false;
            if (url) {
                links.push(url);
            }
        });
        return links;
    }

    // Recursively parse DOM
    _recParse(rules, data, $container) {
        let $ = this.$;
        data = data || {};
        for (let i = 0; i < rules.length; i++) {
            const rule = rules[i];
            if (rule.name) {
                const $elem = rule.elem ? $(rule.elem, $container) : $container;
                if (rule.data == 'array') {
                    data[rule.name] = [];
                    $elem.each((i, e) => {
                        let obj = {};
                        data[rule.name].push(obj);
                        this._recParse(rule.kids, obj, $(e));
                    });
                } else if (rule.data == 'object') {
                    data[rule.name] = {};
                    this._recParse(rule.kids, data[rule.name], $elem);
                } else {
                    if ($elem.length > 0) {
                        const values = this._getContent($elem, rule);
                        // Join values with same name
                        data[rule.name] = data[rule.name] ? [].concat(data[rule.name], values) : values;
                    } else if (!rule.null){
                        log.warn('Element not found: ' + rule.elem);
                    }
                }
            } else if (rule.elem) {
                this._recParse(rule.kids, data, $(rule.elem, $container));
            }
        }
        return data;
    }

    // Get values
    _getContent($elem, rule) {
        let $ = this.$;
        let values = [];
        const dataType = Array.isArray(rule.data) ? rule.data[0] : rule.data;
        $elem.each(function() {
            switch (dataType) {
                case 'html':
                    // Get all content including tags
                    // Ex: <p>paragraph 1</p> <p>paragraph 2</p> <p>paragraph 3</p>
                    values.push($(this).html().trim());
                    break;
                case 'text':
                    // Get only text nodes
                    // Ex: <span>skip this</span> get this <span>skip this</span>
                    values.push($(this).contents().filter(function() {
                        return this.nodeType == 3; // 3 = TEXT_NODE
                    }).text().trim());
                    break;
                case 'attr':
                    // Get content from attribute
                    // Ex: <img src="value">, <a href="value">foo</a>
                    for (let i = 1; i < rule.data.length; i++) {
                        values.push($(this).attr(rule.data[i]));
                    }
                    break;
                case 'data':
                    // Get content from data
                    // Ex: <div data-img-a="value" data-img-b="value" data-img-c="value">
                    for (let i = 1; i < rule.data.length; i++) {
                        values.push($(this).data(rule.data[i]));
                    }
                    break;
                default:
                    // Get only text (strip away tags)
                    values.push($(this).text().trim());
            }
        });

        // Run tasks on values
        if (rule.task) {
            let task;
            if (typeof rule.task == 'string') {
                // "task": "foobar"
                task = [ [ rule.task ] ];
            } else if (!Array.isArray(rule.task[0])) {
                // "task": [ "foobar", "arg1", "arg2" ]
                task = [ rule.task ];
            } else {
                // "task": [
                //     [ "foobar1", "arg1", "arg2" ],
                //     [ "foobar2", "arg1", "arg2" ]
                //  ]
                task = rule.task;
            }
            for (let i = 0; i < task.length; i++) {
                for (let j = 0; j < values.length; j++) {
                    let name = task[i][0];
                    let args = task[i].slice(1);
                    if (tasks[name]) {
                        values[j] = tasks[name](args, values[j]);
                    } else {
                        log.warn('task not exist: ' + name);
                    }
                }
            }
        }

        if (values.length == 1) {
            values = values.pop();
        }

        return values;
    }

    // Support custom tasks
    static injectTasks(customTasks) {
        for (var prop in customTasks) {
            if (tasks[prop]) {
                log.warn('Overriding task: ' + prop);
            }
            tasks[prop] = customTasks[prop];
        }
    }
}
