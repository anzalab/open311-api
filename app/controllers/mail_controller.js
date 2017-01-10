'use strict';

//dependencies
const Mail = require('byteskode-mailer');


/**
 * Mail Controller
 *
 * @description :: Server-side logic for managing Mail.
 */
module.exports = {
  /**
   * @function
   * @name mails.index()
   * @description display a list of all mails
   * @param  {HttpRequest} request  a http request
   * @param  {HttpResponse} response a http response
   */
  index: function (request, response, next) {
    Mail
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
   * @name mails.create()
   * @description create a new email
   * @param  {HttpRequest} request  a http request
   * @param  {HttpResponse} response a http response
   */
  create: function (request, response, next) {
    Mail
      .create(request.body, function (error, email) {
        if (error) {
          next(error);
        } else {
          response.created(email);
        }
      });
  },


  /**
   * @function
   * @name mails.show()
   * @description display a specific email
   * @param  {HttpRequest} request  a http request
   * @param  {HttpResponse} response a http response
   */
  show: function (request, response, next) {
    Mail
      .findById(request.params.id, function (error, email) {
        if (error) {
          next(error);
        } else {
          response.ok(email);
        }
      });
  },


  /**
   * @function
   * @name mails.update()
   * @description update a specific email
   * @param  {HttpRequest} request  a http request
   * @param  {HttpResponse} response a http response
   */
  update: function (request, response, next) {
    Mail
      .findByIdAndUpdate(
        request.params.id,
        request.body, {
          upsert: true,
          new: true
        },
        function (error, email) {
          if (error) {
            next(error);
          } else {
            response.ok(email);
          }
        });
  },


  /**
   * @function
   * @name mails.destroy()
   * @description delete a specific email
   * @param  {HttpRequest} request  a http request
   * @param  {HttpResponse} response a http response
   */
  destroy: function (request, response, next) {
    Mail
      .findByIdAndRemove(
        request.params.id,
        function (error, email) {
          if (error) {
            next(error);
          } else {
            response.ok(email);
          }
        });
  }

};
