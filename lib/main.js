var duo_sig = require('./duo_sig')
var https = require('https')
var querystring = require('querystring')

// Constants for handling rate limit backoff and retries
const _MAX_BACKOFF_WAIT_SECS = 32
const _BACKOFF_FACTOR = 2
const _RATE_LIMITED_RESP_CODE = 429

function Client (ikey, skey, host, sig_version = 2) {
  this.ikey = ikey
  this.skey = skey
  this.host = host
  this.sig_version = sig_version

  this.digestmod = (sig_version === 4) ? 'sha512' : 'sha1'
}

Client.prototype.apiCall = function (method, path, params, callback) {
  var date = new Date().toUTCString()
  var headers = {
    'Date': date,
    'Host': this.host
  }
  headers['Authorization'] = duo_sig.sign(
    this.ikey, this.skey, method, this.host, path, params, date, this.sig_version, this.digestmod)

  var qs = querystring.stringify(params)
  var body = ''
  if (method === 'POST' || method === 'PUT') {
    if (this.sig_version === 4) {
      body = JSON.stringify(params)
      headers['Content-type'] = 'application/json'
    } else {
      body = qs
      headers['Content-type'] = 'application/x-www-form-urlencoded'
    }
    headers['content-length'] = Buffer.byteLength(body)
  } else if (qs) {
    path += '?' + qs
  }

  const options = {
    'host': this.host,
    'method': method,
    'path': path,
    'headers': headers
  }
  _request_with_backoff(options, body, callback)
}

function _request_with_backoff (options, body, callback, waitSecs = 1) {
  var req = https.request(options, function (res) {
    if (res.statusCode === _RATE_LIMITED_RESP_CODE &&
      waitSecs <= _MAX_BACKOFF_WAIT_SECS) {
      var randomOffset = Math.floor(Math.random() * 1000)
      setTimeout(function () {
        _request_with_backoff(options, body, callback, waitSecs * _BACKOFF_FACTOR)
      }, waitSecs * 1000 + randomOffset)
      return
    }

    var buffer = ''
    res.setEncoding('utf8')
    res.on('data', function (data) {
      buffer = buffer + data
    })

    res.on('end', function (data) {
      callback(buffer)
    })
  })
  req.write(body)
  req.end()
}

Client.prototype.jsonApiCall = function (method, path, params, callback) {
  this.apiCall(method, path, params, function (data) {
    callback(JSON.parse(data))
  })
}

module.exports = {
  'Client': Client
}
