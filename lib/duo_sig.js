var crypto = require('crypto');

// Given an Object mapping from parameter name to its value as either
// a single string or an Array of strings, return the
// application/x-www-form-urlencoded parameters string.
function canonParams(params) {
    // "foo" must sort before "foo_bar" regardless of locale.
    var ks = Object.keys(params);
    ks.sort(function(a, b) {
        return a.localeCompare(b, 'C');
    });

    // Build application/x-www-form-urlencoded string.
    var qs = ks.map(function(k) {
        var keq = encodeURIComponent(k) + '=';
        if (Array.isArray(params[k])) {
            return params[k].map(function(v) {
                return keq + encodeURIComponent(v);
            }).join('&');
        } else {
            return keq + encodeURIComponent(params[k]);
        }
    }).join('&');

    // encodeURIComponent doesn't escape all needed characters.
    return qs
        .replace('!', '%21')
        .replace("'", '%27')
        .replace("(", '%28')
        .replace(")", '%29')
        .replace("*", '%2A')
    ;
}

// Return a request's canonical representation as a string to sign.
function canonicalize(method, host, path, params, date) {
    return [ date,
             method.toUpperCase(),
             host.toLowerCase(),
             path,
             canonParams(params) ].join('\n');
}

// Return the Authorization header for an HMAC-SHA1-signed request.
function sign(ikey, skey, method, host, path, params, date) {
    var canon = canonicalize(method, host, path, params, date);
    var sig = crypto.createHmac('sha1', skey)
        .update(canon)
        .digest('hex');
    var auth = new Buffer([ikey, sig].join(':')).toString('base64');
    return 'Basic ' + auth;
}

module.exports = {
    'sign': sign,
};
