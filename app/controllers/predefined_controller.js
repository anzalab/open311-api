'use strict';

//dependencies
const mongoose = require('mongoose');
const Predefined = mongoose.model('Predefined');

/**
 * Predefined Data Controller
 *
 * @description :: Server-side logic for managing Predefined Data.
 */
module.exports = {
  /**
   * @function
   * @name predefines.index()
   * @description display a list of all predefines
   * @param  {HttpRequest} request  a http request
   * @param  {HttpResponse} response a http response
   */
  index: function (request, response, next) {
    Predefined
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
   * @name predefines.create()
   * @description create a new predefined data
   * @param  {HttpRequest} request  a http request
   * @param  {HttpResponse} response a http response
   */
  create: function (request, response, next) {
    Predefined
      .create(request.body, function (error, predefined) {
        if (error) {
          next(error);
        } else {
          response.created(predefined);
        }
      });
  },


  /**
   * @function
   * @name predefines.show()
   * @description display a specific predefined data
   * @param  {HttpRequest} request  a http request
   * @param  {HttpResponse} response a http response
   */
  show: function (request, response, next) {
    Predefined
      .show(request, function (error, predefined) {
        if (error) {
          next(error);
        } else {
          response.ok(predefined);
        }
      });
  },


  /**
   * @function
   * @name predefines.update()
   * @description update a specific predefined data
   * @param  {HttpRequest} request  a http request
   * @param  {HttpResponse} response a http response
   */
  update: function (request, response, next) {
    Predefined
      .findByIdAndUpdate(
        request.params.id,
        request.body, {
          upsert: true,
          new: true
        },
        function (error, predefined) {
          if (error) {
            next(error);
          } else {
            response.ok(predefined);
          }
        });
  },


  /**
   * @function
   * @name predefines.destroy()
   * @description delete a specific predefined data
   * @param  {HttpRequest} request  a http request
   * @param  {HttpResponse} response a http response
   */
  destroy: function (request, response, next) {
    Predefined
      .findByIdAndRemove(
        request.params.id,
        function (error, predefined) {
          if (error) {
            next(error);
          } else {
            response.ok(predefined);
          }
        });
  }

};
