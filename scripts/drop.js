'use strict';

//dependencies
const conf = require('config');
const mongoose = require('mongoose');

//obtain mongoose configurations
const config = conf.get('mongoose');

/**
 * @description generate mongoose connection uri string
 * @type {String}
 */
const port = config.port ? ':' + config.port : '';

const login =
  (config.user.length > 0) ? config.user + ':' + config.password + '@' : '';

const uristring =
  'mongodb://' + login + config.host + port + '/' + config.database;

/**
 * @description mongodb options
 * @type {Object}
 */
const mongoOptions = config.options;

//ensure mongodb connection
mongoose.connect(uristring, mongoOptions, function (error) {
  //exit with error
  if (error) {
    throw error;
  }

  //drop current database in use
  else {
    mongoose.connection.dropDatabase(function (error) {
      //exit with error
      if (error) {
        throw error;
      }

      //exist successfull
      else {
        process.exit();
      }
    });
  }
});
