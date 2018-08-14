'use strict';

//dependencies
const _ = require('lodash');
const mongoose = require('mongoose');
const ServiceRequest = mongoose.model('ServiceRequest');
const ChangeLog = mongoose.model('ChangeLog');
const config = require('config');
const { downstream, upstream } = config.get('sync.strategies');


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

    //ensure service request method
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

    ServiceRequest.create(body, function (error, servicerequest) {
      if (error) {
        next(error);
      } else {
        //sync
        servicerequest.sync(downstream);

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

    ServiceRequest
      .edit(request, { ignore: ['changelogs', 'attachments'] }, function (
        error, servicerequest) {
        if (error) {
          next(error);
        } else {
          //sync patches
          servicerequest.sync(upstream);

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

    //ensure server time in case its resolve
    if (changelog.resolvedAt) {
      changelog.resolvedAt = new Date();
      //TODO ensure resolver & assignee
    }

    ChangeLog
      .track(changelog, function (error, servicerequest) {
        if (error) {
          next(error);
        } else {
          //sync patches
          servicerequest.sync(upstream);

          //support legacy
          const _servicerequest = servicerequest.mapToLegacy();

          response.ok(_servicerequest);
        }
      });

  }

};
