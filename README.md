# Overview

[![Build Status](https://github.com/duosecurity/duo_api_nodejs/workflows/Node%20CI/badge.svg)](https://github.com/duosecurity/duo_api_nodejs/actions)
[![Issues](https://img.shields.io/github/issues/duosecurity/duo_api_nodejs)](https://github.com/duosecurity/duo_api_nodejs/issues)
[![Forks](https://img.shields.io/github/forks/duosecurity/duo_api_nodejs)](https://github.com/duosecurity/duo_api_nodejs/network/members)
[![Stars](https://img.shields.io/github/stars/duosecurity/duo_api_nodejs)](https://github.com/duosecurity/duo_api_nodejs/stargazers)
[![License](https://img.shields.io/badge/License-View%20License-orange)](https://github.com/duosecurity/duo_api_nodejs/blob/master/LICENSE)

**Auth** - https://www.duosecurity.com/docs/authapi

**Admin** - https://www.duosecurity.com/docs/adminapi

**Accounts** - https://www.duosecurity.com/docs/accountsapi

## Node Versions Tested Against:
* 8
* 10
* 12
* 14
* 15

## TLS 1.2 and 1.3 Support

Duo_api_nodejs uses the Node tls library and OpenSSL for TLS operations.  All versions of Node receiving security support (14 and higher) use OpenSSL 1.1.1 which supports TLS 1.2 and 1.3.

# Installing

Development:

```
$ git clone https://github.com/duosecurity/duo_api_nodejs.git
$ cd duo_api_nodejs
$ npm install
```

System:

```
$ npm install global @duosecurity/duo_api
```

Or run the following to add to your project:

```
$ npm install --save @duosecurity/duo_api
```

# Using

```
$ node --interactive
> const duo_api = require('duo_api');
> const client = new duo_api.Client(ikey, skey, host);
> client.jsonApiCall('POST', '/auth/v2/preauth', { username: 'testuser' }, console.log);
> { response:
   { devices: [ [Object] ],
     result: 'auth',
     status_msg: 'Account is active' },
  stat: 'OK' }
```

# Testing

```
$ npm run test
...
OK: 10 assertions (12ms)
```

# Linting

```
$ npm run lint

> @duosecurity/duo_api@1.0.0 lint duo_api_nodejs
> eslint lib/ tests/
```

# Support

Report any bugs, feature requests, etc. to us directly: support@duosecurity.com
