'use strict';

//dependencies
const mongoose = require('mongoose');
const PredefinedData = mongoose.model('PredefinedData');

/**
 * PredefinedData Controller
 *
 * @description :: Server-side logic for managing PredefinedData.
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
    PredefinedData
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
    PredefinedData
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
    PredefinedData
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
    PredefinedData
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
    PredefinedData
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
