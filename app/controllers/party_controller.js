'use strict';

//dependencies
const mongoose = require('mongoose');
const Party = mongoose.model('Party');
const async = require('async');
const irinaUtils = require('irina/lib/utils.js');

/**
 * Party Controller
 *
 * @description :: Server-side logic for managing Party.
 */
module.exports = {
  /**
   * @function
   * @name parties.index()
   * @description display a list of all parties
   * @param  {HttpRequest} request  a http request
   * @param  {HttpResponse} response a http response
   */
  index: function (request, response, next) {
    Party
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
   * @name parties.create()
   * @description create a new party
   * @param  {HttpRequest} request  a http request
   * @param  {HttpResponse} response a http response
   */
  create: function (request, response, next) {
    //extend party with default pasword
    if (request.body && !request.body.password) {
      request.body.password = request.settings.defaultPassword;
    }

    Party
      .register(request.body, function (error, party) {
        if (error) {
          next(error);
        } else {
          response.created(party);
        }
      });
  },


  /**
   * @function
   * @name parties.show()
   * @description display a specific party
   * @param  {HttpRequest} request  a http request
   * @param  {HttpResponse} response a http response
   */
  show: function (request, response, next) {
    Party
      .findById(request.params.id, function (error, party) {
        if (error) {
          next(error);
        } else {
          response.ok(party);
        }
      });
  },


  /**
   * @function
   * @name parties.update()
   * @description update a specific party
   * @param  {HttpRequest} request  a http request
   * @param  {HttpResponse} response a http response
   */
  update: function (request, response, next) {
    //reference party id
    var id = request.body._id || request.params.id;

    delete request.body._id;

    async.waterfall(
      [
        function encyptPassword(after) {
          if (request.body.password) {
            irinaUtils
              .hash(request.body.password, 10, function (error, hash) {
                request.body.password = hash;
                after(error, request.body);
              });
          } else {
            after(null, request.body);
          }
        },

        function updateParty(party, after) {
          Party
            .findByIdAndUpdate(id, party, {
              new: true
            }, after);
        }
      ],
      function (error, party) {
        if (error) {
          next(error);
        } else {
          response.ok(party);
        }
      });
  },


  /**
   * @function
   * @name parties.destroy()
   * @description delete a specific party
   * @param  {HttpRequest} request  a http request
   * @param  {HttpResponse} response a http response
   */
  destroy: function (request, response, next) {
    Party
      .findByIdAndRemove(
        request.params.id,
        function (error, party) {
          if (error) {
            next(error);
          } else {
            response.ok(party);
          }
        });
  }

};