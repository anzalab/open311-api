'use strict';


/**
 * @name changelog
 * @description Extend service request(issue) with capability to track and log
 *              changes such as status change, priority change etc.
 *
 * @see {@link ServiceRequest}
 * @author lally elias <lallyelias87@mail.com>
 * @since 0.1.0
 * @version 0.1.0
 * @public
 * @return {Function} valid mongoose plugin
 */


//global dependencies(or import)
const path = require('path');
const _ = require('lodash');
const async = require('async');
const mongoose = require('mongoose');


//local dependencies(or import)
const ChangeLog =
  require(path.join(__dirname, '..', 'schemas', 'changelog_schema'));


module.exports = exports = function changelog(schema /*, options*/ ) {

  /**
   * @name changes
   * @description compute internal changes of the service request(issue)
   *              for logging in changelogs
   *
   * @param  {Object} changelog latest changes to apply
   * @param  {Party} [changelog.changer] latest party to apply changes to service
   *                                     sequest(issue)
   *
   * @param {String} [changelog.comment] comment(or note) to be added as a
   *                                     descriptive of work performed so far or
   *                                     reply to a reporter
   *
   * @param {Boolean} [changelog.shouldNotify] flag if notification should be send
   *                                           when changes applied
   * @param  {Function} done a callback to invoke on success or failure
   * @return {Object|Object[]} latest changelog(s) to be applied to a
   *                           servicerequest(issue) instance
   * @since  0.1.0
   * @version 0.1.0
   * @private
   * @type {Function}
   */
  schema.methods.changes = function (changelog) {

    //ensure changelog defaults
    changelog = _.merge({}, {
      createdAt: new Date(),
      changer: this.operator
    }, changelog);
    changelog = _.omitBy(changelog, function (value) {
      return _.isUndefined(value) || _.isNull(value);
    });

    //ensure first status is logged(i.e open)
    if (_.isEmpty(this.changelogs)) {
      changelog = {
        request: this,
        createdAt: new Date(),
        status: this.status,
        priority: this.priority,
        changer: this.operator, //TODO handle unattended issue
        visibility: ChangeLog.VISIBILITY_PUBLIC
      };
      return [changelog];
    }

    //continue computing changes
    else {

      //get latest changelog
      const changelogs = _.filter(this.changelogs, function (change) {
        // return _.has(change, 'id');
        return _.isDate(change.createdAt);
      });

      //get latest changes that have not been saved(dirty changes)
      let dirtyChanges = _.filter(this.changelogs, function (change) {
        return !change._id;
      });

      //compute changes

      //record status changes
      const latestStatusChangeLog =
        _.chain(changelogs).orderBy('createdAt', 'desc')
        .find(function (change) {
          return !_.isEmpty(change.status);
        }).value() || {};
      const statusHasChanged =
        (this.status && !this.status.equals(latestStatusChangeLog.status));
      if (statusHasChanged) {
        changelog.status = this.status;
      }

      //record priority changes
      const latestPriorityChangeLog =
        _.chain(changelogs).orderBy('createdAt', 'desc')
        .find(function (change) {
          return !_.isEmpty(change.priority);
        }).value() || {};
      const priorityHasChanged =
        (this.priority && !this.priority.equals(latestPriorityChangeLog.priority));
      if (priorityHasChanged) {
        changelog.priority = this.priority;
      }

      //record assignee changes
      const latestAssigneeChangeLog =
        _.chain(changelogs).orderBy('createdAt', 'desc')
        .find(function (change) {
          return !_.isEmpty(change.assignee);
        }).value() || {};
      const assigneeHasChanged =
        (this.assignee && !this.assignee.equals(latestAssigneeChangeLog.assignee));
      if (assigneeHasChanged) {
        changelog.assignee = this.assignee;
      }

      //record resolve date changes
      if (changelog.resolvedAt || changelog.reopenedAt) {
        changelog =
          _.merge({}, changelog, { visibility: ChangeLog.VISIBILITY_PUBLIC });
      }

      //update dirty changes
      dirtyChanges = _.map(dirtyChanges, function (change) {
        change = _.merge({}, {
          changer: changelog.changer || this.operator
        }, changelog, change); //TODO do we merge changelog or?
        return change;
      }.bind(this));

      //update changelogs
      const isValid = (
        changelog.status || changelog.priority ||
        changelog.assignee || changelog.comment ||
        changelog.resolvedAt || changelog.reopenedAt ||
        changelog.completedAt || changelog.verifiedAt ||
        changelog.approvedAt || changelog.item ||
        changelog.image || changelog.audio ||
        changelog.video || changelog.document ||
        changelog.location
      );
      changelog = isValid ? [].concat(changelog) : [];
      changelog = [].concat(dirtyChanges).concat(changelog);

      //TODO ensure close status is logged(i.e closed)
      //TODO send changelog notification on changelog post save
      return changelog;
    }

  };


  /**
   * @name createAndTrack
   * @function createAndTrack
   * @param {Object} request valid servicerequest payload
   * @param {Function} done a callback to invoke on success or failure
   * @since  0.1.0
   * @version 0.1.0
   * @public
   */
  schema.statics.createAndTrack = function (request, done) {
    //ref
    const ServiceRequest = mongoose.model('ServiceRequest');
    const ChangeLog = mongoose.model('ChangeLog');

    async.waterfall([

      function createServiceRequest(next) {
        ServiceRequest.create(request, next);
      },

      function createInitialChangelog(servicerequest, next) {
        //prepare changelogs
        const changelogs = [{
          request: servicerequest,
          status: servicerequest.status,
          priority: servicerequest.priority,
          changer: servicerequest.operator,
          visibility: ChangeLog.VISIBILITY_PUBLIC,
          createdAt: new Date()
        }];

        //record changelogs
        ChangeLog.create(changelogs, function ( /*error, changelogs*/ ) {
          next(null, servicerequest);
        });

      }
    ], done);

  };

};
