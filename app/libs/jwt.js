'use strict';

//dependencies
const _ = require('lodash');
const async = require('async');
const config = require('config');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const Party = mongoose.model('Party');


/**
 * @description Json web token service
 */
exports = module.exports = {
  /**
   * @description encode the given party model to json web token and include
   *              party into the response too
   * @param  {Object}   party    instance of party model
   * @param  {Function} callback a callback to be invoked on result
   */
  encode: function (party, callback) {
    //try to encode party
    //to jwt
    try {
      //payload to put on jwt
      const payload = {
        id: party.id //TODO encrypt id
      };

      //generate jwt
      const token = jwt.sign(
        payload,
        config.get('jwt.secret'),
        _.omit(config.get('jwt'), 'secret')
      );

      callback(null, token);
    }
    //if error occur during encoding
    //return error
    catch (error) {
      callback(error);
    }

  },


  /**
   * @description decode the given token to party instance
   * @param  {String}   token    a valid json web token
   * @param  {Function} callback a callback to be invoked on result
   */
  decode: function (token, callback) {
    async
    .waterfall([
      //verify and decode a token
      function verifyToken(next) {
        jwt
          .verify(
            token,
            config.get('jwt.secret'),
            _.omit(config.get('jwt'), 'secret'),
            next
          );
      },

      function findParty(payload, next) {
        //TODO decrypt id
        Party.findById(payload.id, next);
      },

      function checkIfPartyExists(party, next) {
        if (!party) {
          var error = new Error('Invalid authorization token');
          error.status = 403;
          next(error);
        } else {
          next(null, party);
        }
      }
    ], callback);
  },


  /**
   * @description verify if request conntain authorization header
   * @param  {HttpRequest}   request  A http request
   * @param  {Function} callback A callback to invoke on result
   */
  verify: function (request, callback) {
    //find jwt token from request headers
    //or url params
    //in parallel fashion
    async
    .parallel({
        //deduce token from http request headers
        headerToken: function (next) {
          let token;

          if (request.headers &&
            (request.headers.authorization ||
              request.headers.Authorization)) {

            let authorization = (request.headers.authorization ||
              request.headers.Authorization);

            //split authorization headers
            const parts = authorization.split(' ');
            const scheme = parts[0];

            // is token in the form Bearer token
            if (/^Bearer$/i.test(scheme)) {
              token = parts[1];
            }

            //no 
            //its just a token
            else {
              token = parts[0];
            }
          }

          //return found token
          next(null, token);
        },

        //deduce token from url encoded parameters
        urlToken: function (next) {
          let token;

          if (request.query.token) {
            token = request.query.token;

            // We delete the token from param 
            // to not mess with blueprints
            delete request.query.token;
          }

          //return found token
          next(null, token);
        }
      },
      function (error, results) {
        var token = results.headerToken || results.urlToken;
        if (!token) {
          callback(new Error('Authorization Header Required'));
        } else {
          exports.decode(token, callback);
        }

      });
  }
};
