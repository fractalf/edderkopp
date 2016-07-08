import URI from 'urijs';
import cheerio from "cheerio";
import log from './log';
import * as tasks from './parser-tasks';

// Parser
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
                // const $elem = rule.elem ? $(rule.elem, $container) : $container;
                let $elem, optional = false;
                if (rule.elem) {
                    if (Array.isArray(rule.elem)) {
                        $elem = $(rule.elem[0], $container);
                        optional = rule.elem[1] == 'optional';
                    } else {
                        $elem = $(rule.elem, $container);
                    }
                } else {
                    $elem = $container;
                }
                if ($elem.length > 0) {
                    if (rule.data == 'array') {
                        data[rule.name] = data[rule.name] || [];
                        $elem.each((i, e) => {
                            let obj = {};
                            data[rule.name].push(obj);
                            this._recParse(rule.kids, obj, $(e));
                        });
                    } else if (rule.data == 'object') {
                        data[rule.name] = {};
                        this._recParse(rule.kids, data[rule.name], $elem);
                    } else {
                        const values = this._getContent($elem, rule);
                        // Join values with same name
                        data[rule.name] = data[rule.name] ? [].concat(data[rule.name], values) : values;
                    }
                } else if (!optional){
                    log.warn('[parser] Element not found: ' + rule.elem);
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
                        let attr = $(this).attr(rule.data[i]);
                        if (attr) {
                            values.push(attr);
                        } else {
                            log.warn('[parser] Attribute not found: ' + rule.data[i]);
                        }
                    }
                    break;
                case 'data':
                    // Get content from data
                    // Ex: <div data-img-a="value" data-img-b="value" data-img-c="value">
                    for (let i = 1; i < rule.data.length; i++) {
                        let data = $(this).data(rule.data[i]);
                        if (data) {
                            values.push(data);
                        } else {
                            log.warn('[parser] Data attribute not found: ' + rule.data[i]);
                        }
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

            for (let t of task) {
                let name = t[0];
                if (tasks[name]) {
                    let args = t.slice(1);
                    let tmp = [];
                    for (let value of values) {
                        let res = tasks[name](args, value);
                        if (Array.isArray(res)) {
                            tmp = tmp.concat(res);
                        } else if (res) {
                            tmp.push(res);
                        }
                    }
                    values = tmp;
                } else {
                    log.warn('[parser] Task doesn\'t exist: ' + name);
                }
            }
        }

        // No need to wrap single/empty values in an array
        if (values.length <= 1) {
            values = values.length == 1 ? values.pop() : null;
        }

        return values;
    }

    // Support custom tasks
    static injectTasks(customTasks) {
        for (var prop in customTasks) {
            if (tasks[prop]) {
                log.warn('[parser] Overriding task: ' + prop);
            }
            tasks[prop] = customTasks[prop];
        }
    }
}
