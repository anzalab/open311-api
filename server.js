'use strict';

//dependencies
const config = require('config');
const path = require('path');
const app = require(path.join(__dirname, 'app', 'application'));
const environment = require('execution-environment');
const winston = require('winston');

//set application server port number
app.set('port', config.get('port'));

//set application server ip address
// app.set('ip', config.get('ip'));

//lift up application server
process.nextTick(function start() {
  app
    .listen(app.get('port'), function () {

      winston.debug(
        'Application server listening on port %d in %s environment',
        app.get('port'),
        app.get('env')
      );

      winston.debug('To see your app, visit %s', config.get('baseUrl'));

      //pass control to grunt if run in
      //development or test environment
      if (environment.isLocal()) {
        console.log('....');
      }

    })
    .on('error', function (error) {
      winston.error(error);
    });
});
