var cheerio = require('cheerio');
var $;
var URI = require('URIjs');
var he = require('he');
var crypto = require('crypto');
var log = require('./log');

//var _config;
var Parser = function() {}

Parser.prototype.init = function(options) {
    this._targets = options.targets;
    this._blacklist = options.blacklist;
    this._siteUri = new URI(options.url);
    this._cache = {};
    this._cacheFile = {};
}

Parser.prototype.load = function(html, config, url) {
    log.verbose('[Parser] Load html and inject config');
    $ = cheerio.load(html);
    _config = config;
}

Parser.prototype.getLinks = function() {
    log.verbose('[Parser] Get links');
    
    var links = [];
    var selector = 'a[rel!=nofollow]';
    var blacklist = this._blacklist;
    var siteUri = this._siteUri;
    var cache = this._cache;
    var cacheFile = this._cacheFile;
    
    if (blacklist.classes !== undefined) {
        selector += ':not(' + blacklist.classes.join(',') + ')';
    }
    
    $(selector).each(function() {
        var url = $(this).attr('href');
        
        // Skip links that has no href
        if (url === undefined || !url) {
            var outerHTML = $('<div>').append($(this)).html();
            log.debug('[Parser] No link: ' + outerHTML);
            return;
        }
        url = url.trim();
        log.silly('[Parser] Found url: ' + url);
        
        // Skip blacklisted paths
        if (blacklist.paths !== undefined) {
            for (var i = 0; i < blacklist.paths.length; i++) {
                if (url.indexOf(blacklist.paths[i]) !== -1) {
                    log.debug('[Parser] Skip ignored path (' + blacklist.paths[i] + '): ' + url);
                    return;
                }
            }
        }
        
        var uri = URI(url);
        
        // Prepend domain to relative path (Example: <a href="/page.html">)
        if (uri.is('relative')) {
            uri.protocol(siteUri.protocol()).hostname(siteUri.hostname());
        }
        
        // Skip external links
        if (uri.hostname() !== siteUri.hostname()) {
            log.debug('[Parser] Skip external link: ' + url);
            return;
        }
        
        // Skip media files
        if (uri.suffix().match(/jpg|jpeg|png|gif|bmp|svg|pdf/i) !== null) {
            log.debug('[Parser] Skip media file: ' + url);
            return;
        }

        // Remove anchor (Example: http://domain/page.html#anchor)
        uri.hash('');
        
        // Remove trailing slash (Example: http://domain/section/) -> important?
        
        url = uri.normalize().toString();
        log.silly('[Parser] Processed: ' + url);
        
        // Skip previously downloaded pages
        var md5 = crypto.createHash('md5').update(url).digest('hex');
        if (cache[md5] === undefined) {
            cache[md5] = true;
            log.silly('[Parser] Send to queue');
        } else {
            log.silly('[Parser] Already fetched');
            return;
        }
        
        // Skip previously downloaded filenames
        if (uri.filename()) {
            var md5file = crypto.createHash('md5').update(uri.filename()).digest('hex');
            if (cacheFile[md5file] === undefined) {
                cacheFile[md5file] = [ url ];
            } else {
                cacheFile[md5file].push(url);
                log.warn(cacheFile[md5file]);
                return;
            }
        }
        
        links.push(url);
    });

    if (links.length) {
        log.verbose('[Parser] ' + links.length + ' new links');
        return links;
    } else {
        log.verbose('[Parser] No new links');
        return false;
    }
    
}

Parser.prototype.getData = function(obj) {
    log.verbose('[Parser] Parse content of ' + obj.url);
    $ = cheerio.load(obj.html);
    obj.web = {};
    pageParser(null, obj.config.targets, obj.web);
    log.debug(obj.web);
    return obj;
}

function pageParser($container, targets, data, depth) {
    depth = depth || 1;
    var logPrefix = '[Parser] ' + Array(depth).join("    ") + '';
    log.silly(logPrefix + 'Depth: ' + depth);
    for (var i = 0; i < targets.length; i++) {
        var target = targets[i];

        // Support single and multiple elements. Ex: '.foobar' and ['.foo', '.bar']
        var elements = Array.isArray(target.elem) ? target.elem : [ target.elem ];
        
        var $elem;
        if (target.ifelse) {
            // Only use the first found element in array
            for (var l = 0; l < elements.length; l++) {
                $elem = $container !== null ? $(elements[l], $container) : $(elements[l]);
                if ($elem.length) { break; }
            }
        } else {
            $elem = $container !== null ? $(elements.join(','), $container) : $(elements.join(','));
        }
        
        var msg = target.type + ': ' + target.elem + (target.name ? ' (' + target.name + ')' : '');
        if ($elem.length === 0) {
            if (target.miss) {
                var $missing = $container !== null ? $(target.miss, $container) : $(target.miss);
                if ($missing.length) {
                    continue;
                }
            } else if (target.optional) {
                continue;
            }
            log.warn('[Parser] Couldn\'t find ' + msg);
            continue;
        }
        
        log.silly(logPrefix + 'Found ' + msg);
        var key = target.name;
        if (target.type == 'container') {
            if (!key) {
                pageParser($elem, target.children, data, depth + 1);
            } else if ($elem.length > 1) {
                log.silly(logPrefix + 'Name: ' + key);
                $elem.each(function() {
                    if (data[key] === undefined) {
                        data[key] = [];
                    }
                    var obj = {};
                    data[key].push(obj);
                    pageParser($(this), target.children, obj, depth + 1);
                });
            } else {
                data[key] = {};
                log.silly(logPrefix + 'Name: ' + key);
                pageParser($elem, target.children, data[key], depth + 1);
            }
        } else if (target.type == 'data') {
            // Get value(s) from the data attribute, a custom attribute or content of tag
            var values = [];
            $elem.each(function() {
                if (target.data) {
                    // Ex: <div data-a="value" data-b="value" data-c="value">
                    var data = Array.isArray(target.data) ? target.data : [ target.data ];
                    for (var j = 0; j < data.length; j++) {
                        values.push($(this).data(data[j]));
                    }
                } else if (target.attr) {
                    // Ex: <img src="value">, <a href="value">foo</a>
                    values.push($(this).attr(target.attr));
                } else if (target.text) {
                    // Ex: <div>value<span>skip this</span></div>
                    values.push($(this).contents().filter(function() { return this.nodeType == 3; } ).text()); // 3 = TEXT_NODE
                } else {
                    // Ex: <div><p>value 1</p><p>value 2</p></div>, <div>value</div>
                    var value = target.tags ? $(this).html() : $(this).text();
                    values.push(value.trim());
                }
            });
            
            // Run functions defined in config on found values
            if (target.func) {
                var functions = Array.isArray(target.func) ? target.func : [ target.func ];
                for (var j = 0; j < functions.length; j++) {
                    var name = functions[j].name;
                    var args = functions[j].args;
                    for (var k = 0; k < values.length; k++) {
                        var value = values[k];
                        values[k] = _functions[name](value, args);
                        log.silly(logPrefix + 'Run function: ' + name + (args ? ' (' + value + ', ' + JSON.stringify(args) + ')' : ''));
                    }
                }
            }
            
            // Store found and processed values in data structure
            if (values.length > 1) {
                // Support joining of values
                if (target.glue) {
                    log.silly(logPrefix + 'Glue: ' + values.length + ' items joined with "' + target.glue + '"');
                    values = values.join(target.glue);
                }
                data[key] = data[key] ? Array.concat(data[key], values) : values; // join values with same name
            } else if (values.length) {
                data[key] = data[key] ? values.concat(data[key]) : values.pop(); // join values with same name
            }
        }
    }
}

// Parse functions
var _functions = {
    regexp: function(value, args) {
        var matches = value.match(new RegExp(args[0]));
        if (matches) {
            return args[1] ? matches[args[1]] : matches;
        } else {
            return null;
        }
    },
    prepend: function(value, text) {
        return text + value;
    },
    append: function(value, text) {
        return value + text;
    },
    join: function(value, args) {
        var str = '';
        for (var i = 0; i < args.length; i++) {
            if (args[i].charAt(0) === '$') {
                if (Array.isArray(value)) {
                    var index = parseInt(args[i].substr(1));
                    str += value[index];
                }
                else {
                    str += value;
                }
            }
            else {
                str += args[i];
            }
        }
        return str;
    },
    replace: function(value, args) {
        // Check if pattern is a regex or string
        var pattern = args[2] && args[2] == 'regexp' ? new RegExp(args[0], 'g') : args[0];
        return value.replace(pattern, args[1]);
    },
    toInt: function(value) {
        return /^\d+$/.test(value) ? parseInt(value, 10) : false;
    },
    parsePrice: function(price, args) {
        // Example inputs: "kr 2.347,95", "969 NOK", "625 kr."
        price = price.replace(/[^\d,.]/g, ''); // strip everything except numbers, "," and "."
        var match = price.match(/^([\d,.]+)[.,](\d{2})$/); // split price on decimals if they exist
        if (match) {
            price = match[1].replace(/[,.]/g, ''); // strip "," and "." from the part before the decimals
            price = Math.round(price + '.' + match[2]); // add decimals and round
        } else {
            price = parseInt(price.replace(/[,.]/g, ''), 10); // strip "," and "." and convert to int
        }
        if (args && args.addVat) {
            price *= 1.25; // Add MVA/VAT
        }
        return price;
    },
    htmlEntitiesDecode: function(value) {
        return he.decode(value);
    }
}



module.exports = Parser;
