'use strict';

const { jwtAuth } = require('@lykmapipo/jwt-common');
const Party = require('../models/party_model');

/**
 * @name jwtAuth
 * @description middleware stack to check authenticity using jwt tokens
 * @param  {HttpRequest}   request  http request
 * @param  {HttpResponse}   response http response
 * @param  {Function} next     next http middleware to be invoked
 */
module.exports = [
  jwtAuth({ user: (jwt, done) => Party.findByJwt(jwt, done) }),
  (request, response, next) => {
    if (request.user) { request.party = request.user; }
    return next();
  }
];
