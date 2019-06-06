'use strict';


/* dependencies */
const config = require('config');
const path = require('path');
const { getString, isLocal } = require('@lykmapipo/env');
const app = require(path.join(__dirname, 'app', 'application'));


//lift up application server
app.start(getString('PORT'), function () {

    console.log(
      'Application server listening on port %d in %s environment',
      getString('PORT'),
      getString('NODE_ENV')
    );

    console.log('To see your app, visit %s', config.get('baseUrl'));

    //pass control to grunt if run in
    //development or test environment
    if (isLocal()) {
      console.log('....');
    }

  })
  .on('error', function (error) {
    console.error(error);
  });
