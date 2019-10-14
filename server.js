'use strict';

const { isLocal } = require('@lykmapipo/env');
const { start } = require('./app/application');

// lift up application server
start((error, env) => {
  // throw on start error
  if (error) {
    throw error;
  }

  console.log(
    'Application server listening on port %d in %s environment',
    env.PORT, env.NODE_ENV
  );

  console.log('To see your app, visit %s', `http://0.0.0.0:${env.PORT}`);

  // pass next control if run in
  // development or test environment with grunt
  if (isLocal()) {
    console.log('....');
  }
});
