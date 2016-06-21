import request from "request";

export default function(url, options) {
    if (options) {
        if (options.cookies) {
            let j = request.jar()
            for (let cookie of options.cookies) {
                j.setCookie(cookie, url);
            }
            options.jar = j;
            delete options.cookies;
        }
        if (options.timeout) {
            options.timeout *= 1000;
        }
    }

    const t0 = process.hrtime();
    options = Object.assign({
        url: url,
        headers: {
            'User-Agent': USER_AGENT
        },
        gzip: true,
        timeout: 60000
    }, options);
    return new Promise(function (fulfill, reject) {
        request(options, function (error, response, html) {
            if (error !== null) {
                reject(error);
            } else if (response.statusCode !== 200) {
                reject('Error! Response code: ' + response.statusCode);
            } else if (html){
                var diff = process.hrtime(t0);
                fulfill({
                    html,
                    headers: response.headers,
                    time: (diff[0] + diff[1] * 1e-9).toFixed(2) + ' s',
                    size: (response.socket.bytesRead / 1024).toFixed(2) + ' KB',
                    gzip: response.headers['content-encoding'] == 'gzip' ? true : false
                });
            } else {
                reject('This should not happen');
            }
        });
    });
}
