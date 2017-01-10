'use strict';

/**
 * Application Controller
 *
 * @description :: Server-side logic for managing application controller.
 */

//dependencies
const path = require('path');
const _ = require('lodash');
const async = require('async');
const mongoose = require('mongoose');
const Party = mongoose.model('Party');
const JWT = require(path.join(__dirname, '..', 'libs', 'jwt'));

module.exports = {
  /**
   * @description register provided party details
   * @param  {HttpRequest} request  http request
   * @param  {HttpResponse} response http response
   */
  signup: function (request, response, next) {

    //prevent invalid registration details
    if (_.isEmpty(request.body) || _.isEmpty(request.body.email) ||
      _.isEmpty(request.body.password)) {
      next(new Error('Invalid signup details'));
    }

    //continue with signup
    else {
      Party
        .register(request.body, function (error, party) {
          if (error) {
            next(error);
          } else {
            response.created(party);
          }
        });
    }
  },


  /**
   * @description authenticate provided credentials and generate jwt
   * @param  {HttpRequest} request  http request
   * @param  {HttpResponse} response http response
   */
  signin: function (request, response, next) {

    //prevent invalid signin details
    if (_.isEmpty(request.body) || _.isEmpty(request.body.email) ||
      _.isEmpty(request.body.password)) {
      next(new Error('Invalid signin details'));
    }

    //continue with signin
    else {
      //normalize email
      request.body.email = request.body.email.toLowerCase();

      async.waterfall([

          function authenticateParty(then) {
            //authenticate active party only
            request.body = _.merge(request.body, {
              deletedAt: {
                $eq: null
              }
            });

            Party.authenticate(request.body, then);
          },

          function encodePartyToJWT(party, then) {

            JWT
              .encode(party, function afterEncode(error, jwtToken) {
                if (error) {
                  then(error);
                } else {
                  then(null, {
                    party: _.merge(party.toJSON(), {
                      settings: request.settings
                    }),
                    token: jwtToken
                  });
                }
              });
          }

        ],
        function done(error, result) {
          //fail to authenticate party
          //return error message
          if (error) {
            // Set forbidden status code
            error.status = 403;

            next(error);
          }

          //party authenticated successfully
          //token generated successfully 
          else {
            response.ok({
              success: true,
              party: result.party,
              token: result.token
            });
          }

        });
    }
  },


  /**
   * @description handle party registration confirmation
   * @param  {HttpRequest} request  http request
   * @param  {HttpResponse} response http response
   */
  confirm: function (request, response, next) {

    // prevent put with not data
    if (_.isEmpty(request.body) || _.isUndefined(request.body.token)) {
      next(new Error('Invalid confirmation details'));
    }

    //continue with confirmation
    else {

      Party.confirm(request.body.token, function (error, party) {
        if (error) {
          next(error);
        } else {
          response.ok(party);
        }
      });

    }

  },


  /**
   * @description handle party password recovery request
   * @param  {HttpRequest} request  http request
   * @param  {HttpResponse} response http response
   */
  forgot: function (request, response, next) {
    //prevent put with not data
    if (_.isEmpty(request.body) || _.isUndefined(request.body.email)) {
      next(new Error('Invalid recovery details'));
    }

    //continue with recovery request
    else {

      Party.requestRecover(request.body, function (error, party) {
        if (error) {
          next(error);
        } else {
          response.ok(party);
        }
      });

    }

  },



  /**
   * @description handle recovering party password
   * @param  {HttpRequest} request  http request
   * @param  {HttpResponse} response http response
   */
  recover: function (request, response, next) {
    //prevent put with not data
    if (_.isEmpty(request.body) || _.isUndefined(request.body.token) ||
      _.isUndefined(request.body.password)) {
      next(new Error('Invalid recovery details'));
    }

    //continue with recovery
    else {
      Party.recover(request.body.token, request.body.password, function (
        error, party) {
        if (error) {
          next(error);
        } else {
          response.ok(party);
        }
      });
    }

  },


  /**
   * @description handle unlock party account
   * @param  {HttpRequest} request  http request
   * @param  {HttpResponse} response http response
   */
  change: function (request, response, next) {
    let error = new Error('Invalid password change details');

    //prevent put with not data
    if (_.isEmpty(request.body) || _.isUndefined(request.body._id) ||
      _.isUndefined(request.body.password)) {
      next(error);
    }

    //continue with password change
    else {
      async.waterfall([function findParty(next) {
        Party.findById(request.body._id).exec(next);
      }, function isPartyExists(party, next) {
        if (party) {
          next(null, party);
        } else {
          next(error);
        }
      }, function changePassword(party, next) {
        party.changePassword(request.body.password, next);
      }], function (error, party) {
        if (error) {
          next(error);
        } else {
          response.ok(party);
        }
      });
    }

  },


  /**
   * @description handle unlock party account
   * @param  {HttpRequest} request  http request
   * @param  {HttpResponse} response http response
   */
  unlock: function (request, response, next) {
    //prevent put with not data
    if (_.isEmpty(request.body) || _.isUndefined(request.body.token)) {
      next(new Error('Invalid unlock details'));
    }

    //continue with unlock
    else {
      Party.unlock(request.body.token, function (error, party) {
        if (error) {
          next(error);
        } else {
          response.ok(party);
        }
      });
    }

  },

  /**
   * @description handle heartbearts request
   * @param  {HttpRequest} request  http request
   * @param  {HttpResponse} response http response
   */
  heartbeats: function (request, response /*, next*/ ) {
    //TODO check client API token
    var today = new Date();

    //respond with heartbeat information
    response.ok({
      timestamp: today.getTime()
    });

  }

};
