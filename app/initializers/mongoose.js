'use strict';


/* dependencies */
const path = require('path');
const _ = require('lodash');
const env = require('@lykmapipo/env');
const conf = require('config');
const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
// mongoose.set('debug', true);
const pluginPath = path.join(__dirname, '..', 'libs', 'mongoose');
const mongooseShow = require(path.join(pluginPath, 'show'));
const mongooseEdit = require(path.join(pluginPath, 'edit'));
const mongooseList = require(path.join(pluginPath, 'list'));
const mongooseReload = require(path.join(pluginPath, 'reload'));
const mongooseSoftDelete = require(path.join(pluginPath, 'soft_delete'));
const mongooseRunInBackground = require('mongoose-kue').plugin;


/* ensure mongodb url */
const MONGODB_URI = env('MONGODB_URI', 'mongodb://localhost/open311');


/* plugin global schema plugin to allow virtuals in toJSON */
mongoose.plugin(function (schema) {
  schema.set('toJSON', {
    getters: true,
    virtuals: true
  });
});


/* local plugins */
mongoose.plugin(mongooseSoftDelete);
mongoose.plugin(mongooseShow);
mongoose.plugin(mongooseEdit);
mongoose.plugin(mongooseList);
mongoose.plugin(mongooseReload);


/* plugin mongoose kue */
let mongooseKueOptions = { mongoose: mongoose };
if (process.env.REDIS_URL) {
  mongooseKueOptions.redis = process.env.REDIS_URL;
}
mongoose.plugin(mongooseRunInBackground, mongooseKueOptions);


/* require external models */
require('open311-messages')
  (_.merge({}, mongooseKueOptions, conf.get('infobip'))); //initialize message models


/* load all models recursively */
require('require-all')({
  dirname: path.join(__dirname, '..', 'models'),
  filter: /(.+_model)\.js$/,
  excludeDirs: /^\.(git|svn|md)$/
});


/* establish mongodb connection */
mongoose.connect(MONGODB_URI, { useNewUrlParser: true });


/**
 * @description export mongoose
 * @type {Mongoose}
 */
exports = module.exports = mongoose;
