'use strict';

//dependencies
const _ = require('lodash');
const async = require('async');
const mongoose = require('mongoose');
const ServiceRequest = mongoose.model('ServiceRequest');
const Party = mongoose.model('Party');

/**
 * ServiceRequest Controller
 *
 * @description :: Server-side logic for managing ServiceRequest.
 */
module.exports = {
  /**
   * @function
   * @name servicerequests.index()
   * @description display a list of all servicerequests
   * @param  {HttpRequest} request  a http request
   * @param  {HttpResponse} response a http response
   */
  index: function (request, response, next) {
    ServiceRequest
      .list(request, function (error, results) {
        if (error) {
          next(error);
        } else {
          response.ok(results);
        }
      });
  },


  /**
   * @function
   * @name servicerequests.create()
   * @description create a new servicerequest
   * @param  {HttpRequest} request  a http request
   * @param  {HttpResponse} response a http response
   */
  create: function (request, response, next) {
    //ensure reporter exists
    //operator exists
    let body = request.body;
    if (!body.operator) {
      body.operator = request.party;
    }

    async.waterfall([
      function persistReporter(next) {
        if (body.reporter && !body.reporter._id) {
          const reporter = _.merge({}, {
            email: new Date().getTime()+'@example.com'
          }, body.reporter);
          Party.create(reporter, function (error, party) {
            body.reporter = party;
            next(error, body);
          });
        } else {
          next(null, body);
        }
      },
      function save(serviceRequest, next) {
        console.log(serviceRequest);
        ServiceRequest.create(body, next);
      }
    ], function (error, serviceRequest) {
      if (error) {
        console.log(error);
        next(error);
      } else {
        response.created(serviceRequest);
      }
    });
  },


  /**
   * @function
   * @name servicerequests.show()
   * @description display a specific servicerequest
   * @param  {HttpRequest} request  a http request
   * @param  {HttpResponse} response a http response
   */
  show: function (request, response, next) {
    ServiceRequest
      .show(request, function (error, servicerequest) {
        if (error) {
          next(error);
        } else {
          response.ok(servicerequest);
        }
      });
  },


  /**
   * @function
   * @name servicerequests.update()
   * @description update a specific servicerequest
   * @param  {HttpRequest} request  a http request
   * @param  {HttpResponse} response a http response
   */
  update: function (request, response, next) {
    ServiceRequest
      .findByIdAndUpdate(
        request.params.id,
        request.body, {
          upsert: true,
          new: true
        },
        function (error, servicerequest) {
          if (error) {
            next(error);
          } else {
            response.ok(servicerequest);
          }
        });
  },


  /**
   * @function
   * @name servicerequests.destroy()
   * @description delete a specific servicerequest
   * @param  {HttpRequest} request  a http request
   * @param  {HttpResponse} response a http response
   */
  destroy: function (request, response, next) {
    ServiceRequest
      .findByIdAndRemove(
        request.params.id,
        function (error, servicerequest) {
          if (error) {
            next(error);
          } else {
            response.ok(servicerequest);
          }
        });
  }

};
