'use strict';

//dependencies
const _ = require('lodash');
const { parallel } = require('async');
const parseBody = require('auto-parse');
const mongoose = require('mongoose');
const Party = mongoose.model('Party');
const ServiceRequest = mongoose.model('ServiceRequest');
const ChangeLog = mongoose.model('ChangeLog');

// TODO: track action parties last known location on every action

/**
 * ServiceRequest Controller
 *
 * @description :: Server-side logic for managing ServiceRequest.
 */
module.exports = {
  /**
   * @function
   * @name servicerequests.index()
   * @description display a list of all servicerequests
   * @param  {HttpRequest} request  a http request
   * @param  {HttpResponse} response a http response
   */
  index: function (request, response, next) {

    ServiceRequest
      .list(request, function (error, results) {
        if (error) {
          next(error);
        } else {
          //support legacy
          results.servicerequests =
            _.map(results.servicerequests, function (servicerequest) {
              return servicerequest.mapToLegacy();
            });
          response.ok(results);
        }
      });

  },


  /**
   * @function
   * @name servicerequests.create()
   * @description create a new servicerequest
   * @param  {HttpRequest} request  a http request
   * @param  {HttpResponse} response a http response
   */
  create: function (request, response, next) {
    //set operator if not exists
    let body = request.body;

    //ensure service request reporter
    if (body.reporter && _.isString(body.reporter)) {
      body.reporter = parseBody(body.reporter);
    }

    //ensure service request location
    if (body.location && _.isString(body.location)) {
      body.location = parseBody(body.location);
    }

    //ensure service request method
    if (body.method && _.isString(body.method)) {
      body.method = parseBody(body.method);
    }
    body.method = body.method || {};

    //ensure current party exists and is not an app
    const shouldSetOperator =
      (!body.operator && request.party && !request.party.isApp);

    //ensure service request contact method workspace
    const workspace =
      (_.get(body, 'method.workspace') ||
        _.get(request, 'party.relation.workspace'));
    body.method.workspace = workspace;

    //TODO ensure report method name

    if (shouldSetOperator) {
      body.operator = request.party;
    }

    // esnure assigned if assignee available
    if (body.assignee) {
      body.assignedAt = new Date();
    }

    ServiceRequest.createAndTrack(body, function (error, servicerequest) {
      if (error) {
        next(error);
      } else {
        //support legacy
        const _servicerequest = servicerequest.mapToLegacy();

        response.created(_servicerequest);
      }
    });

  },


  /**
   * @function
   * @name servicerequests.show()
   * @description display a specific servicerequest
   * @param  {HttpRequest} request  a http request
   * @param  {HttpResponse} response a http response
   */
  show: function (request, response, next) {
    ServiceRequest
      .show(request, function (error, servicerequest) {
        if (error) {
          next(error);
        } else {
          //support legacy
          const _servicerequest = servicerequest.mapToLegacy();
          response.ok(_servicerequest);
        }
      });
  },


  /**
   * @function
   * @name servicerequests.update()
   * @description update a specific servicerequest
   * @param  {HttpRequest} request  a http request
   * @param  {HttpResponse} response a http response
   */
  update: function (request, response, next) {
    //TODO handle changes made by different party i.e edit(body, {changer})
    //TODO ensure all dirty changelogs has all required details(i.e changer)

    //ensure service request contact method workspace
    const workspace =
      (_.get(request, 'body.method.workspace') ||
        _.get(request, 'body.operator.relation.workspace'));
    request.body = _.merge({}, request.body, { method: { workspace: workspace } });

    //ensure server time in case its confirmed
    if (request.body.confirmedAt) {
      request.body.confirmedAt = new Date();
      request.body.operator = request.body.operator || request.party;
    }

    ServiceRequest
      .edit(request, { ignore: ['changelogs', 'attachments'] }, function (
        error, servicerequest) {
        if (error) {
          next(error);
        } else {
          //support legacy
          const _servicerequest = servicerequest.mapToLegacy();

          response.ok(_servicerequest);
        }
      });
  },


  /**
   * @function
   * @name servicerequests.destroy()
   * @description delete a specific servicerequest
   * @param  {HttpRequest} request  a http request
   * @param  {HttpResponse} response a http response
   */
  destroy: function (request, response, next) {
    ServiceRequest
      .findByIdAndRemove(
        request.params.id,
        function (error, servicerequest) {
          if (error) {
            next(error);
          } else {
            //support legacy
            const _servicerequest = servicerequest.mapToLegacy();
            response.ok(_servicerequest);
          }
        });
  },


  /**
   * @function
   * @name servicerequests.changelogs()
   * @description obtain changelog of specific service request
   * @param  {HttpRequest} request  a http request
   * @param  {HttpResponse} response a http response
   */
  changelogs: function (request, response, next) {

    //TODO merge it on update(patch)

    //obtain _id id
    const _id = request.params.id;
    const changer = request.party;

    //TODO handle other updates

    //obtain changelog
    let changelog =
      _.merge({}, { changer: changer, request: _id }, request.body);
    if (changelog.resolvedAt) {
      changelog.resolvedAt = parseBody(changelog.resolvedAt);
    }

    //ensure server time in case its resolve
    if (changelog.resolvedAt) {
      changelog.resolvedAt = new Date();
      //TODO ensure resolver & assignee
    }

    //ensure server time in case its confirmed
    if (changelog.confirmedAt) {
      changelog.confirmedAt = new Date();
      changelog.operator = changelog.operator || request.party;
    }

    //ensure server time in case its assigned
    if (changelog.assignedAt) {
      changelog.assignedAt = new Date();
    }

    //ensure server time in case its attended
    if (changelog.attendedAt) {
      changelog.attendedAt = new Date();
    }

    //ensure server time in case its completed
    if (changelog.completedAt) {
      changelog.completedAt = new Date();
    }

    //ensure server time in case its verified
    if (changelog.verifiedAt) {
      changelog.verifiedAt = new Date();
    }

    //ensure server time in case its approved
    if (changelog.approvedAt) {
      changelog.approvedAt = new Date();
    }

    //ensure server time in case its approved
    if (changelog.reopenedAt) {
      changelog.reopenedAt = new Date();
      changelog.resolvedAt = null;
    }

    if (changelog.location) {
      changelog.location = parseBody(changelog.location);
    }

    // TODO: refactor
    parallel({
      party: next => {
        if (!changelog.location) { return next(null, null); }
        const optns = {
          _id: changer._id,
          lastKnownLocation: changelog.location,
          lastKnownAddress: changelog.address
        };
        return Party.locate(optns, (error, party) => next(null, party));
      },
      servicerequest: next => {
        return ChangeLog.track(changelog, next);
      }
    }, (error, { servicerequest }) => {
      if (error) {
        next(error);
      } else {
        const legacyRequest = servicerequest.mapToLegacy();
        response.ok(legacyRequest);
      }
    });
  }

};
