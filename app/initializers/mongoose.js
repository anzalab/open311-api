'use strict';


/* dependencies */
const path = require('path');
const { connect } = require('@lykmapipo/mongoose-common');
const mongoose = require('mongoose');
// mongoose.set('debug', true);
const pluginPath = path.join(__dirname, '..', 'libs', 'mongoose');
const mongooseShow = require(path.join(pluginPath, 'show'));
const mongooseEdit = require(path.join(pluginPath, 'edit'));
const mongooseList = require(path.join(pluginPath, 'list'));
const mongooseReload = require(path.join(pluginPath, 'reload'));
const mongooseSoftDelete = require(path.join(pluginPath, 'soft_delete'));
const { createModels } = require('@lykmapipo/file');


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


/* require external models */
require('@codetanzania/majifix-alert');
require('@lykmapipo/postman');


/* load all models recursively */
require('require-all')({
  dirname: path.join(__dirname, '..', 'models'),
  filter: /(.+_model)\.js$/,
  excludeDirs: /^\.(git|svn|md)$/
});


/* establish mongodb connection */
connect(function () {
  createModels(); // initialize common file models
});

/**
 * @description export mongoose
 * @type {Mongoose}
 */
exports = module.exports = mongoose;
