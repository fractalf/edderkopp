var cheerio = require('cheerio');
var $;
var URI = require('URIjs');
var crypto = require('crypto');
var config = require('./config');
var log = require('./log');

var Parser = function(options) {
    this._targets = options.targets;
    this._blacklist = options.blacklist;
    this._siteUri = new URI(options.url);
    this._cache = {};
}

Parser.prototype.load = function(args) {
    log.verbose('[Parser] Load html from: ' + args.url);
    $ = cheerio.load(args.html);
}

Parser.prototype.isTarget = function() {
    if (!this._targets) {
        return false;
    }
    for (var i = 0; i < this._targets.length; i++) {
        if ($(this._targets[i].pageId.elem).length > 0) {
            log.verbose('[Parser] Found target');
            return true;
        }
    }
    return false;
}

Parser.prototype.getLinks = function() {
    log.verbose('[Parser] Get links');
    
    var links = [];
    var selector = 'a[rel!=nofollow]';
    var blacklist = this._blacklist;
    var siteUri = this._siteUri;
    var cache = this._cache;
    
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

Parser.prototype.getData = function() {
    log.verbose('[Parser] Get data');
    var data = {};
    for (var i = 0; i < this._targets.length; i++) {
        pageParser(null, this._targets[i].fetch, data);
    }
    return data;
}


// Private module functions

function pageParser($container, targets, data, depth) {
    depth = depth || 1;
    var logPrefix = '[Parser] ' + Array(depth).join("   ") + '> ';
    log.debug(logPrefix + 'Depth: ' + depth);
    for (var i = 0; i < targets.length; i++) {
        var target = targets[i];
        var $elem = $container !== null ? $(target.elem, $container) : $(target.elem);
        var key = target.name;
        if (target.type == 'container') {
            log.debug(logPrefix + 'Container element: ' + target.elem);
            if (!key) {
                pageParser($elem, target.children, data, depth + 1);
            } else if ($elem.length > 1) {
                log.debug(logPrefix + 'Name: ' + key);
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
                log.debug(logPrefix + 'Name: ' + key);
                pageParser($elem, target.children, data[key], depth + 1);
            }
        } else if (target.type == 'data') {
            log.debug(logPrefix + 'Data element: ' + target.elem);
            log.debug(logPrefix + 'Name: ' + key);
            var items = [];
            $elem.each(function() {
                var value;
                if (target.hasOwnProperty('attr')) {
                    value = $(this).attr(target.attr);
                } else {
                    if (target.regex) {
                        var matches = $(this).html().match(new RegExp(target.regex.pattern));
                        value = matches[target.regex.matchIndex];
                        log.debug(logPrefix + 'Regex: ' + target.regex.pattern + ', Match: ' + value);
                    } else {
                        value = $(this).text().trim();
                    }
                }
                if (target.functions) {
                    for (var i = 0; i < target.functions.length; i++) {
                        switch (target.functions[i]) {
                            case 'parsePrice':
                                log.debug(logPrefix + 'Run function: ' + target.functions[i] + '(' + value + ')');
                                value = parsePrice(value);
                                break;
                        }
                    }
                }
                items.push(value);
            });
            
            if (items.length > 1) {
                if (target.glue) {
                    log.debug(logPrefix + 'Glue: ' + items.length + ' items joined with "' + target.glue + '"');
                    items = items.join(target.glue);
                }
                data[key] = items;
            } else {
                data[key] = items.pop();
            }
        }
    }
}

function parsePrice(price) {
    var result = price;
    //price = price.replace(/<[^>]+>[^<]+<[^>]+>/ig,""); // strip extra tags
    result = result.replace(/[^\d,.]/g, ""); // strip everything except numbers, "," and "."
    result = result.replace(/,\d{2}$|,$/g, ""); // strip ending ",00" and ","
    result = result.replace(/,|\./g, ""); // strip "," and "."
    
    // Log if our algorithm doesn't work
    if (!/^\d+$/.test(result)) {
        log.warning('[Parser] parcePrice failed on: "' + price + '"')
    }
    return parseInt(result, 10);
}

module.exports = Parser;
