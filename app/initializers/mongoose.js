'use strict';


//dependencies
const path = require('path');
// const environment = require('execution-environment');
const conf = require('config');
const winston = require('winston');
const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
// mongoose.set('debug', true);
const mongooseShow =
  require(path.join(__dirname, '..', 'libs', 'mongoose', 'show'));
const mongooseList =
  require(path.join(__dirname, '..', 'libs', 'mongoose', 'list'));
const mongooseReload =
  require(path.join(__dirname, '..', 'libs', 'mongoose', 'reload'));
const mongooseSoftDelete =
  require(path.join(__dirname, '..', 'libs', 'mongoose', 'soft_delete'));
const mongooseUrl =
  require(path.join(__dirname, '..', 'libs', 'mongoose', 'url'));
const mongooseSearchable = require('mongoose-regex-search');
const mongooseExists = require('mongoose-exists');
const mongooseAutoset = require('mongoose-autoset');
const mongooseValid8 = require('mongoose-valid8');
const mongoosePaginate = require('express-mquery').plugin;
const mongooseAutopopulate = require('mongoose-autopopulate');
// const mongooseUniqueValidator = require('mongoose-unique-validator');
const mongooseHidden = require('mongoose-hidden')({
  defaultHidden: {
    password: true,
    __v: true,
    __t: true
  },
  virtuals: {
    id: 'hideJSON'
  }
});


/**
 * @description prepare mongo database configurations
 * @type {Object}
 */
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


/**
 * @description plugin schema wide mongoose plugins 
 */
mongoose.plugin(function (schema) {
  //allow virtuals on toJSON
  schema.set('toJSON', {
    getters: true,
    virtuals: true
  });

});

mongoose.plugin(mongooseAutoset);
mongoose.plugin(mongooseExists);
mongoose.plugin(mongooseUrl);
mongoose.plugin(mongooseSoftDelete);
mongoose.plugin(mongoosePaginate);
mongoose.plugin(mongooseAutopopulate);
mongoose.plugin(mongooseHidden);
mongoose.plugin(mongooseValid8);
mongoose.plugin(mongooseShow);
mongoose.plugin(mongooseList);
mongoose.plugin(mongooseReload);
mongoose.plugin(mongooseSearchable);
// mongoose.plugin(mongooseUniqueValidator);

//require external models
// require('byteskode-logger');
// require('byteskode-mailer');

// load all models recursively
require('require-all')({
  dirname: path.join(__dirname, '..', 'models'),
  filter: /(.+_model)\.js$/,
  excludeDirs: /^\.(git|svn|md)$/
});


/**
 * @description establish database connection.
 */
mongoose.connect(uristring, mongoOptions, function () {
  require('seed-mongoose')({
    suffix: '_seed',
    logger: winston,
    mongoose: mongoose
  }, function (error /*, results*/ ) {
    if (error) {
      throw error;
    } else {
      //seed default user(s)
      require(path.join(__dirname, '..', '..', 'seeds'))
        (function (error /*, party*/ ) {
          if (error && error.code !== 11000) {
            throw error;
          }
        });
    }
  });
});

/**
 * @description export mongoose
 * @type {Mongoose}
 */
module.exports = mongoose;
