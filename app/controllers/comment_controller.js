'use strict';

//dependencies
const mongoose = require('mongoose');
const Comment = mongoose.model('Comment');

/**
 * Comment Controller
 *
 * @description :: Server-side logic for managing Comment.
 */
module.exports = {
  /**
   * @function
   * @name comments.index()
   * @description display a list of all comments
   * @param  {HttpRequest} request  a http request
   * @param  {HttpResponse} response a http response
   */
  index: function (request, response, next) {
    Comment
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
   * @name comments.create()
   * @description create a new comment
   * @param  {HttpRequest} request  a http request
   * @param  {HttpResponse} response a http response
   */
  create: function (request, response, next) {
    Comment
      .create(request.body, function (error, comment) {
        if (error) {
          next(error);
        } else {
          response.created(comment);
        }
      });
  },


  /**
   * @function
   * @name comments.show()
   * @description display a specific comment
   * @param  {HttpRequest} request  a http request
   * @param  {HttpResponse} response a http response
   */
  show: function (request, response, next) {
    Comment
      .show(request, function (error, comment) {
        if (error) {
          next(error);
        } else {
          response.ok(comment);
        }
      });
  },


  /**
   * @function
   * @name comments.update()
   * @description update a specific comment
   * @param  {HttpRequest} request  a http request
   * @param  {HttpResponse} response a http response
   */
  update: function (request, response, next) {
    Comment
      .findByIdAndUpdate(
        request.params.id,
        request.body, {
          upsert: true,
          new: true
        },
        function (error, comment) {
          if (error) {
            next(error);
          } else {
            response.ok(comment);
          }
        });
  },


  /**
   * @function
   * @name comments.destroy()
   * @description delete a specific comment
   * @param  {HttpRequest} request  a http request
   * @param  {HttpResponse} response a http response
   */
  destroy: function (request, response, next) {
    Comment
      .findByIdAndRemove(
        request.params.id,
        function (error, comment) {
          if (error) {
            next(error);
          } else {
            response.ok(comment);
          }
        });
  }

};
