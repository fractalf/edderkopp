import cheerio from "cheerio";
import log from './log';
import Tasks from './tasks';

// Parser
export default class {

    static includeNull = true; // Keep values=null in dataset

    static get html() {
        return this._html;
    }

    static set html(html) {
        this._html = html;
        this._$ = cheerio.load(html);
    }

    static find(selector) {
        let $ = this._$;
        return !!$(selector).length
    }

    static getLinks(link = [ { elem: 'a' } ], skip = []) {
        let $ = this._$;
        let links = [];

        // Handle link
        if (!Array.isArray(link)) {
            link = [ link ];
        }

        // Handle skip
        skip.push('a[rel=nofollow]');

        for (let i = 0; i < link.length; i++) {
            let l = link[i];
            // Convert "shortcut" for regexp match to proper task
            // link: [ '<regexp>', .. ]
            if (typeof l === 'string') {
                l = { task: [ 'match', l ] };
            }
            if (!l.elem) {
                l.elem = 'a';
            }

            // Handle skip => add :not(<skip>) to selectors
            let selector =  l.elem.split(',');
            for (let j = 0; j < selector.length; j++) {
                selector[j] += ':not(' + skip.join(',') + ')';
            }
            selector = selector.join(',');

            // Find stuff
            $(selector).each((i, elem) => {
                // Skip if no href attribute
                let href = $(elem).attr('href');
                if (!href) {
                    return;
                }

                // Trim and run tasks
                let url = href.trim();
                if (url && l.task) {
                    url = this._runTasks(l.task, url);
                }
                if (url) {
                    links = [].concat(links, url); // because url can be string or array..
                }
            });

        }

        return links;
    }

    static getData(rules) {
        return this._recParse(rules);
    }

    // Recursively parse DOM
    static _recParse(rules, data, $container) {
        let $ = this._$;
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
                    } else if (rule.data && rule.data[0] == 'constant') {
                        data[rule.name] = rule.data[1];
                    } else {
                        const values = this._getContent($elem, rule);
                        if (values !== null || this.includeNull) {
                            // Join values with same name
                            data[rule.name] = data[rule.name] ? [].concat(data[rule.name], values) : values;
                        }
                    }
                } else if (!optional) {
                    log.warn('[parser] Element not found: ' + rule.elem);
                }
            } else if (rule.elem) {
                this._recParse(rule.kids, data, $(rule.elem, $container));
            }
        }
        return data;
    }

    // Get values
    static _getContent($elem, rule) {
        let $ = this._$;
        let value, values = [];
        const dataType = Array.isArray(rule.data) ? rule.data[0] : rule.data;
        $elem.each(function() {
            switch (dataType) {
                case 'html':
                    // Get all content including tags
                    // Ex: <p>paragraph 1</p> <p>paragraph 2</p> <p>paragraph 3</p>
                    value = $(this).html().trim();
                    if (value) {
                        values.push(value);
                    }
                    break;
                case 'text':
                    // Get only text nodes
                    // Ex: <span>skip this</span> get this <span>skip this</span>
                    let nodes = [];
                    $(this).contents().each((i, el) => {
                        if (el.nodeType == 3) { // 3 = TEXT_NODE
                            value = el.data.trim();
                            if (value) {
                                nodes.push(el.data.trim());
                            }
                        }
                    });
                    const index = typeof rule.data !== 'string' ? rule.data[1] : false;
                    if (index !== false) {
                        values.push(nodes[index]);
                    } else {
                        values = [].concat(values, nodes);
                    }
                    break;
                case 'attr':
                    // Get content from attribute
                    // Ex: <img src="value">, <a href="value">foo</a>
                    for (let i = 1; i < rule.data.length; i++) {
                        value = $(this).attr(rule.data[i]);
                        if (value) {
                            values.push(value);
                        } else {
                            log.warn('[parser] Attribute not found: ' + rule.data[i]);
                        }
                    }
                    break;
                case 'data':
                    // Get content from data
                    // Ex: <div data-img-a="value" data-img-b="value" data-img-c="value">
                    for (let i = 1; i < rule.data.length; i++) {
                        value = $(this).data(rule.data[i]);
                        if (value) {
                            values.push(value);
                        } else {
                            log.warn('[parser] Data attribute not found: ' + rule.data[i]);
                        }
                    }
                    break;
                default:
                    // Get only text (strip away tags)
                    value = $(this).text().trim();
                    if (value) {
                        values.push(value);
                    }
            }
        });

        // Run tasks on values
        if (rule.task && values.length) {
            values = this._runTasks(rule.task, values);
        }

        // No need to wrap single/empty values in an array
        if (values && values.length <= 1) {
            values = values.length == 1 ? values.pop() : null;
        }

        return values;
    }

    static _runTasks(tasks, values) {
        // Code handles multiple values
        if (typeof values == 'string') {
            values = [ values ];
        }

        // Rewrite different task formats to:
        // "task": [
        //     [ "foobar1", "arg1a", "arg1b" ],
        //     [ "foobar2", "arg2a", "arg2b" ]
        //  ]
        if (typeof tasks == 'string') { // "task": "foobar"
            tasks = [ [ tasks ] ];
        } else if (!Array.isArray(tasks[0])) { // "task": [ "foobar", "arg1", "arg2" ]
            tasks = [ tasks ];
        }

        // Run tasks and pipe result from one to the next
        for (let task of tasks) {
            let name = task[0];
            if (Tasks.has(name)) {
                let args = task.slice(1);
                let tmp = [];
                for (let value of values) {
                    let res = Tasks.run(name, value, args);
                    if (res) {
                        tmp = tmp.concat(res);
                    }
                }
                values = tmp;
                if (!values.length) {
                    break;
                }
            } else {
                log.warn('[parser] Task doesn\'t exist: ' + name);
            }
        }
        if (values.length <= 1) {
            values = values.length == 1 ? values.pop() : null;
        }
        return values;
    }
}
