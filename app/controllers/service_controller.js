'use strict';

//dependencies
const mongoose = require('mongoose');
const Service = mongoose.model('Service');

/**
 * Service Controller
 *
 * @description :: Server-side logic for managing Service.
 */
module.exports = {
  /**
   * @function
   * @name services.index()
   * @description display a list of all services
   * @param  {HttpRequest} request  a http request
   * @param  {HttpResponse} response a http response
   */
  index: function (request, response, next) {
    Service
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
   * @name services.create()
   * @description create a new service
   * @param  {HttpRequest} request  a http request
   * @param  {HttpResponse} response a http response
   */
  create: function (request, response, next) {
    Service
      .create(request.body, function (error, service) {
        if (error) {
          next(error);
        } else {
          response.created(service);
        }
      });
  },


  /**
   * @function
   * @name services.show()
   * @description display a specific service
   * @param  {HttpRequest} request  a http request
   * @param  {HttpResponse} response a http response
   */
  show: function (request, response, next) {
    Service
      .show(request, function (error, service) {
        if (error) {
          next(error);
        } else {
          response.ok(service);
        }
      });
  },


  /**
   * @function
   * @name services.update()
   * @description update a specific service
   * @param  {HttpRequest} request  a http request
   * @param  {HttpResponse} response a http response
   */
  update: function (request, response, next) {
    Service
      .findByIdAndUpdate(
        request.params.id,
        request.body, {
          upsert: true,
          new: true
        },
        function (error, service) {
          if (error) {
            next(error);
          } else {
            response.ok(service);
          }
        });
  },


  /**
   * @function
   * @name services.destroy()
   * @description delete a specific service
   * @param  {HttpRequest} request  a http request
   * @param  {HttpResponse} response a http response
   */
  destroy: function (request, response, next) {
    Service
      .findByIdAndRemove(
        request.params.id,
        function (error, service) {
          if (error) {
            next(error);
          } else {
            response.ok(service);
          }
        });
  }

};
