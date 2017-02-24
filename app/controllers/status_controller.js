'use strict';

//dependencies
const mongoose = require('mongoose');
const Status = mongoose.model('Status');

/**
 * Status Controller
 *
 * @description :: Server-side logic for managing Status.
 */
module.exports = {
  /**
   * @function
   * @name statuses.index()
   * @description display a list of all statuses
   * @param  {HttpRequest} request  a http request
   * @param  {HttpResponse} response a http response
   */
  index: function (request, response, next) {
    Status
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
   * @name statuses.create()
   * @description create a new status
   * @param  {HttpRequest} request  a http request
   * @param  {HttpResponse} response a http response
   */
  create: function (request, response, next) {
    Status
      .create(request.body, function (error, status) {
        if (error) {
          next(error);
        } else {
          response.created(status);
        }
      });
  },


  /**
   * @function
   * @name statuses.show()
   * @description display a specific status
   * @param  {HttpRequest} request  a http request
   * @param  {HttpResponse} response a http response
   */
  show: function (request, response, next) {
    Status
      .show(request, function (error, status) {
        if (error) {
          next(error);
        } else {
          response.ok(status);
        }
      });
  },


  /**
   * @function
   * @name statuses.update()
   * @description update a specific status
   * @param  {HttpRequest} request  a http request
   * @param  {HttpResponse} response a http response
   */
  update: function (request, response, next) {
    Status
      .findByIdAndUpdate(
        request.params.id,
        request.body, {
          upsert: true,
          new: true
        },
        function (error, status) {
          if (error) {
            next(error);
          } else {
            response.ok(status);
          }
        });
  },


  /**
   * @function
   * @name statuses.destroy()
   * @description delete a specific status
   * @param  {HttpRequest} request  a http request
   * @param  {HttpResponse} response a http response
   */
  destroy: function (request, response, next) {
    Status
      .findByIdAndRemove(
        request.params.id,
        function (error, status) {
          if (error) {
            next(error);
          } else {
            response.ok(status);
          }
        });
  }

};
