'use strict';

//dependencies
const _ = require('lodash');
const async = require('async');
const mongoose = require('mongoose');
const Party = mongoose.model('Party');
const irinaUtils = require('irina/lib/utils.js');
const { toE164 } = require('@lykmapipo/phone');


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

    //TODO check why mongoose-hidden does not hide password
    request.mquery.select = _.merge({}, { password: 0 }, request.mquery.select);

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

    // format phone to E.164
    if (request.body.phone) {
      request.body.phone = toE164(request.body.phone);
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
      .show(request, function (error, party) {
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
    request.body.jurisdiction = request.body.jurisdiction || null;
    request.body.zone = request.body.zone || null;

    // format phone to E.164
    if (request.body.phone) {
      request.body.phone = toE164(request.body.phone);
    }

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
   * @name parties.updateDevices()
   * @description update a specific party devices details
   * @param  {HttpRequest} request  a http request
   * @param  {HttpResponse} response a http response
   */
  updateDevices: function (request, response, next) {
    // ensure body
    const body = _.merge({ extras: {} }, request.body);

    // obtain party id
    const id = body.extras.party;

    //prepare push token updates
    const pushTokens = _.compact([body.registrationToken]);

    // update party and echo device details
    Party.put(id, { pushTokens }, function (error /*, party*/ ) {
      if (error) {
        next(error);
      } else {
        response.ok(body);
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
      .findByIdAndRemove(request.params.id, function (error, party) {
        if (error) {
          next(error);
        } else {
          response.ok(party);
        }
      });
  },


  //-----------------------------------------------------------------------------
  // Analytics
  //-----------------------------------------------------------------------------



  /**
   * @function
   * @name parties.performances()
   * @description computes a specific party performances
   * @param  {HttpRequest} request  a http request
   * @param  {HttpResponse} response a http response
   */
  performances: function (request, response, next) {

    //obtain party id
    const party = (request.params.id || request.party);

    //prepare options
    const options = _.merge({}, { party: party }, request.query);

    Party
      .performances(options, function (error, performances) {
        if (error) {
          next(error);
        } else {
          response.ok(performances);
        }
      });
  }

};
