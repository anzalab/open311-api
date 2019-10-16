'use strict';

const { model } = require('@lykmapipo/mongoose-common');
const {
  CONTACT_METHODS,
  CONTACT_METHODS_WEB
} = require('@codetanzania/majifix-common');
const Party = model('Party');

/**
 * @description middleware to load application settings
 * @param {HttpRequest} request  http request
 * @param {HttpResponse} response http response
 * @param {Function} next next http middleware to be invoked
 */
module.exports = function loadSettings(request, response, next) {
  // initialize settings
  const settings = {
    party: {
      relation: {
        names: Party.RELATION_NAMES,
        types: Party.RELATION_TYPES,
        workspaces: Party.RELATION_WORKSPACES
      }
    },
    servicerequest: {
      methods: CONTACT_METHODS,
      webMethods: CONTACT_METHODS_WEB
    }
  };

  // set request settings
  request.settings = settings;
  next();
};
