var duo_sig = require('./duo_sig');
var https = require('https');
var querystring = require('querystring');

function Client(ikey, skey, host) {
    this.ikey = ikey;
    this.skey = skey;
    this.host = host;
};

Client.prototype.apiCall = function(method, path, params, callback) {
    var qs = querystring.stringify(params);
    var body = '';
    if (method === 'POST' || method === 'PUT') {
        body = qs;
    }
    else if (qs) {
        path += '?' + qs;
    }

    var date = new Date().toUTCString();
    var req = https.request({
        'host': this.host,
        'method': method,
        'path': path,
        'headers': {
            'Authorization': duo_sig.sign(
                this.ikey, this.skey, method, this.host, path, params, date),
            'Date': date,
            'Host': this.host
        }
    }, function(res) {
        res.setEncoding('utf8');
        res.on('data', function (data) {
            callback(data);
        });
    });
    req.write(body);
    req.end();
}

Client.prototype.jsonApiCall = function(method, path, params, callback) {
    this.apiCall(method, path, params, function(data) {
        callback(JSON.parse(data));
    });
}

module.exports = {
    'Client': Client
};
