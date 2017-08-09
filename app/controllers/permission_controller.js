'use strict';

//dependencies
var mongoose = require('mongoose');
var Permission = mongoose.model('Permission');

/**
 * Permission Controller
 *
 * @description :: Server-side logic for managing Permission.
 */
module.exports = {
  /**
   * @function
   * @name permissions.index()
   * @description display a list of all permissions
   * @param  {HttpRequest} request  a http request
   * @param  {HttpResponse} response a http response
   */
  index: function (request, response, next) {
    //load all permissions
    Permission
      .find({}).sort({ resource: 1 }).exec(function (error, permissions) {
        if (error) {
          next(error);
        } else {
          response.ok({
            permissions: permissions,
            count: permissions.length
          });
        }
      });
  },


  /**
   * @function
   * @name permissions.create()
   * @description create a new permission
   * @param  {HttpRequest} request  a http request
   * @param  {HttpResponse} response a http response
   */
  create: function (request, response /*, next*/ ) {
    response.methodNotAllowed();
  },


  /**
   * @function
   * @name permissions.show()
   * @description display a specific permission
   * @param  {HttpRequest} request  a http request
   * @param  {HttpResponse} response a http response
   */
  show: function (request, response, next) {
    Permission
      .show(request, function (error, permission) {
        if (error) {
          next(error);
        } else {
          response.ok(permission);
        }
      });
  },


  /**
   * @function
   * @name permissions.update()
   * @description update a specific permission
   * @param  {HttpRequest} request  a http request
   * @param  {HttpResponse} response a http response
   */
  update: function (request, response, next) {
    Permission
      .findByIdAndUpdate(
        request.params.id,
        request.body, {
          upsert: true,
          new: true
        },
        function (error, permission) {
          if (error) {
            next(error);
          } else {
            response.ok(permission);
          }
        });
  },


  /**
   * @function
   * @name permissions.destroy()
   * @description delete a specific permission
   * @param  {HttpRequest} request  a http request
   * @param  {HttpResponse} response a http response
   */
  destroy: function (request, response /*, next*/ ) {
    response.methodNotAllowed();
  }

};
