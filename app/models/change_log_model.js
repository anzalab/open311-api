'use strict';

const _ = require('lodash');
const { waterfall } = require('async');
const { mergeObjects } = require('@lykmapipo/common');
const {
  model,
  createSchema
} = require('@lykmapipo/mongoose-common');
const actions = require('mongoose-rest-actions');
const { plugin: runInBackground } = require('mongoose-kue');
const {
  MODEL_NAME_CHANGELOG,
  VISIBILITY_PRIVATE,
  VISIBILITY_PUBLIC
} = require('@codetanzania/majifix-common');
const Send = require('../libs/send');

// schemas
const { changelogBase } = require('./schemas/base_schema');
const basic = require('./schemas/changelog_basic_schema');
const { changelogParties } = require('./schemas/parties_schema');
const geos = require('./schemas/geos_schema');
const files = require('./schemas/files_schema');
const timestamps = require('./schemas/timestamps_schema');

// definitions
const SCHEMA = mergeObjects(
  changelogBase,
  basic,
  changelogParties,
  geos,
  files,
  timestamps
);
const SCHEMA_OPTIONS = {};
const SCHEMA_PLUGINS = [actions, runInBackground];


//TODO add changelog type i.e status, service, assignment, comment etc
//TODO hook on service request pre validation
//TODO hook on service request pre save
//TODO hook on service request post save
//TODO ensure notification is sent once there are changes
//TODO always sort them in order of update before send them
//TODO notify assignee once changed(previous and current)
//TODO on assignee changed, update request zone from assignee if available
//TODO support attachment changelog(audio, images etc)
//TODO tract reopens, escallations etc


/**
 * @module ChangeLog
 * @name ChangeLog
 * @description A record(log) of a changes on a service request(issue).
 *
 * It may be status change, priority change, assignee change,
 * private comment(internal note) or public comment etc.
 *
 * @see {@link ServiceRequest}
 * @see {@link Status}
 * @see {@link Party}
 * @see {@link Priority}
 * @author lally elias <lallyelias87@mail.com>
 * @since 0.1.0
 * @version 0.1.0
 * @public
 */
const ChangeLogSchema = createSchema(
  SCHEMA,
  SCHEMA_OPTIONS,
  ...SCHEMA_PLUGINS
);


/*
 *------------------------------------------------------------------------------
 * Hooks
 *------------------------------------------------------------------------------
 */

/**
 * @name preValidate
 * @description pre validation logics for changelog
 * @param {Function} next a callback to be called after pre validation logics
 * @since  0.1.0
 * @version 0.1.0
 * @private
 */
ChangeLogSchema.pre('validate', function onPreValidate(next) {

  //always make status change to trigger notification
  //and public viewable
  if (this.status) {
    this.shouldNotify = true;
    this.visibility = VISIBILITY_PUBLIC;
  }

  //continue
  next();

});


/**
 * @name isPublic
 * @description check if current change log is public visible
 * @type {Boolean}
 * @since 0.1.0
 * @version 0.1.0
 * @private
 */
ChangeLogSchema.virtual('isPublic').get(function isPublic() {
  const isPublic = (this.visibility === VISIBILITY_PRIVATE ? false : true);
  return isPublic;
});


/*
 *------------------------------------------------------------------------------
 * Statics
 *------------------------------------------------------------------------------
 */
ChangeLogSchema.statics.MODEL_NAME = MODEL_NAME_CHANGELOG;

/**
 * @name notifyAssignee
 * @type Function
 * @description notify assignee on assigned service request
 * @param {Function} done a callback to invoke on success or failure
 * @return {Object} latest service request
 * @since 0.1.0
 * @version 0.1.0
 * @static
 * @public
 */
ChangeLogSchema.statics.notifyAssignee =
  function notifyAssignee(changelog, servicerequest, done) {
    // refs
    const Party = model('Party');

    // map service request to legacy
    const legacy = servicerequest.mapToLegacy();

    // prepare message content
    const body =
      'Hello, Please assist in resolving assigned customer complaint';

    // initialize message
    const message = {
      subject: [legacy.service.name, legacy.code].join(' - #'),
      body: body
    };

    // send push
    waterfall([
      function findAssignee(next) {
        const id = _.get(changelog, 'assignee._id', changelog.assignee);
        Party.findById(id, next);
      },
      function sendPush(assignee, next) {
        if (assignee && !_.isEmpty(assignee.pushTokens)) {
          message.to = assignee.pushTokens;
          Send.push(message, next);
        } else {
          next(null, null);
        }
      }
    ], function afterNotifyAssignee( /*error, results*/ ) {
      done(null, servicerequest);
    });
  };

/**
 * @name track
 * @type Function
 * @description track service request changelog
 * @param {Object} changes service request latest changes
 * @param {ObjectId} changes.request valid existing service request object id
 * @param {Function} done a callback to invoke on success or failure
 * @return {Object} latest service request
 * @since 0.1.0
 * @version 0.1.0
 * @static
 * @public
 */
ChangeLogSchema.statics.track = function track(changes, done) {

  //ensure changelog
  let changelog = _.merge({}, changes);

  if (!changelog.request) {
    let error = new Error('Missing Service Request Id');
    error.status = 400;
    return done(error);
  }


  //refs
  const ServiceRequest = model('ServiceRequest');
  const ChangeLog = model('ChangeLog');

  waterfall([

    //obtain service requests
    function findServiceRequest(next) {

      ServiceRequest
        .findById(changelog.request)
        .exec(function (error, servicerequest) {

          //ensure service request exists
          if (!servicerequest) {
            error = new Error('Service Request Not Found');
            error.status = 404;
          }

          //continue
          next(error, servicerequest);

        });

    },

    //resolve or reopen
    function resolveOrReopen(servicerequest, next) {

      //check resolvedAt
      if (_.has(changelog, 'resolvedAt')) {

        //clear or set resolve time
        servicerequest.resolvedAt = changelog.resolvedAt;

        // ensure flow timestamps
        if (changelog.resolvedAt) {
          if (!servicerequest.attendedAt) {
            changelog.attendedAt = changelog.resolvedAt;
            servicerequest.attendedAt = changelog.resolvedAt;
          }
          if (!servicerequest.completedAt) {
            changelog.completedAt = changelog.resolvedAt;
            servicerequest.completedAt = changelog.resolvedAt;
          }
          if (!servicerequest.verifiedAt) {
            changelog.verifiedAt = changelog.resolvedAt;
            servicerequest.verifiedAt = changelog.resolvedAt;
          }
          if (!servicerequest.approvedAt) {
            changelog.approvedAt = changelog.resolvedAt;
            servicerequest.approvedAt = changelog.resolvedAt;
          }

          // ensure assignee, assignedAt, team member & zone
          const assignee = changelog.assignee || changelog.changer;
          const zone = assignee.zone;

          if (!servicerequest.assignee) {
            changelog.assignedAt = changelog.resolvedAt;
            changelog.assignee = assignee;
            changelog.member = assignee;
            servicerequest.assignee = assignee;
            servicerequest.assignedAt = changelog.resolvedAt;
          }
          if (!servicerequest.zone && zone) {
            changelog.zone = zone;
            servicerequest.zone = zone;
          }
        }

        if (!changelog.resolvedAt) {

          //clear resolve time
          servicerequest.ttr = undefined;

          // clear flow timestamps
          servicerequest.assignedAt = undefined;
          servicerequest.attendedAt = undefined;
          servicerequest.completedAt = undefined;
          servicerequest.verifiedAt = undefined;
          servicerequest.approvedAt = undefined;

          // TODO clear parties

          //set reopen time
          const reopenedAt = new Date();
          servicerequest.reopenedAt = reopenedAt;
          changelog.reopenedAt = reopenedAt;
        }

      }

      //continue
      next(undefined, servicerequest);

    },

    //compute changes
    function computeChanges(servicerequest, next) {

      //compact changelog
      changelog = _.omitBy(changelog, function (value) {
        return _.isUndefined(value) || _.isNull(value);
      });

      // ensure assigned date if assignee available
      if (changelog.assignee) {
        changelog.assignedAt =
          changelog.assignedAt || changelog.resolvedAt || new Date();
      }

      // ensure zone
      const zone = _.get(changelog, 'assignee.zone', changelog.zone);
      if (zone) {
        changelog.zone = zone;
        servicerequest.zone = zone;
      }

      // compute changelogs
      let changelogs = servicerequest.changes(changelog);
      changelogs = _.map(changelogs, change => {
        change.jurisdiction = change.jurisdiction || servicerequest.jurisdiction;
        change.zone = change.zone || servicerequest.zone;
        change.group = change.group || servicerequest.group;
        change.type = change.type || servicerequest.type;
        change.service = change.service || servicerequest.service;
        change.confirmedAt = servicerequest.confirmedAt;
        return change;
      });

      // merge existing
      changelogs =
        ([].concat(servicerequest.changelogs).concat(changelogs));

      //persists changes
      this.create(changelogs, function (error /*, changelogs*/ ) {
        next(error, servicerequest);
      });

    }.bind(this),

    //update service request
    function updateServiceRequest(servicerequest, next) {
      //update
      _.forEach(changelog, (value, key) => {
        const allowedKey =
          (!_.includes(['image', 'audio', 'video', 'document'], key));
        if (allowedKey) {
          // handle add team member
          if (key === 'member') {
            const team = _.union(servicerequest.team, [].concat(value));
            servicerequest.set('team', team);
          }
          // handle other changes
          else {
            servicerequest.set(key, value);
          }
        }
      });

      //update
      servicerequest.save(function (error /*, servicerequest*/ ) {
        next(error, servicerequest);
      });

    },

    //reload service request
    function reload(servicerequest, next) {
      ServiceRequest
        .findById(changelog.request)
        .exec(next);
    },

    // notify assignee
    function notify(servicerequest, next) {
      // TODO: run in background
      ChangeLog.notifyAssignee(changelog, servicerequest, next);
    }


  ], done);

  //handle resolved
  //handle reopened

};


//TODO post save send notification
//TODO for public comment notify reporter
//TODO for assignment notify assignee
//TODO for escallation notify assignee + jurisdiction
//TODO do not notify private changes(?)


/* export changelog model */
module.exports = model(MODEL_NAME_CHANGELOG, ChangeLogSchema);
