#!/usr/bin/env node

var nopt = require('nopt')
var duo_api = require('../')

var parsed = nopt({
  'ikey': [String],
  'skey': [String],
  'host': [String]
}, [], process.argv, 2)

var requirements_met = (parsed.ikey && parsed.skey && parsed.host)

if (!requirements_met) {
  console.error('Missing required option.\n')
}

if (parsed.help || !requirements_met) {
  console.log(function () { /*
Usage:

    duo_admin_policy.js --ikey IKEY --skey SKEY --host HOST

    Example of making one Policy API call against the Duo service.

Options:

    --ikey    Admin API integration key (required)
    --skey    Corresponding secret key (required)
    --host    API hostname (required)
    --help    Print this help.
*/ }.toString().split(/\n/).slice(1, -1).join('\n'))
  if (parsed.help) {
    process.exit(0)
  } else {
    process.exit(1)
  }
}

var client = new duo_api.Client(parsed.ikey, parsed.skey, parsed.host)

let params = {
  'policy_name': 'api_test_policy',
  'sections': {
    'screen_lock': {
      'require_screen_lock': false
    }
  }
}

let policy_key = ''

client.jsonApiCall(
  'POST',
  '/admin/v2/policies',
  params,
  function (res) {
    if (res.stat !== 'OK') {
      console.error('API call returned error: ' + res.message)
      process.exit(1)
    }

    res = res.response
    policy_key = res.policy_key

    console.log('res = ' + JSON.stringify(res, null, 4))

    // Delete the created policy
    deletePolicy(policy_key)
  },
  5
)

// Delete policy function
function deletePolicy (policy_key) {
  client.jsonApiCall(
    'DELETE',
    '/admin/v2/policies/' + policy_key,
    {},
    function (res) {
      if (res.stat !== 'OK') {
        console.error('API call returned error: ' + res.message)
        process.exit(1)
      }
      res = res.response
      console.log('Deleted policy: ' + policy_key)
    },
    5
  )
}
