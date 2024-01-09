var duo_sig = require('./duo_sig')
var https = require('https')
var querystring = require('querystring')
var constants = require('./constants')

const _PACKAGE_VERSION = require('../package.json').version

function Client (ikey, skey, host) {
  this.ikey = ikey
  this.skey = skey
  this.host = host
}

Client.prototype.apiCall = function (method, path, params, callback, signature = 2) {
  var date = new Date().toUTCString()
  var headers = {
    'Date': date,
    'Host': this.host,
    'User-Agent': `duo_api_nodejs/${_PACKAGE_VERSION}`
  }
  var body = ''
  var qs = querystring.stringify(params)
  if (signature === 5) {
    if (method === 'POST' || method === 'PUT') {
      body = JSON.stringify(params)
      params = {}
    }
    headers['Authorization'] = duo_sig.signV5(
      this.ikey, this.skey, method, this.host, path, params, date, body)
  } else {
    headers['Authorization'] = duo_sig.sign(
      this.ikey, this.skey, method, this.host, path, params, date)
  }

  if (method === 'POST' || method === 'PUT') {
    headers['Content-type'] = 'application/json'
  } else if (qs) {
    path += '?' + qs
  }

  const options = {
    'host': this.host,
    'method': method,
    'path': path,
    'headers': headers,
    'ca': constants.DUO_PINNED_CERT
  }
  _request_with_backoff(options, body, callback)
}

function _request_with_backoff (options, body, callback, waitSecs = 1) {
  var req = https.request(options, function (res) {
    if (res.statusCode === constants._RATE_LIMITED_RESP_CODE &&
      waitSecs <= constants._MAX_BACKOFF_WAIT_SECS) {
      var randomOffset = Math.floor(Math.random() * 1000)
      setTimeout(function () {
        _request_with_backoff(options, body, callback, waitSecs * constants._BACKOFF_FACTOR)
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
  req.on('error', (err) => {
    callback(JSON.stringify({ stat: 'ERROR', message: err.message }))
  })
  req.write(body)
  req.end()
}

Client.prototype.jsonApiCall = function (method, path, params, callback, signature = 2) {
  this.apiCall(method, path, params, function (data) {
    callback(JSON.parse(data))
  }, signature)
}

module.exports = {
  'Client': Client
}
