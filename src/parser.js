import cheerio from "cheerio";
import { warn } from './bus';
import Tasks from './tasks';

const prefix = '[parser] ';

export default class Parser {

    includeNull = true; // keep properties with value null in dataset
    _$; // cheerio

    constructor(html) {
        this._html = html;
        this._$ = cheerio.load(html);
    }

    get html() {
        return this._html;
    }

    has(selector) {
        const $ = this._$;
        return !!$(selector).length
    }

    data(rules) {
        return this._recParse(rules);
    }

    links(link = [ { elem: 'a' } ], skip = []) {
        const $ = this._$;
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
                    url = Tasks.run(l.task, url);
                }
                if (url) {
                    links = [].concat(links, url); // because url can be string or array..
                }
            });

        }

        return links;
    }

    // Recursively parse DOM
    _recParse(rules, data, $container) {
        if (!Array.isArray(rules)) {
            rules = [ rules ];
        }
        const $ = this._$;
        data = data || {};
        for (let i = 0; i < rules.length; i++) {
            const rule = rules[i];
            if (rule.name) {
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
                    warn(prefix + 'Element not found: ' + rule.elem);
                }
            } else if (rule.elem) {
                this._recParse(rule.kids, data, $(rule.elem, $container));
            }
        }
        return data;
    }

    // Get values
    _getContent($elem, rule) {
        const $ = this._$;
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
                        } else if (value === undefined && rule.elem[1] !== 'optional') {
                            warn(prefix + 'Attribute not found: ' + rule.data[i]);
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
                        } else if (value === undefined && rule.elem[1] !== 'optional') {
                            warn(prefix + 'Data attribute not found: ' + rule.data[i]);
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
            values = Tasks.run(rule.task, values);
        }

        // No need to wrap single/empty values in an array
        if (Array.isArray(values) && values.length <= 1) {
            values = values.length == 1 ? values.pop() : null;
        }

        return values;
    }

}
