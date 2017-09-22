'use strict';

//dependencies
const _ = require('lodash');
const mongoose = require('mongoose');
const Setting = mongoose.model('Setting');
const Party = mongoose.model('Party');
const ServiceRequest = mongoose.model('ServiceRequest');


/**
 * @description middleware to load application settings
 * @param  {HttpRequest}   request  http request
 * @param  {HttpResponse}   response http response
 * @param  {Function} next     next http middleware to be invoked
 */
module.exports = function (request, response, next) {

  //TODO should we drop settings?
  //TODO should expose endpoint for /settings?
  //load all settings as an object map
  Setting.getAllAsMap(function (error, settings) {

    request.settings = settings;

    //merge static constanst from models

    //1. merge public party constants
    request.settings = _.merge({}, request.settings, {
      party: {
        relation: {
          names: Party.RELATION_NAMES,
          types: Party.RELATION_TYPES,
          workspaces: Party.RELATION_WORKSPACES
        }
      }
    });

    //2. merge public service request constants
    request.settings = _.merge({}, request.settings, {
      servicerequest: {
        methods: ServiceRequest.CONTACT_METHODS
      }
    });

    next();

  });

};
