'use strict';


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


//dependencies
const _ = require('lodash');
const async = require('async');
const mongoose = require('mongoose');
const actions = require('mongoose-rest-actions');
const Schema = mongoose.Schema;
const ObjectId = Schema.Types.ObjectId;
const { FileTypes } = require('@lykmapipo/file');


//constants
const VISIBILITY_PUBLIC = 'Public';
const VISIBILITY_PRIVATE = 'Private';
const VISIBILITIES = [VISIBILITY_PRIVATE, VISIBILITY_PUBLIC];


//TODO add changelog type i.e status, service, assignement, comment etc
//TODO hook on service request pre validation
//TODO hook on service request pre save
//TODO hook on service request post save
//TODO ensure notification is sent once there are changes
//TODO always sort them in order of update before send them
//TODO notify assignee once changed(previous and current)
//TODO support attachment changelog(audio, images etc)
//TODO tract reopens, escallations etc


/**
 * @name ChangeLogSchema
 * @type {Schema}
 * @since 0.1.0
 * @version 0.1.0
 * @private
 */
const ChangeLogSchema = new Schema({
  /**
   * @name request
   * @description Associated service request(issue)
   * @type {ServiceRequest}
   * @see {@link ServiceRequest}
   * @since 0.1.0
   * @version 0.1.0
   * @instance
   */
  request: {
    type: ObjectId,
    ref: 'ServiceRequest',
    required: true,
    index: true,
    exists: true,
    hidden: true,
    autopopulate: {
      select: 'code',
      maxDepth: 1
    }
  },


  /**
   * @name status
   * @description A current assigned status of the service request(issue)
   * @type {Status}
   * @see {@link Status}
   * @since 0.1.0
   * @version 0.1.0
   * @instance
   */
  status: {
    type: ObjectId,
    ref: 'Status',
    index: true,
    exists: true,
    autopopulate: {
      select: 'name weight color',
      maxDepth: 1
    }
  },


  /**
   * @name priority
   * @description A current assigned priority of the service request(issue)
   * @type {Priority}
   * @see {@link Priority}
   * @since 0.1.0
   * @version 0.1.0
   * @instance
   */
  priority: {
    type: ObjectId,
    ref: 'Priority',
    index: true,
    exists: true,
    autopopulate: {
      select: 'name weight color',
      maxDepth: 1
    }
  },


  /**
   * @name assignee
   * @description A current assigned party to work on service request(issue)
   * @type {Party}
   * @see {@link Priority}
   * @since 0.1.0
   * @version 0.1.0
   * @instance
   */
  assignee: {
    type: ObjectId,
    ref: 'Party',
    index: true,
    exists: true,
    autopopulate: {
      select: 'name email phone',
      maxDepth: 1
    }
  },


  /**
   * @name changer
   * @description A party who made changes to a servie request(issue)
   * @type {Object}
   * @see {@link Party}
   * @since 0.1.0
   * @version 0.1.0
   * @instance
   */
  changer: {
    type: ObjectId,
    ref: 'Party',
    index: true,
    exists: true,
    autopopulate: {
      select: 'name email phone',
      maxDepth: 1
    }
  },


  /**
   * @name comment
   * @description Additional note for the changes. It may be an internal note
   * telling how far the service request(issue) has been worked on or a message
   * to a reporter.
   *
   * @type {Object}
   * @since 0.1.0
   * @version 0.1.0
   * @instance
   */
  comment: {
    type: String,
    index: true,
    trim: true,
    searchable: true
  },


  /**
   * @name resolvedAt
   * @description Latest time when the service request(issue) was resolved.
   * @type {Object}
   * @since 0.1.0
   * @version 0.1.0
   * @instance
   */
  resolvedAt: {
    type: Date,
    index: true
  },


  /**
   * @name reopenedAt
   * @description Latest time when the service request(issue) was reopened.
   * @type {Object}
   * @private
   * @since 0.1.0
   * @version 0.1.0
   */
  reopenedAt: {
    type: Date,
    index: true
  },

  /**
   * @name completedAt
   * @description A time when the issue was marked as complete(or done) by
   * latest assignee.
   * @type {Object}
   * @private
   * @since 0.1.0
   * @version 0.1.0
   */
  completedAt: {
    type: Date,
    index: true
  },

  /**
   * @name verifiedAt
   * @description A time when the issue was verified by immediate
   * supervisor(technician).
   * @type {Object}
   * @private
   * @since 0.1.0
   * @version 0.1.0
   */
  verifiedAt: {
    type: Date,
    index: true
  },

  /**
   * @name approvedAt
   * @description A time when the issue was approved by final
   * supervisor(engineer).
   * @type {Object}
   * @private
   * @since 0.1.0
   * @version 0.1.0
   */
  approvedAt: {
    type: Date,
    index: true
  },

  /**
   * @name shouldNotify
   * @description Signal to send notification to a service request(issue)
   * reporter using sms, email etc. about work(progress) done so far to resolve
   * the issue.
   *
   * @type {Object}
   * @since 0.1.0
   * @version 0.1.0
   * @instance
   */
  shouldNotify: {
    type: Boolean,
    default: false
  },


  /**
   * @name wasNotificationSent
   * @description Tells if a notification contain a changes was
   * sent to a service request(issue) reporter using sms, email etc.
   * once a service request changed.
   *
   * Note!: status changes trigger a notification to be sent always.
   *
   * @type {Object}
   * @since 0.1.0
   * @version 0.1.0
   * @instance
   */
  wasNotificationSent: {
    type: Boolean,
    default: false
  },


  /**
   * @name visibility
   * @description Signal if this changelog is public or private viewable.
   * Note!: status changes are always public viewable by default.
   *
   * @type {Object}
   * @since 0.1.0
   * @version 0.1.0
   * @instance
   */
  visibility: {
    type: String,
    index: true,
    enum: VISIBILITIES,
    default: VISIBILITY_PRIVATE
  },

  /**
   * @name item
   * @description A item(material, equipment etc) used on work on service
   * request
   * @type {Object}
   * @private
   * @since 0.1.0
   * @version 0.1.0
   */
  item: {
    type: ObjectId,
    ref: 'Predefine',
    exists: true,
    autopopulate: true
  },

  /**
   * @name quantity
   * @description Amount of item(material, equipment etc) used on work
   * on service request
   * @type {Object}
   * @private
   * @since 0.1.0
   * @version 0.1.0
   */
  quantity: {
    type: Number,
    min: 1
  },

  /**
   * @name image
   * @description Associated image for service request(issue) changes
   * @type {Object}
   * @private
   * @since 0.1.0
   * @version 0.1.0
   */
  image: FileTypes.Image,

  /**
   * @name audio
   * @description Associated audio for service request(issue) changes
   * @type {Object}
   * @private
   * @since 0.1.0
   * @version 0.1.0
   */
  audio: FileTypes.Audio,

  /**
   * @name video
   * @description Associated video for service request(issue) changes
   * @type {Object}
   * @private
   * @since 0.1.0
   * @version 0.1.0
   */
  video: FileTypes.Video,

  /**
   * @name document
   * @description Associated document for service request(issue) changes
   * @type {Object}
   * @private
   * @since 0.1.0
   * @version 0.1.0
   */
  document: FileTypes.Document


}, { timestamps: true, emitIndexErrors: true });


//------------------------------------------------------------------------------
// hooks
//------------------------------------------------------------------------------


/**
 * @name preValidate
 * @description pre validation logics for changelog
 * @param {Function} next a callback to be called after pre validation logics
 * @since  0.1.0
 * @version 0.1.0
 * @private
 */
ChangeLogSchema.pre('validate', function (next) {

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
ChangeLogSchema.virtual('isPublic').get(function () {
  const isPublic = (this.visibility === VISIBILITY_PRIVATE ? false : true);
  return isPublic;
});


//------------------------------------------------------------------------------
// statics
//------------------------------------------------------------------------------

ChangeLogSchema.statics.MODEL_NAME = 'ChangeLog';


/* constants */
ChangeLogSchema.statics.VISIBILITY_PRIVATE = VISIBILITY_PRIVATE;
ChangeLogSchema.statics.VISIBILITY_PUBLIC = VISIBILITY_PUBLIC;
ChangeLogSchema.statics.VISIBILITIES = VISIBILITIES;


/**
 * @name track
 * @type Function
 * @description track service request changelogs
 * @param {Object} changes service request latest changes
 * @param {ObjectId} changes.request valid existing service request object id
 * @param {Function} done a callback to invoke on success or failure
 * @return {Object} latest service request
 * @since 0.1.0
 * @version 0.1.0
 * @static
 * @public
 */
ChangeLogSchema.statics.track = function (changes, done) {

  //ensure changelog
  let changelog = _.merge({}, changes);

  if (!changelog.request) {
    let error = new Error('Missing Service Request Id');
    error.status = 400;
    return done(error);
  }


  //refs
  const ServiceRequest = mongoose.model('ServiceRequest');

  async.waterfall([

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
        }

        if (!changelog.resolvedAt) {

          //clear resolve time
          servicerequest.ttr = undefined;

          // clear flow timestamps
          servicerequest.completedAt = undefined;
          servicerequest.verifiedAt = undefined;
          servicerequest.approvedAt = undefined;

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

      //compute changelogs
      let changelogs = servicerequest.changes(changelog);
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
      _.forEach(changelog, function (value, key) {
        servicerequest.set(key, value);
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
    }


  ], done);

  //handle resolved
  //handle reopened

};


//------------------------------------------------------------------------------
// plugins
//------------------------------------------------------------------------------
ChangeLogSchema.plugin(actions);


//TODO post save send notification
//TODO for public comment notify reporter
//TODO for assignment notify assignee
//TODO for escallation notify assignee + jurisdiction
//TODO do not notify private changes(?)


/* export changelog model */
module.exports = mongoose.model('ChangeLog', ChangeLogSchema);
