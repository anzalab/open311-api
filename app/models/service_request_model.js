'use strict';


/**
 * @module ServiceRequest
 * @name ServiceRequest
 * @description An issue(or service request) reported by civilian(or customer)
 *              e.g Water Leakage occur at a particular area
 *
 * @author lally elias <lallyelias87@mail.com>
 * @since 0.1.0
 * @version 0.1.0
 * @public
 */


//TODO extract analysis to plugin/module to free service request from
//analysis boilerplates and improve their spec

//TODO add source party that will be acting as a collector of the service request
//i.e Call Center Operator, Apps etc

//TODO if resolved and not assigned set assignee to current resolving party

//TODO count re-opens(i.e reopens)

//global dependencies(or imports)
const path = require('path');
const _ = require('lodash');
const async = require('async');
const config = require('config');
const env = require('@lykmapipo/env');
const sync = require('open311-api-sync');
const mongoose = require('mongoose');
const actions = require('mongoose-rest-actions');
const { Point } = require('mongoose-geojson-schemas');
const { FileTypes } = require('@lykmapipo/file');
const parseMs = require('parse-ms');


//local dependencies(or imports)

//plugins
const pluginsPath = path.join(__dirname, 'plugins');
const notification =
  require(path.join(pluginsPath, 'service_request_notification_plugin'));
const aggregate =
  require(path.join(pluginsPath, 'service_request_aggregated_plugin'));
const open311 =
  require(path.join(pluginsPath, 'service_request_open311_plugin'));
const overview =
  require(path.join(pluginsPath, 'service_request_overview_plugin'));
const performance =
  require(path.join(pluginsPath, 'service_request_performance_plugin'));
const pipeline =
  require(path.join(pluginsPath, 'service_request_pipeline_plugin'));
const work =
  require(path.join(pluginsPath, 'service_request_work_plugin'));
const duration =
  require(path.join(pluginsPath, 'service_request_duration_plugin'));
const changelog =
  require(path.join(pluginsPath, 'service_request_changelog_plugin'));
const preValidate =
  require(path.join(pluginsPath, 'service_request_prevalidate_plugin'));


//schemas
const Schema = mongoose.Schema;
const ObjectId = Schema.Types.ObjectId;
const schemaPath = path.join(__dirname, 'schemas');
const Media = require(path.join(schemaPath, 'media_schema'));
const Duration = require(path.join(schemaPath, 'duration_schema'));
const Call = require(path.join(schemaPath, 'call_schema'));
const Reporter = require(path.join(schemaPath, 'reporter_schema'));
const ContactMethod = require(path.join(schemaPath, 'contact_method_schema'));


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
    autopopulate: {
      select: 'code name color',
      maxDepth: 1
    }
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


/**
 * @name longitude
 * @description obtain service request(issue) longitude
 * @type {Number}
 * @since 0.1.0
 * @version 0.1.0
 */
ServiceRequestSchema.virtual('longitude').get(function () {
  return this.location && this.location.coordinates ?
    this.location.coordinates[0] : 0;
});


/**
 * @name latitude
 * @description obtain service request(issue) latitude
 * @type {Number}
 * @since 0.1.0
 * @version 0.1.0
 */
ServiceRequestSchema.virtual('latitude').get(function () {
  return this.location && this.location.coordinates ?
    this.location.coordinates[1] : 0;
});


/**
 * @name changelogs
 * @description obtain service request(issue) changelogs
 * @type {Object}
 * @since 0.1.0
 * @version 0.1.0
 */
ServiceRequestSchema.virtual('changelogs', {
  ref: 'ChangeLog',
  localField: '_id',
  foreignField: 'request',
  autopopulate: true
});


//-----------------------------------------------------------------------------
// ServiceSchema Instance Methods
//-----------------------------------------------------------------------------


/**
 * @name mapToLegacy
 * @description map service request to legacy data structure
 * @param {Function} done  a callback to invoke on success or failure
 * @since  0.1.0
 * @version 0.1.0
 * @public
 * @type {Function}
 */
ServiceRequestSchema.methods.mapToLegacy = function mapToLegacy() {
  const servicerequest = this;
  const object = this.toObject();
  if (servicerequest.group) {
    object.group.name =
      servicerequest.group.name.en;
  }
  if (servicerequest.service) {
    const Service = mongoose.model('Service');
    const service = Service.mapToLegacy(servicerequest.service);
    object.service =
      _.pick(service, ['_id', 'code', 'name', 'color', 'group', 'isExternal']);
  }
  if (servicerequest.priority) {
    object.priority.name =
      servicerequest.priority.name.en;
  }
  if (servicerequest.status) {
    object.status.name =
      servicerequest.status.name.en;
  }
  object.changelogs =
    _.map(servicerequest.changelogs, function (changelog) {
      const _changelog = changelog.toObject();
      if (changelog.priority) {
        _changelog.priority.name =
          changelog.priority.name.en;
      }
      if (changelog.status) {
        _changelog.status.name =
          changelog.status.name.en;
      }
      return _changelog;
    });
  return object;
};


/**
 * @name syncDownstream
 * @description sync service request to local(downstream) server
 * @param {Function} done  a callback to invoke on success or failure
 * @since  0.1.0
 * @version 0.1.0
 * @public
 * @type {Function}
 */
ServiceRequestSchema.methods.syncDownstream = function (done) {

  // obtain sync configurations
  const options = config.get('sync.downstream');

  //check if service isExternal
  // const isExternal = (this.service && this.service.isExternal);

  //check if downstream syncing is enabled
  const isEnabled =
    (options.enabled &&
      !_.isEmpty(options.baseUrl) && !_.isEmpty(options.token));

  //sync down stream
  if (isEnabled) {
    sync.baseUrl = options.baseUrl;
    sync.token = options.token;
    sync.post(this.toObject(), done);
  }

  //no downstream sync back-off
  else {
    done(null, this);
  }

};


/**
 * @name syncUpstream
 * @description sync service request to public(upstream) server
 * @param {Function} done  a callback to invoke on success or failure
 * @since  0.1.0
 * @version 0.1.0
 * @public
 * @type {Function}
 */
ServiceRequestSchema.methods.syncUpstream = function (done) {

  // obtain sync configurations
  const options = config.get('sync.upstream');

  //check if service isExternal
  const isExternal = (this.service && this.service.isExternal);

  //check if upstream syncing is enabled
  const isEnabled =
    (options.enabled &&
      !_.isEmpty(options.baseUrl) && !_.isEmpty(options.token) && isExternal);

  //sync up stream
  if (isEnabled) {
    sync.baseUrl = options.baseUrl;
    sync.token = options.token;
    const toSync = _.merge({}, this.toObject());
    delete toSync.changelogs; //TODO sync public changelogs
    delete toSync.attachments; //TODO sync attachement
    sync.patch(toSync, done);
  }

  //no upstream sync back-off
  else {
    done(null, this);
  }

};


/**
 * @name sync
 * @description try sync service request either to public(upstream) or
 *              local(downstream) server
 * @param {Function} [done]  a callback to invoke on success or failure
 * @since  0.1.0
 * @version 0.1.0
 * @public
 * @type {Function}
 */
ServiceRequestSchema.methods.sync = function (strategy, done) {

  //ensure callback
  done = done || function () {};

  //obtain current execution environment
  const { isProduction } = env;

  //obtain sync strategies
  const { downstream, upstream } = config.get('sync.strategies');

  // check if downstream sync enable
  let options = config.get('sync.downstream');
  let isEnabled =
    (options.enabled &&
      !_.isEmpty(options.baseUrl) && !_.isEmpty(options.token));

  if (strategy === downstream) {

    //sync downstream
    if (isEnabled) {

      //queue & run in background in production
      if (isProduction && this.runInBackground) {
        this.runInBackground({ method: 'syncDownstream' });
      }

      //run synchronous in dev & test environment
      else {
        this.syncDownstream(done);
      }

    }
  }


  // check if upstream sync enable
  options = config.get('sync.upstream');
  isEnabled =
    (options.enabled &&
      !_.isEmpty(options.baseUrl) && !_.isEmpty(options.token));

  if (strategy === upstream) {

    //sync upstream
    if (isEnabled) {

      //queue & run in background in production
      if (isProduction && this.runInBackground) {
        this.runInBackground({ method: 'syncUpstream' });
      }

      //run synchronous in dev & test environment
      else {
        this.syncUpstream(done);
      }

    }
  }

};


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
ServiceRequestSchema.pre('validate', function _preValidate(next) {
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


//-----------------------------------------------------------------------------
// ServiceRequestSchema Plugins
//-----------------------------------------------------------------------------
ServiceRequestSchema.plugin(preValidate);
ServiceRequestSchema.plugin(actions);
ServiceRequestSchema.plugin(notification);
ServiceRequestSchema.plugin(aggregate);
ServiceRequestSchema.plugin(open311);
ServiceRequestSchema.plugin(overview);
ServiceRequestSchema.plugin(performance);
ServiceRequestSchema.plugin(pipeline);
ServiceRequestSchema.plugin(work);
ServiceRequestSchema.plugin(duration);
ServiceRequestSchema.plugin(changelog);


//-----------------------------------------------------------------------------
// ServiceRequestSchema Statistics
//-----------------------------------------------------------------------------

//TODO use new duration format
//TODO use new call format

//TODO implement counts in facet for all counts required
//total
//resolved
//unresolved

/**
 * @name countResolved
 * @description count resolved issues so far
 * @param  {Function} done a callback to be invoked on success or failure
 * @since 0.1.0
 * @version 0.1.0
 * @public
 * @type {Function}
 */
ServiceRequestSchema.statics.countResolved = function (done) {

  //TODO move to aggregation framework to support more operations

  //refs
  const ServiceRequest = mongoose.model('ServiceRequest');

  //count total resolved issue so far
  ServiceRequest
    .aggregated()
    .match({ resolvedAt: { $ne: null } })
    .append({ $count: 'count' })
    .exec(function (error, count) {
      count = (_.first(count) || {}).count || 0;
      done(error, count);
    });

};


/**
 * @name countUnResolved
 * @description count un resolved issues so far
 * @param  {Function} done a callback to be invoked on success or failure
 * @since 0.1.0
 * @version 0.1.0
 * @public
 * @type {Function}
 */
ServiceRequestSchema.statics.countUnResolved = function (done) {

  //TODO move to aggregation framework to support more operations

  //refs
  const ServiceRequest = mongoose.model('ServiceRequest');

  //count total un resolved issue so far
  ServiceRequest
    .aggregated()
    .match({ resolvedAt: { $eq: null } })
    .append({ $count: 'count' })
    .exec(function (error, count) {
      count = (_.first(count) || {}).count || 0;
      done(error, count);
    });

};


/**
 * @name countPerJurisdiction
 * @description count issue reported per jurisdiction
 * @param  {Function} done a callback to be invoked on success or failure
 * @since 0.1.0
 * @version 0.1.0
 * @public
 * @type {Function}
 */
ServiceRequestSchema.statics.countPerJurisdiction = function (done) {

  //refs
  const ServiceRequest = mongoose.model('ServiceRequest');

  //count issue per service
  ServiceRequest
    .aggregated()
    .group({
      _id: '$jurisdiction.name',
      code: { $first: '$jurisdiction.code' },
      color: { $first: '$jurisdiction.color' },
      count: { $sum: 1 }
    })
    .project({ jurisdiction: '$_id', code: '$code', color: '$color', count: '$count' })
    .project({ _id: 0, jurisdiction: 1, code: 1, color: 1, count: 1 })
    .exec(function (error, countPerJurisdiction) {

      done(error, countPerJurisdiction);

    });

};


/**
 * @name countPerMethod
 * @description count issue reported per method
 * @param  {Function} done a callback to be invoked on success or failure
 * @since 0.1.0
 * @version 0.1.0
 * @public
 * @type {Function}
 */
ServiceRequestSchema.statics.countPerMethod = function (done) {

  //refs
  const ServiceRequest = mongoose.model('ServiceRequest');

  //count issue per method used to report
  ServiceRequest
    .aggregated()
    .group({
      _id: '$method',
      count: { $sum: 1 }
    })
    .project({ method: '$_id', count: '$count' })
    .project({ _id: 0, method: 1, count: 1 })
    .exec(function (error, countPerMethod) {

      done(error, countPerMethod);

    });

};


/**
 * @name countPerGroup
 * @description count issue reported per service group(category)
 * @param  {Function} done a callback to be invoked on success or failure
 * @since 0.1.0
 * @version 0.1.0
 * @public
 * @type {Function}
 */
ServiceRequestSchema.statics.countPerGroup = function (done) {

  //refs
  const ServiceRequest = mongoose.model('ServiceRequest');

  //count issue per service group
  ServiceRequest
    .aggregated()
    .group({
      _id: '$group.name',
      color: { $first: '$group.color' },
      count: { $sum: 1 }
    })
    .project({ group: '$_id', color: '$color', count: '$count' })
    .project({ _id: 0, group: 1, color: 1, count: 1 })
    .exec(function (error, countPerGroup) {

      done(error, countPerGroup);

    });

};


/**
 * @name countPerService
 * @description count issue reported per service
 * @param  {Function} done a callback to be invoked on success or failure
 * @since 0.1.0
 * @version 0.1.0
 * @public
 * @type {Function}
 */
ServiceRequestSchema.statics.countPerService = function (done) {

  //refs
  const ServiceRequest = mongoose.model('ServiceRequest');

  //count issue per service
  ServiceRequest
    .aggregated()
    .group({
      _id: '$service.name',
      color: { $first: '$service.color' },
      count: { $sum: 1 }
    })
    .project({ service: '$_id', color: '$color', count: '$count' })
    .project({ _id: 0, service: 1, color: 1, count: 1 })
    .exec(function (error, countPerGroup) {

      done(error, countPerGroup);

    });

};


/**
 * @name countPerOperator
 * @description count issue reported per service
 * @param  {Function} done a callback to be invoked on success or failure
 * @since 0.1.0
 * @version 0.1.0
 * @public
 * @type {Function}
 */
ServiceRequestSchema.statics.countPerOperator = function (done) {

  //refs
  const ServiceRequest = mongoose.model('ServiceRequest');

  //count issue per service
  ServiceRequest
    .aggregated()
    .group({
      _id: '$operator.name',
      count: { $sum: 1 }
    })
    .project({ operator: '$_id', count: '$count' })
    .project({ _id: 0, operator: 1, count: 1 })
    .exec(function (error, countPerOperator) {

      done(error, countPerOperator);

    });

};


/**
 * @name countPerStatus
 * @description count issue reported per status
 * @param  {Function} done a callback to be invoked on success or failure
 * @since 0.1.0
 * @version 0.1.0
 * @public
 * @type {Function}
 */
ServiceRequestSchema.statics.countPerStatus = function (done) {

  //refs
  const ServiceRequest = mongoose.model('ServiceRequest');

  //count issue per method used to report
  ServiceRequest
    .aggregated()
    .group({
      _id: '$status.name.en',
      color: { $first: '$status.color' },
      count: { $sum: 1 }
    })
    .project({ status: '$_id', color: '$color', count: '$count' })
    .project({ _id: 0, status: 1, color: 1, count: 1 })
    .exec(function (error, countPerStatus) {

      done(error, countPerStatus);

    });

};


/**
 * @name countPerPriority
 * @description count issue reported per priority
 * @param  {Function} done a callback to be invoked on success or failure
 * @since 0.1.0
 * @version 0.1.0
 * @public
 * @type {Function}
 */
ServiceRequestSchema.statics.countPerPriority = function (done) {

  //refs
  const ServiceRequest = mongoose.model('ServiceRequest');

  //count issue per method used to report
  ServiceRequest
    .aggregated()
    .group({
      _id: '$priority.name.en',
      color: { $first: '$priority.color' },
      count: { $sum: 1 }
    })
    .project({ priority: '$_id', color: '$color', count: '$count' })
    .project({ _id: 0, priority: 1, color: 1, count: 1 })
    .exec(function (error, countPerPriority) {

      done(error, countPerPriority);

    });

};



/**
 * @name calculateAverageCallDuration
 * @description compute average call duration
 * @param  {Function} done a callback to be invoked on success or failure
 * @since 0.1.0
 * @version 0.1.0
 * @public
 * @type {Function}
 */
ServiceRequestSchema.statics.calculateAverageCallDuration = function (done) {

  //refs
  const ServiceRequest = mongoose.model('ServiceRequest');

  //compute average call duration
  ServiceRequest
    .aggregated()
    .group({
      _id: null,
      duration: { $avg: '$call.duration.milliseconds' }
    })
    .project({ _id: 0, duration: 1 })
    .exec(function (error, durations) {

      //obtain average duration
      let duration = _.first(durations).duration || 0;
      duration = parseMs(duration);

      done(error, duration);

    });

};


/**
 * @name standings
 * @description count issue reported per jurisdiction, per group, per service,
 *              per status, per priority
 * @param  {Function} done a callback to be invoked on success or failure
 * @since 0.1.0
 * @version 0.1.0
 * @public
 * @type {Function}
 */
ServiceRequestSchema.statics.standings = function (criteria, done) {

  //normalize arguments
  if (_.isFunction(criteria)) {
    done = criteria;
    criteria = {};
  }

  //refs
  const ServiceRequest = mongoose.model('ServiceRequest');

  //count issues
  ServiceRequest
    .aggregated(criteria)
    .group({ //1 stage: count per jurisdiction, group, service, status and priority
      _id: {
        jurisdiction: '$jurisdiction.name',
        group: '$group.name.en',
        service: '$service.name.en',
        status: '$status.name.en',
        priority: '$priority.name.en'
      },

      //selected jurisdiction fields
      _jurisdiction: { $first: '$jurisdiction' },

      //select service group fields
      _group: { $first: '$group' },

      //select service fields
      _service: { $first: '$service' },

      //select status fields
      _status: { $first: '$status' },

      //select priority fields
      _priority: { $first: '$priority' },

      count: { $sum: 1 }
    })
    .project({ //2 stage: project only required fields
      _id: 1,
      count: 1,
      _jurisdiction: { name: 1, code: 1, color: 1 },
      _group: { name: 1, code: 1, color: 1 },
      _service: { name: 1, code: 1, color: 1 },
      _status: { name: 1, color: 1, weight: 1 },
      _priority: { name: 1, color: 1, weight: 1 }
    })
    .project({ //3 stage: project full grouped by documents
      _id: 0,
      count: 1,
      jurisdiction: '$_jurisdiction',
      group: '$_group',
      service: '$_service',
      status: '$_status',
      priority: '$_priority'
    })
    .exec(function (error, standings) {

      //map to support legacy
      standings = _.map(standings, function (standing) {
        standing.group.name = standing.group.name.en;
        standing.service.name = standing.service.name.en;
        standing.priority.name = standing.priority.name.en;
        standing.status.name = standing.status.name.en;
        return standing;
      });

      done(error, standings);

    });

};


/**
 * @name overviews
 * @description compute current issue overview/pipeline
 * @param  {Function} done a callback to be invoked on success or failure
 * @since 0.1.0
 * @version 0.1.0
 * @public
 * @type {Function}
 * @deprecated
 */
ServiceRequestSchema.statics.overviews = function (done) {
  //refs
  const ServiceRequest = mongoose.model('ServiceRequest');

  //TODO make use of https://docs.mongodb.com/v3.4/reference/operator/aggregation/facet/

  async.parallel({

    //total, resolved, un-resolved count & average call duration
    issues: function (next) {

      async.parallel({
        total: function (then) {
          ServiceRequest.count({}, then);
        },
        resolved: function (then) {
          ServiceRequest.countResolved(then);
        },
        unresolved: function (then) {
          ServiceRequest.countUnResolved(then);
        },
        averageCallDuration: function (then) {
          ServiceRequest.calculateAverageCallDuration(then);
        }
      }, next);
    },

    //count issue per jurisdiction
    jurisdictions: function (next) {
      ServiceRequest.countPerJurisdiction(next);
    },

    //count issue per method used for reporting
    methods: function (next) {
      ServiceRequest.countPerMethod(next);
    },

    //count issue per service group
    groups: function (next) {
      ServiceRequest.countPerGroup(next);
    },

    //count issue per service
    services: function (next) {
      ServiceRequest.countPerService(next);
    },

    //count issue per operator
    operator: function (next) {
      ServiceRequest.countPerOperator(next);
    },

    //count issue per statuses
    statuses: function (next) {
      ServiceRequest.countPerStatus(next);
    },

    //count issue per priorities
    priorities: function (next) {
      ServiceRequest.countPerPriority(next);
    }

  }, done);
};


/**
 * @name summary
 * @description compute unresolved reported issue count summaries
 * @param  {Function} done a callback to be invoked on success or failure
 * @since 0.1.0
 * @version 0.1.0
 * @public
 * @type {Function}
 */
ServiceRequestSchema.statics.summary = function (criteria, done) {

  //normalize arguments
  if (_.isFunction(criteria)) {
    done = criteria;
    criteria = {};
  }
  criteria = _.merge({}, _.pick(criteria, 'jurisdiction')); //clone criteria

  //references
  const Service = mongoose.model('Service');
  const Status = mongoose.model('Status');
  const Jurisdiction = mongoose.model('Jurisdiction');
  const Priority = mongoose.model('Priority');
  const ServiceRequest = mongoose.model('ServiceRequest');

  //TODO use aggregation
  async.parallel({
    services: function (next) {
      Service
        .find({}) //TODO select for specific jurisdiction
        .exec(function (error, services) {
          if (error) {
            next(null, {});
          } else {
            const works = {};
            _.forEach(services, function (service) {
              works[service._id] = function (then) {
                ServiceRequest
                  .count(
                    _.merge({}, criteria, {
                      service: service._id,
                      resolvedAt: null
                    })
                  ).exec(then);
              };
            });
            async.parallel(works, next);
          }
        });
    },

    statuses: function (next) {
      Status
        .find({})
        .exec(function (error, statuses) {
          if (error) {
            next(null, {});
          } else {
            const works = {};
            _.forEach(statuses, function (status) {
              works[status._id] = function (then) {
                ServiceRequest
                  .count(
                    _.merge({}, criteria, {
                      status: status._id,
                      resolvedAt: null
                    })
                  ).exec(then);
              };
            });
            async.parallel(works, next);
          }
        });
    },

    priorities: function (next) {
      Priority
        .find({})
        .exec(function (error, priorities) {
          if (error) {
            next(null, {});
          } else {
            const works = {};
            _.forEach(priorities, function (priority) {
              works[priority._id] = function (then) {
                ServiceRequest
                  .count(
                    _.merge({}, criteria, {
                      priority: priority._id,
                      resolvedAt: null
                    })
                  ).exec(then);
              };
            });
            async.parallel(works, next);
          }
        });
    },

    jurisdictions: function (next) {
      Jurisdiction
        .find({})
        .exec(function (error, jurisdictions) {
          if (error) {
            next(null, {});
          } else {
            const works = {};
            _.forEach(jurisdictions, function (jurisdiction) {
              works[jurisdiction._id] = function (then) {
                ServiceRequest
                  .count(
                    _.merge({}, criteria, {
                      jurisdiction: jurisdiction._id,
                      resolvedAt: null
                    })
                  ).exec(then);
              };
            });
            async.parallel(works, next);
          }
        });
    }
  }, function (error, results) {
    done(error, results);
  });

};


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

  //refs
  const ServiceRequest = this;

  //normalize arguments
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
module.exports = mongoose.model('ServiceRequest', ServiceRequestSchema);
