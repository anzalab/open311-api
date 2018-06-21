'use strict';


//dependencies
const path = require('path');
const _ = require('lodash');
const environment = require('execution-environment');
const conf = require('config');
const winston = require('winston');
const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
// mongoose.set('debug', true);
const mongooseShow =
  require(path.join(__dirname, '..', 'libs', 'mongoose', 'show'));
const mongooseEdit =
  require(path.join(__dirname, '..', 'libs', 'mongoose', 'edit'));
const mongooseList =
  require(path.join(__dirname, '..', 'libs', 'mongoose', 'list'));
const mongooseReload =
  require(path.join(__dirname, '..', 'libs', 'mongoose', 'reload'));
const mongooseSoftDelete =
  require(path.join(__dirname, '..', 'libs', 'mongoose', 'soft_delete'));
const mongooseSearchable = require('mongoose-regex-search');
const mongooseExists = require('mongoose-exists');
const mongooseAutoset = require('mongoose-autoset');
const mongoosePaginate = require('express-mquery').plugin;
const mongooseAutopopulate = require('mongoose-autopopulate');
const mongooseRunInBackground = require('mongoose-kue').plugin;
const mongooseHidden = require('mongoose-hidden')({
  defaultHidden: {
    password: true,
    __v: true,
    __t: true
  },
  virtuals: {
    id: 'hideJSON',
    runInBackgroundQueue: 'hide',
    runInBackgroundOptions: 'hide'
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
mongoose.plugin(mongooseSoftDelete);
mongoose.plugin(mongoosePaginate);
mongoose.plugin(mongooseAutopopulate);
mongoose.plugin(mongooseHidden);
mongoose.plugin(mongooseShow);
mongoose.plugin(mongooseEdit);
mongoose.plugin(mongooseList);
mongoose.plugin(mongooseReload);
mongoose.plugin(mongooseSearchable);

//plugin mongoose kue
let mongooseKueOptions = { mongoose: mongoose };
console.log('redis url: ', process.env.REDIS_URL);
if (process.env.REDIS_URL) {
  mongooseKueOptions.redis = process.env.REDIS_URL;
}
console.log('mongoose kue options: ', mongooseKueOptions);
mongoose.plugin(mongooseRunInBackground, mongooseKueOptions);


//require external models
require('open311-messages')(_.merge({}, {
  mongoose: mongoose
}, conf.get('infobip'))); //initialize message models


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
  //check if seeding is enabled
  const shouldSeed = _.get(config, 'seed.enable', false);

  if (!environment.isTest() && shouldSeed) {
    require('seed-mongoose')({
      suffix: '_seed',
      logger: winston,
      mongoose: mongoose
    }, function (error /*, results*/ ) {
      if (error && error.code !== 11000) {
        throw error;
      } else {
        //seed default user(s)
        require(path.join(__dirname, '..', '..', 'seeds'))
          (function (error /*, party*/ ) {
            if (1) {
              throw error;
            }
          });
      }
    });
  }

});

/**
 * @description export mongoose
 * @type {Mongoose}
 */
module.exports = mongoose;
