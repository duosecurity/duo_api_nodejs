var crypto = require('crypto')

// Compare two strings based on character unicode values.
//
// If a string is a subset of another, it should sort before.
// i.e. 'foo' < 'foo_bar'
function compare (a, b) {
  var aChar, bChar

  for (var i = 0; i < Math.min(a.length, b.length); i++) {
    aChar = a.charCodeAt(i)
    bChar = b.charCodeAt(i)

    if (aChar < bChar) {
      return -1
    } else if (aChar > bChar) {
      return 1
    }
  }

  if (a.length < b.length) {
    return -1
  } else if (a.length > b.length) {
    return 1
  }

  return 0
}

// Given an Object mapping from parameter name to its value as either
// a single string or an Array of strings, return the
// application/x-www-form-urlencoded parameters string.
function canonParams (params) {
  var ks = Object.keys(params).sort(compare)

  // Build application/x-www-form-urlencoded string.
  var qs = ks.map(function (k) {
    var keq = encodeURIComponent(k) + '='
    if (Array.isArray(params[k])) {
      return params[k].map(function (v) {
        return keq + encodeURIComponent(v)
      }).join('&')
    } else {
      return keq + encodeURIComponent(params[k])
    }
  }).join('&')

  // encodeURIComponent doesn't escape all needed characters.
  // We need to use global regexps to handle the remaining cases.

  var exclamationRegexp = /!/g
  var singleQuoteRegexp = /'/g
  var lparenRegexp = /\(/g
  var rparenRegexp = /\)/g
  var starRegexp = /\*/g
  return qs
    .replace(exclamationRegexp, '%21')
    .replace(singleQuoteRegexp, '%27')
    .replace(lparenRegexp, '%28')
    .replace(rparenRegexp, '%29')
    .replace(starRegexp, '%2A')
}

// Return a request's canonical representation as a string to sign.
// Canonicalization format is version 2.
function canonicalize (method, host, path, params, date) {
  return [
    date,
    method.toUpperCase(),
    host.toLowerCase(),
    path,
    canonParams(params)
  ].join('\n')
}

// Canonicalization format is version 5.
function canonicalizeV5 (method, host, path, params, date, body) {
  return [
    date,
    method.toUpperCase(),
    host.toLowerCase(),
    path,
    canonParams(params),
    hashString(body),
    hashString('') // additional headers not needed at this time
  ].join('\n')
}

// Return the Authorization header for an HMAC signed request.
// Signature format is version 2.
function sign (ikey, skey, method, host, path, params, date) {
  var canon = canonicalize(method, host, path, params, date)
  var sig = crypto.createHmac('sha512', skey)
    .update(canon)
    .digest('hex')

  var auth = Buffer.from([ikey, sig].join(':')).toString('base64')
  return 'Basic ' + auth
}

// Signature format is version 5.
function signV5 (ikey, skey, method, host, path, params, date, body) {
  var canon = canonicalizeV5(method, host, path, params, date, body)
  var sig = crypto.createHmac('sha512', skey)
    .update(canon)
    .digest('hex')

  var auth = Buffer.from([ikey, sig].join(':')).toString('base64')
  return 'Basic ' + auth
}

function hashString (to_hash) {
  return crypto.createHash('sha512')
    .update(to_hash)
    .digest('hex')
}

module.exports = {
  'sign': sign,
  'signV5': signV5,
  '_canonParams': canonParams,
  '_canonicalize': canonicalize
}
