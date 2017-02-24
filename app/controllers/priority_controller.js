'use strict';

//dependencies
const mongoose = require('mongoose');
const Priority = mongoose.model('Priority');

/**
 * Priority Controller
 *
 * @description :: Server-side logic for managing Priority.
 */
module.exports = {
  /**
   * @function
   * @name priorities.index()
   * @description display a list of all priorities
   * @param  {HttpRequest} request  a http request
   * @param  {HttpResponse} response a http response
   */
  index: function (request, response, next) {
    Priority
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
   * @name priorities.create()
   * @description create a new priority
   * @param  {HttpRequest} request  a http request
   * @param  {HttpResponse} response a http response
   */
  create: function (request, response, next) {
    Priority
      .create(request.body, function (error, priority) {
        if (error) {
          next(error);
        } else {
          response.created(priority);
        }
      });
  },


  /**
   * @function
   * @name priorities.show()
   * @description display a specific priority
   * @param  {HttpRequest} request  a http request
   * @param  {HttpResponse} response a http response
   */
  show: function (request, response, next) {
    Priority
      .show(request, function (error, priority) {
        if (error) {
          next(error);
        } else {
          response.ok(priority);
        }
      });
  },


  /**
   * @function
   * @name priorities.update()
   * @description update a specific priority
   * @param  {HttpRequest} request  a http request
   * @param  {HttpResponse} response a http response
   */
  update: function (request, response, next) {
    Priority
      .findByIdAndUpdate(
        request.params.id,
        request.body, {
          upsert: true,
          new: true
        },
        function (error, priority) {
          if (error) {
            next(error);
          } else {
            response.ok(priority);
          }
        });
  },


  /**
   * @function
   * @name priorities.destroy()
   * @description delete a specific priority
   * @param  {HttpRequest} request  a http request
   * @param  {HttpResponse} response a http response
   */
  destroy: function (request, response, next) {
    Priority
      .findByIdAndRemove(
        request.params.id,
        function (error, priority) {
          if (error) {
            next(error);
          } else {
            response.ok(priority);
          }
        });
  }

};
