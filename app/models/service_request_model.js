'use strict';


/**
 * @module ServiceRequest
 * @name ServiceRequest
 * @description An issue(or service request) reported by civilian(or customer)
 *              e.g Water Leakage occur at a particular area
 *
 * @author lally elias <lallyelias87@gmail.com>
 * @since 0.1.0
 * @version 0.1.0
 * @public
 */

/**
 * Reporting Steps:
 * 0. ensure reporter
 * 0. ensure operator
 * 0. ensure assignee
 * 1. receive issue from reporter
 *  1.1 ensure reporter details(account etc) from previous details
 * 2. ensure jurisdiction
 *  2.1 ensure from issue coordinates
 *  2.2 ensure from reporter account
 *  2.2 ensure from default
 * 3. ensure zone(neighbourhood)
 *  3.1 Ensure zone from operator
 *  3.2 Ensure zone from assignee
 * 4. ensure group
 * 5. ensure type
 * 6. ensure service
 * 7. ensure status
 * 8. ensure priority
 * 8. ensure code(ticket number)
 * 9. save issue
 *  9.1 Generate reported changelog
 * 10. send reporter notifications
 *   10.1 generate ticket sent changelog
 * 11. send jurisdiction notifications
 *   11.1 generate jurisdiction notification changelog
 * 12. send assignee notification
 *   12.1 generate assignee notifiction changelog
 * 13.
 */

/**
 * Changelog Steps:
 * 0. ensure issue
 * 0. ensure changer
 * 1. calculate changelogs
 * 2. update service request
 * 3. save changelogs
 * 4. send notification to reporter
 * 5. send notification to assignee
 * 6. send notification to jurisdiction
 * 7. send notification to supervisor
 * 7. send notification to team
 * 7.
 */

//global dependencies(or imports)
const _ = require('lodash');
const mongoose = require('mongoose');
const { model } = require('@lykmapipo/mongoose-common');
const actions = require('mongoose-rest-actions');
const { Point } = require('mongoose-geojson-schemas');
const { Predefine } = require('@lykmapipo/predefine');
const { FileTypes } = require('@lykmapipo/file');

//local dependencies(or imports)

//plugins
const notification = require('./plugins/service_request_notification_plugin');
const open311 = require('./plugins/service_request_open311_plugin');
const overview = require('./plugins/service_request_overview_plugin');
const performance = require('./plugins/service_request_performance_plugin');
const pipeline = require('./plugins/service_request_pipeline_plugin');
const work = require('./plugins/service_request_work_plugin');
const duration = require('./plugins/service_request_duration_plugin');
const changelog = require('./plugins/service_request_changelog_plugin');
const preValidate = require('./plugins/service_request_prevalidate_plugin');
const legacy = require('./plugins/service_request_legacy_plugin');
const statistics = require('./plugins/service_request_statistics_plugin');


//schemas
const Schema = mongoose.Schema;
const ObjectId = Schema.Types.ObjectId;
const Media = require('./schemas/media_schema');
const Duration = require('./schemas/duration_schema');
const Call = require('./schemas/call_schema');
const Reporter = require('./schemas/reporter_schema');
const ContactMethod = require('./schemas/contact_method_schema');


/**
 * @name ServiceRequestSchema
 * @type {Schema}
 * @since 0.1.0
 * @version 0.1.0
 * @private
 */
const ServiceRequestSchema = new Schema({

  /**
   * @name jurisdiction
   * @description A jurisdiction responsible in handling service
   *              request(issue)
   *
   * @type {Object}
   * @see {@link Jurisdiction}
   * @private
   * @since 0.1.0
   * @version 0.1.0
   */
  jurisdiction: {
    type: ObjectId,
    ref: 'Jurisdiction',
    required: true,
    index: true,
    exists: true,
    // exists: { default: true, match: { default: true }, select: { name: 1 } }
    aggregatable: { unwind: true },
    autopopulate: {
      select: 'code name phone email website',
      maxDepth: 1
    }
  },

  /**
   * @name zone
   * @description A jurisdiction zone(or branch, neighbourhood) responsible
   * in handling service request(issue)
   *
   * @type {Object}
   * @private
   * @since 0.1.0
   * @version 0.1.0
   */
  zone: {
    type: ObjectId,
    ref: 'Predefine',
    index: true,
    exists: true,
    autopopulate: {
      select: 'code name'
    }
  },

  /**
   * @name group
   * @description A service group undewhich request(issue) belongs to
   * @type {Object}
   * @see {@link Service}
   * @private
   * @since 0.1.0
   * @version 0.1.0
   */
  group: {
    type: ObjectId,
    ref: 'ServiceGroup',
    required: true,
    index: true,
    exists: true,
    aggregatable: { unwind: true },
    autopopulate: {
      select: 'code name color',
      maxDepth: 1
    }
  },


  /**
   * @name type
   * @description A service type underwhich request(issue) belongs to
   * @type {Object}
   * @see {@link Service}
   * @private
   * @since 0.1.0
   * @version 0.1.0
   */
  type: {
    type: ObjectId,
    ref: Predefine.MODEL_NAME,
    // required: true,
    exists: true,
    aggregatable: { unwind: true },
    autopopulate: Predefine.OPTION_AUTOPOPULATE,
    index: true,
  },


  /**
   * @name service
   * @description A service undewhich request(issue) belongs to
   * @type {Object}
   * @see {@link Service}
   * @private
   * @since 0.1.0
   * @version 0.1.0
   */
  service: {
    type: ObjectId,
    ref: 'Service',
    required: true,
    index: true,
    exists: true,
    aggregatable: { unwind: true },
    autopopulate: {
      select: 'code name color group isExternal', // remove group?
      maxDepth: 1
    }
  },


  /**
   * @name call
   * @description log operator call details at a call center
   * @type {CallSchema}
   * @see {@link Party}
   * @private
   * @since 0.1.0
   * @version 0.1.0
   * @deprecated
   */
  call: Call,


  /**
   * @name reporter
   * @description A party i.e civilian, customer etc which reported an
   *              issue(service request)
   * @type {Object}
   * @see {@link Reporter}
   * @private
   * @since 0.1.0
   * @version 0.1.0
   */
  reporter: Reporter, //TODO refactor to party


  /**
   * @name operator
   * @description A party oversee the work on the service request(issue).
   *
   *              It also a party that is answerable for the progress and
   *              status of the service request(issue) to a reporter.
   *
   *              For jurisdiction that own a call center, then operator is
   *              a person who received a call.
   *
   * @type {Object}
   * @see {@link Party}
   * @private
   * @since 0.1.0
   * @version 0.1.0
   */
  operator: {
    type: ObjectId,
    ref: 'Party',
    index: true,
    exists: true,
    aggregatable: { unwind: true },
    autopopulate: {
      select: 'name email phone avatar',
      maxDepth: 1
    }
  },


  /**
   * @name assignee
   * @description A party assigned to work on the service request(issue).
   *
   *              It also a party that is answerable for the progress and
   *              status of the service request(issue) to operator and overall
   *              jurisdiction administrative structure.
   *
   * @type {Object}
   * @see {@link Party}
   * @private
   * @since 0.1.0
   * @version 0.1.0
   */
  assignee: {
    type: ObjectId,
    ref: 'Party',
    index: true,
    exists: true,
    aggregatable: { unwind: true },
    autopopulate: {
      select: 'name email phone',
      maxDepth: 1
    }
  },


  /**
   * @name code
   * @description A unique human readable identifier of the
   *              service request(issue).
   *
   *              It mainly used by reporter to query for status and
   *              progress of the reported issue
   *
   * @type {Object}
   * @private
   * @since 0.1.0
   * @version 0.1.0
   */
  code: {
    type: String,
    unique: true,
    required: true,
    trim: true,
    uppercase: true,
    searchable: true,
    taggable: true
  },


  /**
   * @name description
   * @description A detailed human readable explanation about the
   *              service request(issue)
   *
   * @type {Object}
   * @private
   * @since 0.1.0
   * @version 0.1.0
   */
  description: {
    type: String,
    index: true,
    trim: true,
    required: true,
    searchable: true
  },


  /**
   * @name address
   * @description A human entered address or description of location
   *              where service request(issue) happened.
   *
   * @type {Object}
   * @private
   * @since 0.1.0
   * @version 0.1.0
   */
  address: {
    type: String,
    trim: true,
    index: true,
    searchable: true,
    taggable: true
  },


  /**
   * @name method
   * @description A communication(contact) method(mechanism) used by a reporter
   *              to report the issue
   *
   * @type {Object}
   * @private
   * @since 0.1.0
   * @version 0.1.0
   */
  method: ContactMethod,


  /**
   * @name location
   * @description A longitude and latitude pair of the location of a
   *              service request(issue).
   *
   *             The order of adding longitude and latitude in the array must
   *             be <longitude> , <latitude> and not otherwise.
   *
   *
   * @type {Object}
   * @see  {@link https://docs.mongodb.com/manual/applications/geospatial-indexes/}
   * @see {@link https://docs.mongodb.com/manual/reference/operator/query-geospatial/}
   * @private
   * @since 0.1.0
   * @version 0.1.0
   */
  location: Point, //TODO set to jurisdiction geo point if non provided


  /**
   * @name status
   * @description A current status of the service request(issue)
   * @type {Object}
   * @private
   * @since 0.1.0
   * @version 0.1.0
   */
  status: {
    type: ObjectId,
    ref: 'Status',
    index: true,
    exists: true,
    aggregatable: { unwind: true },
    autopopulate: {
      maxDepth: 1
    }
  },


  /**
   * @name priority
   * @description A priority of the service request(issue).
   *
   *              It used to weight a service request(issue) relative
   *              to other(s).
   *
   * @type {Object}
   * @private
   * @since 0.1.0
   * @version 0.1.0
   */
  priority: {
    type: ObjectId,
    ref: 'Priority',
    index: true,
    exists: true,
    aggregatable: { unwind: true },
    autopopulate: {
      maxDepth: 1
    }
  },


  /**
   * @name attachments
   * @description Associated file(s) with service request(issue)
   * @type {Array}
   * @see {@link MediaSchema}
   * @private
   * @since 0.1.0
   * @version 0.1.0
   * @deprecated
   */
  attachments: { // TODO: deprecate and use image, audio and video files
    type: [Media],
    index: true
  },

  /**
   * @name image
   * @description Associated image for service request(issue)
   * @type {Object}
   * @private
   * @since 0.1.0
   * @version 0.1.0
   */
  image: FileTypes.Image,

  /**
   * @name audio
   * @description Associated audio for service request(issue)
   * @type {Object}
   * @private
   * @since 0.1.0
   * @version 0.1.0
   */
  audio: FileTypes.Audio,

  /**
   * @name video
   * @description Associated video for service request(issue)
   * @type {Object}
   * @private
   * @since 0.1.0
   * @version 0.1.0
   */
  video: FileTypes.Video,

  /**
   * @name document
   * @description Associated document for service request(issue)
   * @type {Object}
   * @private
   * @since 0.1.0
   * @version 0.1.0
   */
  document: FileTypes.Document,

  /**
   * @name confirmedAt
   * @description A time when the issue received from other
   * channels(i.e not call center or customer care desk) confirmed.
   *
   * @type {Object}
   * @private
   * @since 0.1.0
   * @version 0.1.0
   */
  confirmedAt: {
    type: Date,
    index: true
  },

  /**
   * @name expectedAt
   * @description A time when the issue is expected to be resolved.
   *
   *              Computed by adding expected hours to resolve issue to the
   *              reporting time of the issue i.e (createdAt + service.sla.ttr in hours).
   *
   * @type {Object}
   * @private
   * @since 0.1.0
   * @version 0.1.0
   */
  expectedAt: {
    type: Date,
    index: true
  },


  /**
   * @name resolvedAt
   * @description A time when the issue was resolved
   * @type {Object}
   * @private
   * @since 0.1.0
   * @version 0.1.0
   */
  resolvedAt: {
    type: Date,
    index: true
  },


  /**
   * @name reopenedAt
   * @description A time when the issue was reopened
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
   * @name assignedAt
   * @description A latest time when the issue was assigned to latest assignee
   * to work on it.
   * @type {Object}
   * @private
   * @since 0.1.0
   * @version 0.1.0
   */
  assignedAt: {
    type: Date,
    index: true
  },

  /**
   * @name attendedAt
   * @description A latest time when the issue was marked as
   * work in progress by latest assignee.
   * @type {Object}
   * @private
   * @since 0.1.0
   * @version 0.1.0
   */
  attendedAt: {
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
   * @name ttr
   * @description A time taken to resolve the issue(service request) in duration format.
   *
   *              Used to calculcate Mean Time To Resolve(MTTR) KPI.
   *
   *              It calculated as time taken since the issue reported to the
   *              time when issue resolved.
   *
   * @type {Duration}
   * @see {@link DurationSchema}
   * @private
   * @since 0.1.0
   * @version 0.1.0
   * @see {@link http://www.thinkhdi.com/~/media/HDICorp/Files/Library-Archive/Insider%20Articles/mean-time-to-resolve.pdf}
   */
  ttr: Duration,

  /**
   * @name changelogs
   * @description Associated change(s) on service request(issue)
   * @type {Array}
   * @see {@link ChangeLog}
   * @private
   * @since 0.1.0
   * @version 0.1.0
   */
}, { timestamps: true, emitIndexErrors: true });


//-----------------------------------------------------------------------------
// ServiceRequestSchema Virtuals
//-----------------------------------------------------------------------------



//-----------------------------------------------------------------------------
// ServiceSchema Instance Methods
//-----------------------------------------------------------------------------



//-----------------------------------------------------------------------------
// ServiceRequestSchema Hooks
//-----------------------------------------------------------------------------


/**
 * @name preValidate
 * @function preValidate
 * @description pre validation logics for service request
 * @param {Function} next a callback to be called after pre validation logics
 * @since 0.1.0
 * @version 0.1.0
 * @private
 */
ServiceRequestSchema.pre('validate', function onPreValidate(next) {
  this.preValidate(next);
});


//-----------------------------------------------------------------------------
// ServiceRequestSchema Static Properties & Methods
//-----------------------------------------------------------------------------

ServiceRequestSchema.statics.MODEL_NAME = 'ServiceRequest';


//contact methods constants
ServiceRequestSchema.statics.CONTACT_METHOD_PHONE_CALL =
  ContactMethod.PHONE_CALL;
ServiceRequestSchema.statics.CONTACT_METHOD_FAX = ContactMethod.FAX;
ServiceRequestSchema.statics.CONTACT_METHOD_LETTER = ContactMethod.LETTER;
ServiceRequestSchema.statics.CONTACT_METHOD_VISIT = ContactMethod.VISIT;
ServiceRequestSchema.statics.CONTACT_METHOD_SMS = ContactMethod.SMS;
ServiceRequestSchema.statics.CONTACT_METHOD_USSD = ContactMethod.USSD;
ServiceRequestSchema.statics.CONTACT_METHOD_EMAIL = ContactMethod.EMAIL;
ServiceRequestSchema.statics.CONTACT_METHOD_MOBILE_APP =
  ContactMethod.MOBILE_APP;
ServiceRequestSchema.statics.CONTACT_METHODS = ContactMethod.METHODS;
ServiceRequestSchema.statics.WEB_CONTACT_METHODS = ContactMethod.WEB_METHODS;


//-----------------------------------------------------------------------------
// ServiceRequestSchema Plugins
//-----------------------------------------------------------------------------
ServiceRequestSchema.plugin(preValidate);
ServiceRequestSchema.plugin(legacy);
ServiceRequestSchema.plugin(actions);
ServiceRequestSchema.plugin(notification);
ServiceRequestSchema.plugin(open311);
ServiceRequestSchema.plugin(overview);
ServiceRequestSchema.plugin(performance);
ServiceRequestSchema.plugin(pipeline);
ServiceRequestSchema.plugin(work);
ServiceRequestSchema.plugin(duration);
ServiceRequestSchema.plugin(changelog);
ServiceRequestSchema.plugin(statistics);


//-----------------------------------------------------------------------------
// ServiceRequestSchema Statistics
//-----------------------------------------------------------------------------


/**
 * @name getPhones
 * @function getPhones
 * @description pull distinct service request reporter phones
 * @param {Object} [criteria] valid query criteria
 * @param {function} done a callback to invoke on success or error
 * @return {String[]|Error}
 * @since 0.1.0
 * @version 0.1.0
 * @static
 */
ServiceRequestSchema.statics.getPhones = function getPhones(criteria, done) {

  // refs
  const ServiceRequest = this;

  // normalize arguments
  const _criteria = _.isFunction(criteria) ? {} : _.merge({}, criteria);
  const _done = _.isFunction(criteria) ? criteria : done;

  ServiceRequest
    .find(_criteria)
    .distinct('reporter.phone')
    .exec(function onGetPhones(error, phones) {
      if (!error) {
        phones = _.uniq(_.compact([].concat(phones)));
      }
      return _done(error, phones);
    });

};


/**
 * @name ServiceRequest
 * @description register ServiceRequestSchema and initialize ServiceRequest
 *              model
 * @type {Model}
 * @since 0.1.0
 * @version 0.1.0
 * @public
 */
module.exports = model('ServiceRequest', ServiceRequestSchema);
