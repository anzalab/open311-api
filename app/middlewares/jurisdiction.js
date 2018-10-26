'use strict';

//dependencies
const _ = require('lodash');

/**
 * @name jurisdiction
 * @description middleware to extend request with jurisdiction(s) filters
 * @param  {HttpRequest}   request  http request
 * @param  {HttpResponse}   response http response
 * @param  {Function} next     next http middleware to be invoked
 */
module.exports = function (request, response, next) {

  if (request && request.party) {

    //obtain request filter
    const filter = _.get(request, 'mquery.filter', {});

    //ensure filtered by jurisdiction
    if (!filter.jurisdiction) {

      //obtain party jurisdictions
      request.party.jurisdictions(function (error, jurisdictions) {

        if (!error && !_.isEmpty(jurisdictions)) {
          jurisdictions = _.map(jurisdictions, '_id');
          filter.jurisdiction = { $in: jurisdictions };
        }

        //restore filter
        request.mquery.filter = filter;
        next();

      });

    }

    //continue
    else {
      next();
    }

  }

  //continue
  else {
    next();
  }

};
