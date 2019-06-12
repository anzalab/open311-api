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
const ServiceRequest = mongoose.model('ServiceRequest');
const Jurisdiction = mongoose.model('Jurisdiction');
const ServiceGroup = mongoose.model('ServiceGroup');
const Service = mongoose.model('Service');
const Priority = mongoose.model('Priority');
const Status = mongoose.model('Status');
const JWT = require(path.join(__dirname, '..', 'libs', 'jwt'));
const { formatPhoneNumberToE164 } = require('../libs/send');

//TODO refactor out reports to report controller
//TODO export /me to be able to refresh current request party profile

module.exports = {
  /**
   * @description register provided party details
   * @param  {HttpRequest} request  http request
   * @param  {HttpResponse} response http response
   */
  signup: function (request, response, next) {

    //prevent invalid registration details
    if (_.isEmpty(request.body) || _.isEmpty(request.body.password)) {
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
    if (_.isEmpty(request.body) || _.isEmpty(request.body.password)) {
      next(new Error('Invalid signin details'));
    }

    //continue with signin
    else {
      //normalize email
      if (request.body.email) {
        request.body.email = request.body.email.toLowerCase();
      }

      // format phone to E.164
      if (request.body.phone) {
        request.body.phone = formatPhoneNumberToE164(request.body.phone);
      }

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

          //ensure roles & permissions
          function populate(party, then) {
            party.populate('roles', then);
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

  },

  /**
   * @description handle overview request
   * @param  {HttpRequest} request  http request
   * @param  {HttpResponse} response http response
   */
  overviews: function (request, response) {
    ServiceRequest
      .overviews(function (error, overview) {
        if (error) {
          overview = {};
        }
        response.ok(overview);
      });
  },


  /**
   * @description handle summaries request
   * @param  {HttpRequest} request  http request
   * @param  {HttpResponse} response http response
   */
  summaries: function (request, response) {
    //TODO fix jurisdiction criteria filter
    // const criteria = _.merge({}, request.mquery || {});
    const criteria = _.merge({}, _.get(request, 'mquery.filter', {}));

    delete request.mquery.filter.jurisdiction;

    ServiceRequest
      .summary(criteria, function (error, summaries) {
        if (error) {
          summaries = {};
        }
        response.ok(summaries);
      });
  },


  /**
   * @description handle endpoints request
   * @param  {HttpRequest} request  http request
   * @param  {HttpResponse} response http response
   */
  endpoints: function (request, response, next) {
    //TODO fix jurisdiction criteria filter
    const criteria = _.merge({}, _.get(request, 'mquery.filter', {}));

    delete request.mquery.filter.jurisdiction;

    async.parallel({

      jurisdictions: function (next) { //fetch jurisdiction
        request.query.limit = 100;
        if (request.party) {
          request.party.jurisdictions(function (error, jurisdictions) {
            if (_.isEmpty(jurisdictions)) {
              Jurisdiction.list(request, next);
            } else {
              next(error, { jurisdictions });
            }
          });
        } else {
          Jurisdiction.list(request, next);
        }
      },

      servicegroups: function (next) { //fetch service groups
        ServiceGroup.list(request, function (error, results) {
          if (error) {
            next(error);
          } else {
            //support legacy
            results.servicegroups =
              _.map(results.servicegroups, function (servicegroup) {
                const _servicegroup = servicegroup.toObject();
                _servicegroup.name = servicegroup.name.en;
                _servicegroup.description =
                  servicegroup.description.en;
                return _servicegroup;
              });
            next(null, results);
          }
        });
      },

      services: function (next) { //fetch services
        //increase limit
        request.query.limit = 100;
        Service.list(request, function (error, results) {
          if (error) {
            next(error);
          } else {
            //support legacy
            results.services =
              _.map(results.services, function (service) {
                const _service = Service.mapToLegacy(service);
                return _service;
              });
            next(null, results);
          }
        });
      },

      priorities: function (next) { //fetch priorities
        Priority.list(request, function (error, results) {
          if (error) {
            next(error);
          } else {
            //support legacy
            results.priorities =
              _.map(results.priorities, function (priority) {
                const _priority = priority.toObject();
                _priority.name = priority.name.en;
                return _priority;
              });
            next(null, results);
          }
        });
      },

      statuses: function (next) { //fetch statuses
        Status.list(request, function (error, results) {
          if (error) {
            next(error);
          } else {
            //support legacy
            results.statuses =
              _.map(results.statuses, function (status) {
                const _status = status.toObject();
                _status.name = status.name.en;
                return _status;
              });
            next(null, results);
          }
        });
      },

      summaries: function (next) { //fetch issue summaries
        ServiceRequest.summary(criteria, next);
      }

    }, function (error, endpoints) {
      if (error) {
        next(error);
      } else {
        response.ok(endpoints);
      }
    });
  }

};
