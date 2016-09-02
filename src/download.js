import request from "request";
import log from './log';

export default class Download {

    _timeout = 60000;
    _delay = 0;

    static get(url, cookies) {
        if (cookies) {
            this._jar = request.jar()
            for (let cookie of cookies) {
                this._jar.setCookie(cookie, url);
            }
        }

        // Get from cache or download it?
        if (this._cache && this._cache.has(url)) {
            log.verbose('[download] %s (CACHED) ', url);
            return Promise.resolve(this._cache.get(url));
        } else {
            return (async () => {
                // Wait between downloads?
                if (this._delay) {
                    log.verbose('[download] %s (delay %s s)', url, this._delay.toFixed(1));
                    await new Promise(resolve => setTimeout(resolve, this._delay * 1000));
                } else {
                    log.verbose('[download] %s', url);
                }

                // Prepare options for request
                let options = {
                    url: url,
                    headers: {
                        'User-Agent': USER_AGENT
                    },
                    gzip: true,
                    timeout: this._timeout
                };
                if (this._jar) {
                    options.jar = this._jar;
                }
                return await this._download(options);
            })();
        }
    }

    static _download(options) {
        const t0 = process.hrtime();
        return new Promise((resolve, reject) => {
            request(options, (error, response, content) => {
                if (error !== null) {
                    reject(error);
                } else if (response.statusCode !== 200) {
                    reject('Error! Response code: ' + response.statusCode);
                } else if (content) {
                    // Use cache?
                    if (this._cache) {
                        this._cache.set(options.url, content);
                    }

                    // Debug info
                    let diff = process.hrtime(t0);
                    let time = (diff[0] + diff[1] * 1e-9).toFixed(2) + ' s';
                    let size = (response.socket.bytesRead / 1024).toFixed(2) + ' KB';
                    let gzip = response.headers['content-encoding'] == 'gzip';
                    log.debug('[download] %s (done)', options.url);
                    log.silly(response.headers);
                    log.silly('[download] size: %s (%s)', size, gzip ? 'gzip' : 'uncompressed');
                    log.silly('[download] time: ' + time);

                    resolve(content);
                } else {
                    reject('This should not happen');
                }
            });
        });

    }

    static set timeout(t) {
        this._timeout = t * 1000;
    }

    // Get cache
    // Ex: Download.cache.has(url)
    static get cache() {
        return this._cache;
    }

    // Injecting cache
    static set cache(cache) {
        this._cache = cache;
    }

    // Tell Download to wait before proceeding with the actual download
    static set delay(t) {
        this._delay = t;
    }
}
