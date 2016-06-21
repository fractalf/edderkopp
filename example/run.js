#!/usr/bin/env node
'use strict';

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _dist = require('../dist');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var log = _dist.logger.logConsole;
log.activate('debug');

var conf = _dist.config.get(__dirname + '/site.json');
var html = _fs2.default.readFileSync(__dirname + '/site.html').toString();
var parser = new _dist.Parser(html);
var data = parser.getData(conf.pages.somePage);
log.info(data);

// const config = new Config();
// const rules = config.get('site.json');

// const options = {
//     skip: rules.crawl.skip,
//     save: 'elastic'
// }
// const crawler = new Crawler(options);
// crawler.start(rules.url).then( (res) => {
//     log.info(res);
// }).catch((e) => {
//     log.error(e);
// });
//

/*
var rules = config.get('komplett-1.json');
var html = fs.readFileSync(__dirname + '/../tmp/komplett.html').toString();
var parser = new Parser();
var data = parser.getData(html, rules.pages.product);
log.info(data);
*/

/*

function start() {

    return new Promise(function(fulfill, reject) {

        getDocs()
        .then((docs) => {
            console.log('res getDocs:');
            console.log(docs);

            // save docs somewhere and exctact urls
            var urls = docs; // cheat..
            // return Promise.resolve('Hm');
            return downAll(urls)
            .catch(function(error) {
                console.log('wtf');
                console.log(error);
            });
        })
        .then((pages) => {
            console.log('res downAll:');
            console.log(pages);

            // parse data
            // compare
            // prepare docs
            //
            return save();

        })
        .then(() => {
            console.log('save done');
            fulfill('all done');
        })
        .catch(function(error) {
            console.log('Error start() level!');
            console.log(error);
        });

    })
    .catch(function(error) {
        console.log('wtf');
        console.log(error);
    });

}

// Get docs
function getDocs() {
    return new Promise(function(fulfill, reject) {
        query((res) => {
            fulfill(res);
        });
    });
}

// Download
function downAll(urls) {
    // var pages = [];
    return Promise.all(urls.map(function(u) {
        return new Promise(function(fulfill, reject) {
            download(u.url)
            // down(u)
            .then((res) => {
                // var page = { id: u.id, html: html };
                fulfill(res);
            })
            .catch(function(error) {
                log.error(error);
                fulfill(null);
            });
        });
        // return down(u);
    }))
    // .catch(function(error) {
    // console.log('wtf1');
    // console.log(error);
    // });
}


function query(cb) {
    console.log('run query');
    setTimeout(() => {
        console.log('run query done');
        cb([
            { id: 1, doc: 'doc1'},
            { id: 2, doc: 'doc2'},
            { id: 3, doc: 'doc3'}
        ]);
    }, Math.random() * 3000|0);
}

function save() {
    console.log('run save');
    return new Promise(function(fulfill, reject) {
        setTimeout(() => {
            console.log('save done');
            fulfill();
        }, Math.random() * 3000|0);
    });
}

function down(u) {
    console.log('dl: ' + u.id);
    return new Promise(function(fulfill, reject) {
        setTimeout(() => {
            if (u.id == 1) {
                reject('BAD download');
            } else {
                console.log('dl done: ' + u.id);
                fulfill('<html>');
            }
        }, Math.random() * 3000|0);
    });

}
*/
