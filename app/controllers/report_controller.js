'use strict';

/**
 * Report Controller
 *
 * @description :: Server-side logic for managing report controller.
 */

//dependencies
const _ = require('lodash');
const mongoose = require('mongoose');
const ServiceRequest = mongoose.model('ServiceRequest');

module.exports = {

  /**
   * @name standings
   * @description handle standings request
   * @param  {HttpRequest} request  http request
   * @param  {HttpResponse} response http response
   * @since 0.1.0
   * @version 0.1.0
   * @public
   */
  standings: function (request, response, next) {
    //TODO pass request options(i.e query params to extras)
    //TODO support mongodb aggregation pipelines from request(express-mquery)
    const criteria = _.merge({}, (request.mquery || {}).query);

    ServiceRequest
      .standings(criteria, function (error, standings) {
        if (error) {
          error.status = 500;
          next(error);
        } else {
          response.ok(standings);
        }
      });
  },

  /**
   * @name overviews
   * @description handle overviews request
   * @param  {HttpRequest} request  http request
   * @param  {HttpResponse} response http response
   * @since 0.1.0
   * @version 0.1.0
   * @public
   */
  overviews: function (request, response, next) {
    //TODO pass request options(i.e query params to extras)
    //TODO support mongodb aggregation pipelines from request(express-mquery)
    const criteria = _.merge({}, (request.mquery || {}).query);

    ServiceRequest
      .overview(criteria, function (error, overviews) {
        if (error) {
          error.status = 500;
          next(error);
        } else {
          response.ok(overviews);
        }
      });
  }

};
