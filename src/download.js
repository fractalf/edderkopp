import request from "request";

export default class Download {

    _timeout = 60000;
    _cache = false;
    _delay = [ 2, 5 ]; // delay 2-5 sec (simulate a user)
    _force = false;
    _followRedirect = true;

    constructor(options) {
        if (options.timeout !== undefined) { this._timeout = options.timeout; }
        if (options.delay !== undefined) { this._delay = options.delay; }
        if (options.cache !== undefined) { this._cache = options.cache; }
        if (options.force !== undefined) { this._force = options.force; }
        if (options.followRedirect !== undefined) { this._followRedirect = options.followRedirect; }
    }

    get(url, cookies) {
        if (cookies) {
            this._jar = request.jar()
            for (let cookie of cookies) {
                this._jar.setCookie(cookie, url);
            }
        }

        // Get from cache or download it?
        if (this._cache && !this._force && this._cache.has(url)) {
            let res = {
                content: this._cache.get(url),
                cached: true
            }
            return Promise.resolve(res);
        } else {
            return (async () => {
                let delay = 0;
                if (this._useDelay) {
                    delay = !Array.isArray(this._delay) ? this._delay : this._delay[0] + (this._delay[1] - this._delay[0]) * Math.random();
                    await new Promise(resolve => setTimeout(resolve, delay * 1000));
                } else {
                    // Don't delay first download
                    this._useDelay = true;
                }

                // Prepare options for request
                let options = {
                    url: url,
                    headers: {
                        'User-Agent': USER_AGENT
                    },
                    followRedirect: this._followRedirect,
                    gzip: true,
                    timeout: this._timeout
                };
                if (this._jar) {
                    options.jar = this._jar;
                }
                let res = await this._download(options);
                res.delay = delay;
                return res;
            })();
        }
    }

    _download(options) {
        return new Promise((resolve, reject) => {
            const t0 = process.hrtime();
            request(options, (error, response, content) => {
                if (error !== null) {
                    reject(error);
                }
                // Note: the strange 301|302 condition is for the very weird case where a site returns a 301|302
                // with the correct content! Then we don't want to follow redirect, just return the body.
                else if (response.statusCode === 200 || /30[12]/.test(response.statusCode) && !this._followRedirect) {
                    // Debug info
                    let diff = process.hrtime(t0);
                    let time = diff[0] + diff[1] * 1e-9;

                    if (this._cache) { this._cache.set(options.url, content); }
                    resolve({ statusCode: response.statusCode, headers: response.headers, content, time });
                } else {
                    reject('Response code: ' + response.statusCode);
                }
            });
        });

    }
}
