'use strict';

//dependencies
const _ = require('lodash');
const async = require('async');
const mongoose = require('mongoose');
const ServiceRequest = mongoose.model('ServiceRequest');
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

        response.created(servicerequest);
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
          response.ok(servicerequest);
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

          response.ok(servicerequest);
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
            response.ok(servicerequest);
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
    let changelog = _.merge({}, { changer: changer }, request.body);

    //ensure server time in case its resolve
    if (changelog.resolvedAt) {
      changelog.resolvedAt = new Date();
      //TODO ensure resolver & assignee
    }

    async.waterfall([

      function findServiceRequest(then) {
        ServiceRequest.findById(_id, { changelogs: 0 }).exec(then);
      },

      function resolveOrReopen(servicerequest, then) {

        if (_.has(changelog, 'resolvedAt')) {
          //clear or set resolve time
          servicerequest.resolvedAt = changelog.resolvedAt;

          if (!changelog.resolvedAt) {

            //clear resolve time
            servicerequest.ttr = undefined;

            //set reopen time
            const reopenedAt = new Date();
            servicerequest.reopenedAt = new Date();
            changelog.reopenedAt = reopenedAt;
          }

        }

        servicerequest.save(function (error, updated) {
          then(error, updated);
        });

      },

      function reload(servicerequest, then) {
        ServiceRequest.findById(_id).exec(then);
      },

      function computeChanges(servicerequest, then) { //TODO FIX: array sub-doc save
        if (!servicerequest) {
          let error = new Error('Service Request Not Found');
          error.status = 404;
          then(error);
        } else {
          changelog = _.omitBy(changelog, function (value) {
            return _.isUndefined(value) || _.isNull(value);
          });
          let changelogs = servicerequest.changes(changelog);
          console.log(changelogs);
          changelogs =
            ([].concat(servicerequest.changelogs).concat(changelogs));
          console.log(changelogs);
          changelogs = _.sortBy(changelogs, 'createdAt');
          console.log(changelogs);
          const changes = _.merge({}, changelog, { changelogs: changelogs });
          ServiceRequest
            .findByIdAndUpdate(_id, changes, { new: true })
            .exec(then);
        }
      },

      function reload(servicerequest, then) { //TODO notify resolved
        ServiceRequest.findById(_id).exec(then);
      }

    ], function (error, servicerequest) {
      if (error) {
        next(error);
      } else {
        //sync patches
        servicerequest.sync(upstream);

        response.ok(servicerequest);
      }
    });

  }

};
