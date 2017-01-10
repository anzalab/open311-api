'use strict';

//dependencies
const mongoose = require('mongoose');
const ServiceGroup = mongoose.model('ServiceGroup');

/**
 * ServiceGroup Controller
 *
 * @description :: Server-side logic for managing ServiceGroup.
 */
module.exports = {
  /**
   * @function
   * @name servicegroups.index()
   * @description display a list of all servicegroups
   * @param  {HttpRequest} request  a http request
   * @param  {HttpResponse} response a http response
   */
  index: function (request, response, next) {
    ServiceGroup
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
   * @name servicegroups.create()
   * @description create a new servicegroup
   * @param  {HttpRequest} request  a http request
   * @param  {HttpResponse} response a http response
   */
  create: function (request, response, next) {
    ServiceGroup
      .create(request.body, function (error, servicegroup) {
        if (error) {
          next(error);
        } else {
          response.created(servicegroup);
        }
      });
  },


  /**
   * @function
   * @name servicegroups.show()
   * @description display a specific servicegroup
   * @param  {HttpRequest} request  a http request
   * @param  {HttpResponse} response a http response
   */
  show: function (request, response, next) {
    ServiceGroup
      .show(request, function (error, servicegroup) {
        if (error) {
          next(error);
        } else {
          response.ok(servicegroup);
        }
      });
  },


  /**
   * @function
   * @name servicegroups.update()
   * @description update a specific servicegroup
   * @param  {HttpRequest} request  a http request
   * @param  {HttpResponse} response a http response
   */
  update: function (request, response, next) {
    ServiceGroup
      .findByIdAndUpdate(
        request.params.id,
        request.body, {
          upsert: true,
          new: true
        },
        function (error, servicegroup) {
          if (error) {
            next(error);
          } else {
            response.ok(servicegroup);
          }
        });
  },


  /**
   * @function
   * @name servicegroups.destroy()
   * @description delete a specific servicegroup
   * @param  {HttpRequest} request  a http request
   * @param  {HttpResponse} response a http response
   */
  destroy: function (request, response, next) {
    ServiceGroup
      .findByIdAndRemove(
        request.params.id,
        function (error, servicegroup) {
          if (error) {
            next(error);
          } else {
            response.ok(servicegroup);
          }
        });
  }

};
