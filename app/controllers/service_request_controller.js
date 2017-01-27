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
      //TODO check if reporter already exists
      //TODO upsert reporter
      function persistReporter(then) {
        if (body.reporter && !body.reporter._id) {
          const reporter = _.merge({}, {
            email: new Date().getTime() + '@example.com',
            relation: {
              name: Party.RELATION_NAME_CIVILIAN,
              type: Party.RELATION_TYPE_INDIVIDUAL
            }
          }, body.reporter);
          Party.create(reporter, function (error, party) {
            body.reporter = party;
            then(error, body);
          });
        } else {
          then(null, body);
        }
      },
      function save(serviceRequest, then) {
        ServiceRequest.create(body, then);
      }
    ], function (error, serviceRequest) {
      if (error) {
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
    async.waterfall([

      function update(then) {
        ServiceRequest
          .findByIdAndUpdate(
            request.params.id,
            request.body, {
              upsert: true,
              new: true
            }, then);
      },

      function reload(servicerequest, then) {
        servicerequest.refresh(then);
      }

    ], function (error, servicerequest) {
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
