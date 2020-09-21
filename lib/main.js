var duo_sig = require('./duo_sig')
var https = require('https')
var querystring = require('querystring')

// Constants for handling rate limit backoff and retries
const _MAX_BACKOFF_WAIT_SECS = 32
const _BACKOFF_FACTOR = 2
const _RATE_LIMITED_RESP_CODE = 429

const _PACKAGE_VERSION = require('../package.json').version

function Client (ikey, skey, host) {
  this.ikey = ikey
  this.skey = skey
  this.host = host
}

Client.prototype.apiCall = function (method, path, params, callback) {
  var date = new Date().toUTCString()
  var headers = {
    'Date': date,
    'Host': this.host,
    'User-Agent': `duo_api_nodejs/${_PACKAGE_VERSION}`
  }
  headers['Authorization'] = duo_sig.sign(
    this.ikey, this.skey, method, this.host, path, params, date)

  var qs = querystring.stringify(params)
  var body = ''
  if (method === 'POST' || method === 'PUT') {
    body = qs
    headers['Content-type'] = 'application/x-www-form-urlencoded'
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
  req.on('error', (err) => {
    callback(JSON.stringify({ stat: 'ERROR', message: err.message }))
  })
  req.write(body)
  req.end()
}

Client.prototype.jsonApiCall = function (method, path, params, callback) {
  this.apiCall(method, path, params, function (data) {
    callback(JSON.parse(data))
  })
}

/**
 * Works just like the jsonApiCall function, but instead returns a Promise
 * that will throw when the "stat" field does not equal "OK"
 * @param {"GET"|"PUT"|"POST"|"DELETE"} method The HTTP method to use for the request
 * @param {string} path The url path for the request
 * @param {Object} params JSON object that contains the key/values for POST/PUT requests or queryparams for GET requests
 * @returns {Object} A JSON object representing the response (JSON.parse called on the returned string)
 */
Client.prototype.jsonApiCallAsync = function (method, path, params) {
  return new Promise((resolve, reject) => {
    this.jsonApiCall(method, path, params, (data) => {
      if (data.stat === 'OK') return resolve(data)
      else return reject(new Error(data.message))
    })
  })
}

/**
 * Works just like the jsonApiCall function, but instead returns a Promise
 * that will throw when the "stat" field does not equal "OK"
 * @param {"GET"|"PUT"|"POST"|"DELETE"} method The HTTP method to use for the request
 * @param {string} path The url path for the request
 * @param {Object} params JSON object that contains the key/values for POST/PUT requests or queryparams for GET requests
 * @returns {string} The raw string response from the API
 */
Client.prototype.apiCallAsync = function (method, path, params) {
  return new Promise((resolve, reject) => {
    this.apiCall(method, path, params, (dataString) => {
      let temp = JSON.parse(dataString)
      if (temp.stat === 'OK') return resolve(dataString)
      else return reject(new Error(temp.message))
    })
  })
}

module.exports = {
  'Client': Client
}
