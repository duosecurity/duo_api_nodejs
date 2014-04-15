#!/usr/bin/env node

var nopt = require("nopt");
var duo_api = require('../');

var parsed = nopt({
    'ikey': [String],
    'skey': [String],
    'host': [String]
}, [], process.argv, 2);

var requirements_met = (parsed.ikey && parsed.skey && parsed.host);

if (! requirements_met) {
    console.error('Missing required option.\n');
}

if (parsed.help || !requirements_met) {
    console.log(function(){/*
Usage:

    duo_admin.js --ikey IKEY --skey SKEY --host HOST

    Example of making one Admin API call against the Duo service.

Options:

    --ikey    Admin API integration key (required)
    --skey    Corresponding secret key (required)
    --host    API hostname (required)
    --help    Print this help.
*/}.toString().split(/\n/).slice(1, -1).join("\n"));
    if (parsed.help) {
        process.exit(0);
    }
    else {
        process.exit(1);
    }
}

var client = new duo_api.Client(parsed.ikey, parsed.skey, parsed.host);
client.jsonApiCall(
    'GET', '/admin/v1/info/authentication_attempts', {},
    function(res) {
        if (res.stat !== 'OK') {
            console.error('API call returned error: '
                          + res.message);
            process.exit(1);
        }

        res = res.response;
        console.log('mintime = ' + res.mintime);
        console.log('maxtime = ' + res.maxtime);
        for (var k in res.authentication_attempts) {
            console.log(k + ' count = '
                        + res.authentication_attempts[k]);
        }
    });
