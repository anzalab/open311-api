'use strict';

//dependencies
const path = require('path');
const JWT = require(path.join(__dirname, '..', 'libs', 'jwt'));


/**
 * @description middleware to check authenticity using jwt tokens
 * @param  {HttpRequest}   request  http request
 * @param  {HttpResponse}   response http response
 * @param  {Function} next     next http middleware to be invoked
 */
module.exports = function (request, response, next) {
  JWT
    .verify(request, function (error, party) {
      if (error) {

        error.status = 403;
        error.message = error.message || 'Not authenticated';
        next(error);

      } else {
        if (!party.deletedAt) {
          request.party = party;
        }
        next();
      }
    });
};
