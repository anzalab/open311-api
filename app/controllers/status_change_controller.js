'use strict';

//dependencies
const mongoose = require('mongoose');
const StatusChange = mongoose.model('StatusChange');

//TODO migrate to use servicerequest changelogs


/**
 * StatusChange Controller
 *
 * @description :: Server-side logic for managing StatusChange.
 */
module.exports = {
  /**
   * @function
   * @name statuschanges.index()
   * @description display a list of all statuschanges
   * @param  {HttpRequest} request  a http request
   * @param  {HttpResponse} response a http response
   */
  index: function (request, response, next) {
    StatusChange
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
   * @name statuschanges.create()
   * @description create a new statuschange
   * @param  {HttpRequest} request  a http request
   * @param  {HttpResponse} response a http response
   */
  create: function (request, response, next) {
    StatusChange
      .create(request.body, function (error, statuschange) {
        if (error) {
          next(error);
        } else {
          response.created(statuschange);
        }
      });
  },


  /**
   * @function
   * @name statuschanges.show()
   * @description display a specific statuschange
   * @param  {HttpRequest} request  a http request
   * @param  {HttpResponse} response a http response
   */
  show: function (request, response, next) {
    StatusChange
      .show(request, function (error, statuschange) {
        if (error) {
          next(error);
        } else {
          response.ok(statuschange);
        }
      });
  },


  /**
   * @function
   * @name statuschanges.update()
   * @description update a specific statuschange
   * @param  {HttpRequest} request  a http request
   * @param  {HttpResponse} response a http response
   */
  update: function (request, response, next) {
    StatusChange
      .findByIdAndUpdate(
        request.params.id,
        request.body, {
          upsert: true,
          new: true
        },
        function (error, statuschange) {
          if (error) {
            next(error);
          } else {
            response.ok(statuschange);
          }
        });
  },


  /**
   * @function
   * @name statuschanges.destroy()
   * @description delete a specific statuschange
   * @param  {HttpRequest} request  a http request
   * @param  {HttpResponse} response a http response
   */
  destroy: function (request, response, next) {
    StatusChange
      .findByIdAndRemove(
        request.params.id,
        function (error, statuschange) {
          if (error) {
            next(error);
          } else {
            response.ok(statuschange);
          }
        });
  }

};
