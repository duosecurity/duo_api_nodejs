# Overview

[![Build Status](https://travis-ci.org/duosecurity/duo_api_nodejs.svg?branch=master)](https://travis-ci.org/duosecurity/duo_api_nodejs)

**Auth** - https://www.duosecurity.com/docs/authapi

**Admin** - https://www.duosecurity.com/docs/adminapi

**Accounts** - https://www.duosecurity.com/docs/accountsapi

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
