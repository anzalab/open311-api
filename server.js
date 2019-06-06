'use strict';


/* dependencies */
const path = require('path');
const config = require('config');
const { isLocal } = require('@lykmapipo/env');
const { start } = require('@lykmapipo/express-common');
require(path.join(__dirname, 'app', 'application'));

//lift up application server
start(function (error, env) {
  // throw on start error
  if (error) {
    throw error;
  }

  console.log(
    'Application server listening on port %d in %s environment',
    env.PORT, env.NODE_ENV
  );

  console.log('To see your app, visit %s', config.get('baseUrl'));

  //pass control to grunt if run in
  //development or test environment
  if (isLocal()) {
    console.log('....');
  }
});
