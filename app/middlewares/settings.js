'use strict';

const {
  RELATION_NAMES,
  RELATION_TYPES,
  WORKSPACES,
  CONTACT_METHODS,
  CONTACT_METHODS_WEB
} = require('@codetanzania/majifix-common');

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
        names: RELATION_NAMES,
        types: RELATION_TYPES,
        workspaces: WORKSPACES
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
