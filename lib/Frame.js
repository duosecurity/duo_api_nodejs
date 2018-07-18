var {Client} = require('./main.js')

function Frame (ikey, skey, host) {
  Client.call(this, ikey, skey, host, 4)
}

Frame.prototype = Object.create(Client.prototype)
Frame.prototype.constructor = Frame

Frame.prototype.init = function (username, app_blob, expire, client_version, enroll_only = false, callback) {
  var init_txid_path = '/frame/init'
  var method = 'POST'
  var params = {
    'user': username,
    'app_blob': app_blob,
    'expire': expire,
    'client_version': client_version
  }

  if (enroll_only) {
    params.enroll_only = enroll_only
  }
  this.jsonApiCall(method, init_txid_path, params, (txid) => {
    callback(txid)
  })
}

Frame.prototype.auth_response = function (response_txid, callback) {
  var method = 'POST'
  var endpoint = '/frame/auth_response'
  var params = {
    'response_txid': response_txid
  }
  this.jsonApiCall(method, endpoint, params, (txid) => {
    callback(txid)
  })
}
module.exports = {
  'Frame': Frame
}
