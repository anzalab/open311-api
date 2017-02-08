'use strict';


//dependencies
const async = require('async');
const mongoose = require('mongoose');
const Jurisdiction = mongoose.model('Jurisdiction');


/**
 * Jurisdiction Controller
 *
 * @description :: Server-side logic for managing Jurisdiction.
 */
module.exports = {
  /**
   * @function
   * @name jurisdictions.index()
   * @description display a list of all jurisdictions
   * @param  {HttpRequest} request  a http request
   * @param  {HttpResponse} response a http response
   */
  index: function (request, response, next) {
    Jurisdiction
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
   * @name jurisdictions.create()
   * @description create a new jurisdiction
   * @param  {HttpRequest} request  a http request
   * @param  {HttpResponse} response a http response
   */
  create: function (request, response, next) {
    Jurisdiction
      .create(request.body, function (error, jurisdiction) {
        if (error) {
          next(error);
        } else {
          response.created(jurisdiction);
        }
      });
  },


  /**
   * @function
   * @name jurisdictions.show()
   * @description display a specific jurisdiction
   * @param  {HttpRequest} request  a http request
   * @param  {HttpResponse} response a http response
   */
  show: function (request, response, next) {
    Jurisdiction
      .show(request, function (error, jurisdiction) {
        if (error) {
          next(error);
        } else {
          response.ok(jurisdiction);
        }
      });
  },


  /**
   * @function
   * @name jurisdictions.update()
   * @description update a specific jurisdiction
   * @param  {HttpRequest} request  a http request
   * @param  {HttpResponse} response a http response
   */
  update: function (request, response, next) {
    async.waterfall([

      function upsert(then) {
        Jurisdiction
          .findByIdAndUpdate(
            request.params.id,
            request.body, {
              upsert: true,
              new: true
            }, then);
      },

      function refresh(jurisdiction, then) {
        jurisdiction.refresh(then);
      }

    ], function (error, jurisdiction) {
      if (error) {
        next(error);
      } else {
        response.ok(jurisdiction);
      }
    });
  },


  /**
   * @function
   * @name jurisdictions.destroy()
   * @description delete a specific jurisdiction
   * @param  {HttpRequest} request  a http request
   * @param  {HttpResponse} response a http response
   */
  destroy: function (request, response, next) {
    Jurisdiction
      .findByIdAndRemove(
        request.params.id,
        function (error, jurisdiction) {
          if (error) {
            next(error);
          } else {
            response.ok(jurisdiction);
          }
        });
  }

};
