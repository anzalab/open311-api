'use strict';

//dependencies
const _ = require('lodash');
const mongoose = require('mongoose');
const Setting = mongoose.model('Setting');

/**
 * Setting Controller
 *
 * @description :: Server-side logic for managing Setting.
 */
module.exports = {
  /**
   * @function
   * @name settings.index()
   * @description display a list of all settings
   * @param  {HttpRequest} request  a http request
   * @param  {HttpResponse} response a http response
   */
  index: function (request, response, next) {
    Setting
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
   * @name settings.create()
   * @description create a new setting
   * @param  {HttpRequest} request  a http request
   * @param  {HttpResponse} response a http response
   */
  create: function (request, response, next) {
    Setting
      .create(request.body, function (error, setting) {
        if (error) {
          next(error);
        } else {
          response.created(setting);
        }
      });
  },


  /**
   * @function
   * @name settings.show()
   * @description display a specific setting
   * @param  {HttpRequest} request  a http request
   * @param  {HttpResponse} response a http response
   */
  show: function (request, response, next) {
    Setting
      .findById(request.params.id, function (error, setting) {
        if (error) {
          next(error);
        } else {
          response.ok(setting);
        }
      });
  },


  /**
   * @function
   * @name settings.update()
   * @description update a specific setting
   * @param  {HttpRequest} request  a http request
   * @param  {HttpResponse} response a http response
   */
  update: function (request, response, next) {
    //bulk update
    if (_.isArray(request.body)) {
      Setting
        .bulkUpdate(request.body[0], function (error, settings) {
          if (error) {
            next(error);
          } else {
            response.ok(settings);
          }
        });
    }

    //update single
    else {
      Setting
        .findByIdAndUpdate(
          request.params.id,
          request.body, {
            upsert: true,
            new: true
          },
          function (error, setting) {
            if (error) {
              next(error);
            } else {
              response.ok(setting);
            }
          });
    }
  },


  /**
   * @function
   * @name settings.destroy()
   * @description delete a specific setting
   * @param  {HttpRequest} request  a http request
   * @param  {HttpResponse} response a http response
   */
  destroy: function (request, response, next) {
    Setting
      .findByIdAndRemove(
        request.params.id,
        function (error, setting) {
          if (error) {
            next(error);
          } else {
            response.ok(setting);
          }
        });
  }

};
