import request from "request";

export default function(url, timeout) {
    timeout = timeout ? timeout * 1000 : 60000;
    const t0 = process.hrtime();
    const options = {
        url: url,
        headers: {
            'User-Agent': USER_AGENT
        },
        gzip: true,
        timeout: timeout
    }
    return new Promise(function (fulfill, reject) {
        request(options, function (error, response, html) {
            if (error !== null) {
                reject(error);
            } else if (response.statusCode !== 200) {
                reject('Error! Response code: ' + response.statusCode);
            } else if (html){
                var diff = process.hrtime(t0);
                fulfill({
                    html: html,
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
