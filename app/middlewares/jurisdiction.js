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

    //obtain request query criteria
    const criteria = _.get(request, 'mquery.query', {});

    //ensure filtered by jurisdiction
    if (!criteria.jurisdiction) {

      //obtain party jurisdictions
      request.party.jurisdictions(function (error, jurisdictions) {

        if (!error && !_.isEmpty(jurisdictions)) {
          jurisdictions = _.map(jurisdictions, '_id');
          // criteria.jurisdiction = { $in: jurisdictions };
          criteria.jurisdiction = {
            $or: [{
              jurisdiction: {
                $in: jurisdictions
              }
            }, {
              jurisdiction: { $eq: null }
            }]
          };

        }

        //restore criteria
        request.mquery.query = criteria;
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
