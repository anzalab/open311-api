'use strict';

//dependencies
const mongoose = require('mongoose');
const Setting = mongoose.model('Setting');

/**
 * @description middleware to load application settings
 * @param  {HttpRequest}   request  http request
 * @param  {HttpResponse}   response http response
 * @param  {Function} next     next http middleware to be invoked
 */
module.exports = function (request, response, next) {

  //load all settings as an object map
  Setting.getAllAsMap(function (error, settings) {

    request.settings = settings;

    next();

  });

};
