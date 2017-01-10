'use strict';

//dependencies
const mongoose = require('mongoose');
const Role = mongoose.model('Role');

/**
 * Role Controller
 *
 * @description :: Server-side logic for managing Role.
 */
module.exports = {
  /**
   * @function
   * @name roles.index()
   * @description display a list of all roles
   * @param  {HttpRequest} request  a http request
   * @param  {HttpResponse} response a http response
   */
  index: function (request, response, next) {
    Role
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
   * @name roles.create()
   * @description create a new role
   * @param  {HttpRequest} request  a http request
   * @param  {HttpResponse} response a http response
   */
  create: function (request, response, next) {
    Role
      .create(request.body, function (error, role) {
        if (error) {
          next(error);
        } else {
          response.created(role);
        }
      });
  },


  /**
   * @function
   * @name roles.show()
   * @description display a specific role
   * @param  {HttpRequest} request  a http request
   * @param  {HttpResponse} response a http response
   */
  show: function (request, response, next) {
    Role
      .show(request, function (error, role) {
        if (error) {
          next(error);
        } else {
          response.ok(role);
        }
      });
  },


  /**
   * @function
   * @name roles.update()
   * @description update a specific role
   * @param  {HttpRequest} request  a http request
   * @param  {HttpResponse} response a http response
   */
  update: function (request, response, next) {
    Role
      .findByIdAndUpdate(
        request.params.id,
        request.body, {
          upsert: true,
          new: true
        },
        function (error, role) {
          if (error) {
            next(error);
          } else {
            response.ok(role);
          }
        });
  },


  /**
   * @function
   * @name roles.destroy()
   * @description delete a specific role
   * @param  {HttpRequest} request  a http request
   * @param  {HttpResponse} response a http response
   */
  destroy: function (request, response, next) {
    Role
      .findByIdAndRemove(
        request.params.id,
        function (error, role) {
          if (error) {
            next(error);
          } else {
            response.ok(role);
          }
        });
  }

};
