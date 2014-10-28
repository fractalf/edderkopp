var HttpConnector = require('elasticsearch/src/lib/connectors/http');
var qs = require('querystring');
var inherits = require('util').inherits;
var fs = require('fs');

function CustomHttpConnector(host, config) {
  HttpConnector.call(this, host, config);
}

inherits(CustomHttpConnector, HttpConnector);

CustomHttpConnector.prototype.makeReqParams = function (params) {
  params = params || {};
  var host = this.host;
  
  var reqParams = {
    method: params.method || 'GET',
    protocol: host.protocol + ':',
    auth: host.auth,
    hostname: host.host,
    port: host.port,
    path: (host.path || '') + (params.path || ''),
    headers: host.getHeaders(params.headers),
    agent: this.agent,
    rejectUnauthorized: true,
    ca: fs.readFileSync('carlsen.crt', 'utf8')
  };

  if (!reqParams.path) {
    reqParams.path = '/';
  }

  var query = host.getQuery(params.query);
  if (query) {
    reqParams.path = reqParams.path + '?' + qs.stringify(query);
  }

  return reqParams;
};

module.exports = CustomHttpConnector;
