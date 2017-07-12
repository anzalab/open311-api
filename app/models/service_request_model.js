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


//TODO extract call details to plugin/module to make service request free
//from call center details

//TODO make use of milliseconds to all persisted time
//TODO fix time convertions

//TODO extract open311 methods and properties to a plugin/module to make
//service request free from open311 boilerplates

//TODO extract analysis to plugin/module to free service request from
//analysis boilerplates and improve their spec

//dependencies
const path = require('path');
const _ = require('lodash');
const async = require('async');
// const config = require('config');
// const environment = require('execution-environment');
const moment = require('moment');
const mongoose = require('mongoose');
// const infobip = require('open311-infobip');
const parseMs = require('parse-ms');
const prettyMs = require('pretty-ms');
const Schema = mongoose.Schema;
const ObjectId = Schema.Types.ObjectId;
const GeoJSON = require(path.join(__dirname, 'schemas', 'geojson_schema'));
const MediaSchema = require(path.join(__dirname, 'schemas', 'media_schema'));

//contact methods used for reporting the issue
const CONTACT_METHOD_PHONE_CALL = 'Call';
const CONTACT_METHOD_EMAIL = 'Email';
const CONTACT_METHOD_SMS = 'SMS';
const CONTACT_METHOD_USSD = 'USSD';
const CONTACT_METHOD_VISIT = 'Visit';
const CONTACT_METHOD_LETTER = 'Letter';
const CONTACT_METHOD_FAX = 'Fax';
const CONTACT_METHOD_MOBILE_APP = 'Mobile';

const CONTACT_METHODS = [
  CONTACT_METHOD_PHONE_CALL, CONTACT_METHOD_EMAIL,
  CONTACT_METHOD_SMS, CONTACT_METHOD_USSD, CONTACT_METHOD_VISIT,
  CONTACT_METHOD_LETTER, CONTACT_METHOD_FAX, CONTACT_METHOD_MOBILE_APP
];


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
    autoset: true,
    required: true,
    index: true,
    exists: true,
    autopopulate: {
      select: 'code name phone email domain'
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
    autoset: true,
    exists: true,
    autopopulate: {
      select: 'code name color'
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
    autoset: true,
    exists: true,
    autopopulate: {
      select: 'code name color group' // remove group?
    }
  },


  /**
   * @name call
   * @description log operator call details at a call center
   * @type {Object}
   * @private
   * @since 0.1.0
   * @version 0.1.0
   */
  call: {
    /**
     * @name startedAt
     * @description time when a call received at the call center
     * @type {Object}
     * @private
     * @since 0.1.0
     * @version 0.1.0
     */
    startedAt: {
      type: Date,
      index: true
    },


    /**
     * @name endedAt
     * @description time when a call center operator end the call
     *              and release a reporter
     * @type {Object}
     * @private
     * @since 0.1.0
     * @version 0.1.0
     */
    endedAt: {
      type: Date,
      index: true
    },


    /**
     * @name duration
     * @description call duration in milliseconds from time when call picked up 
     *              to time when a call released by the call center operator.
     *              
     * @type {Object}
     * @private
     * @since 0.1.0
     * @version 0.1.0
     */
    duration: {
      type: Number,
      default: 0,
      index: true
    }
  },


  /**
   * @name reporter
   * @description A party i.e civilian, customer etc which reported an
   *              issue(service request)
   * @type {Object}
   * @see {@link Party}
   * @private
   * @since 0.1.0
   * @version 0.1.0
   */
  reporter: {
    /**
     * @name name
     * @description Full name name of the reporter.
     * @type {Object}
     * @private
     * @since 0.1.0
     * @version 0.1.0
     */
    name: {
      type: String,
      index: true,
      searchable: true
    },


    /**
     * @name phone
     * @description A mobile phone number of the reporter.
     * @type {Object}
     * @private
     * @since 0.1.0
     * @version 0.1.0
     */
    phone: {
      type: String,
      index: true,
      searchable: true
    },


    /**
     * @name email
     * @description An email address of the reporter.
     * @type {Object}
     * @private
     * @since 0.1.0
     * @version 0.1.0
     */
    email: {
      type: String,
      index: true,
      searchable: true
    },


    /**
     * @name account
     * @description A jurisdiction internal associated account id of the
     *              party submitting the request(issue).
     *
     *              This help a jurisdiction to link a reporter with the
     *              internal CRM if available.
     *
     *              When account id is available a reporter will be treated as
     *              a customer and not a normal civilian.
     *
     * @type {Object}
     * @private
     * @since 0.1.0
     * @version 0.1.0
     */
    account: {
      type: String,
      index: true,
      searchable: true
    }
  },


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
    autoset: true,
    exists: true,
    autopopulate: {
      select: 'name email phone'
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
    autoset: true,
    exists: true,
    autopopulate: {
      select: 'name email phone'
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
    searchable: true
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
    // required: true,
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
    searchable: true
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
  method: {
    type: String,
    enum: CONTACT_METHODS,
    default: CONTACT_METHOD_PHONE_CALL,
    index: true,
    searchable: true
  },


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
  location: GeoJSON.Point,


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
    autoset: true,
    exists: true,
    index: true,
    autopopulate: true
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
    autoset: true,
    exists: true,
    index: true,
    autopopulate: true
  },


  /**
   * @name attachments
   * @description Associated file(s) with service request(issue)
   * @type {Array}
   * @see {@link Media}
   * @private
   * @since 0.1.0
   * @version 0.1.0
   */
  attachments: {
    type: [MediaSchema],
    index: true
  },


  /**
   * @name comments
   * @description Associated comment(s) with service request(issue)
   * @type {Array}
   * @see {@link Comment}
   * @private
   * @since 0.1.0
   * @version 0.1.0
   */


  /**
   * @name changes
   * @description Associated status changes(s) with service request(issue)
   * @type {Array}
   * @see {@link StatusChange}
   * @private
   * @since 0.1.0
   * @version 0.1.0
   */


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
   * @name ttr
   * @description A time taken to resolve the issue(service request) in milliseconds.
   *
   *              Used to calculcate Mean Time To Resolve(MTTR) KPI.
   *
   *              It calculated as time taken since the issue reported to the
   *              time when issue resolved.
   *
   * @type {Object}
   * @private
   * @since 0.1.0
   * @version 0.1.0
   * @see {@link http://www.thinkhdi.com/~/media/HDICorp/Files/Library-Archive/Insider%20Articles/mean-time-to-resolve.pdf}
   */
  ttr: { //TODO save ttr as object of d,h,m,s,ms,human
    type: Number,
    index: true,
    default: 0
  }

}, { timestamps: true, emitIndexErrors: true });


//-----------------------------------------------------------------------------
// ServiceRequestSchema Index
//-----------------------------------------------------------------------------


//ensure `2dsphere` on service request location
ServiceRequestSchema.index({ location: '2dsphere' });


//-----------------------------------------------------------------------------
// ServiceRequestSchema Virtuals
//-----------------------------------------------------------------------------

/**
 * @name ttrSeconds
 * @description obtain ttr seconds(s) used
 * @type {Number}
 * @since 0.1.0
 * @version 0.1.0
 */
ServiceRequestSchema.virtual('ttrSeconds').get(function () {

  //parse ttr milliseconds to d,h,m,s
  const parsedMs = parseMs(this.ttr || 0);

  const ttrSeconds = parsedMs.seconds || 0;

  return ttrSeconds;

});

/**
 * @name ttrMinutes
 * @description obtain ttr minute(s) used
 * @type {Number}
 * @since 0.1.0
 * @version 0.1.0
 */
ServiceRequestSchema.virtual('ttrMinutes').get(function () {

  //parse ttr milliseconds to d,h,m,s
  const parsedMs = parseMs(this.ttr || 0);

  const ttrMinutes = parsedMs.minutes || 0;

  return ttrMinutes;

});


/**
 * @name ttrHours
 * @description obtain ttr hour(s) used
 * @type {Number}
 * @since 0.1.0
 * @version 0.1.0
 */
ServiceRequestSchema.virtual('ttrHours').get(function () {

  //parse ttr milliseconds to d,h,m,s
  const parsedMs = parseMs(this.ttr || 0);

  const ttrHours = parsedMs.hours || 0;

  return ttrHours;

});


/**
 * @name ttrDays
 * @description obtain ttr day(s) used
 * @type {Number}
 * @since 0.1.0
 * @version 0.1.0
 */
ServiceRequestSchema.virtual('ttrDays').get(function () {

  //parse ttr milliseconds to d,h,m,s
  const parsedMs = parseMs(this.ttr || 0);

  const ttrDays = parsedMs.days || 0;

  return ttrDays;

});


/**
 * @name ttrHuman
 * @description obtain ttr in human readable format
 * @type {Number}
 * @since 0.1.0
 * @version 0.1.0
 */
ServiceRequestSchema.virtual('ttrHuman').get(function () {

  //parse ttr into human readable d h m s
  const pretifiedMs = prettyMs(this.ttr || 0);

  return pretifiedMs;

});


/**
 * @name callDurationHuman
 * @description obtain call duration in human readable format
 * @type {Number}
 * @since 0.1.0
 * @version 0.1.0
 */
ServiceRequestSchema.virtual('callDurationHuman').get(function () {

  //parse call duration into human readable d h m s
  const pretifiedMs = prettyMs((this.call || {}).duration || 0);

  return pretifiedMs;

});


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


//-----------------------------------------------------------------------------
// ServiceSchema Instance Methods
//-----------------------------------------------------------------------------


/**
 * @name toOpen311
 * @description convert service request instance to Open311 compliant schema
 * @return {Object} open311 compliant service request instance
 * @private
 * @since 0.1.0
 * @version 0.1.0
 * @type {Function}
 */
ServiceRequestSchema.methods.toOpen311 = function () {
  /*jshint camelcase:false*/

  //TODO add all missing fields

  let as311 = {};

  //Unique id of the service request
  as311.service_request_id = this.code;

  //Explanation of why the status was changed to the current state
  //or more details on the current status than conveyed with status alone.
  as311.status_notes = this.status.name; //TODO make use of status description

  //The human readable name of the service request type
  as311.service_name = this.service.name;

  //The unique identifier for the service request type
  as311.service_code = this.service.code;

  //The current status of the service request.
  as311.status = this.status.name;

  //A full description of the request or report submitted.
  as311.description = this.description;

  //The agency responsible for fulfilling or otherwise
  //addressing the service request.
  as311.agency_responsible = '';

  // Information about the action expected to fulfill the request or
  // otherwise address the information reported.
  as311.service_notice = '';

  // The date and time when the service request was made.
  as311.requested_datetime = this.createdAt;

  // The date and time when the service request was last modified.
  // For requests with status=closed, this will be the date the request was closed.
  as311.updated_datetime = this.updatedAt;

  //The date and time when the service request can be expected to be fulfilled.
  //This may be based on a service-specific service level agreement.
  as311.expected_datetime = '';

  //Human readable address or description of location.
  as311.address = this.address;

  //latitude using the (WGS84) projection.
  as311.lat = this.latitude;

  //longitude using the (WGS84) projection.
  as311.long = this.longitude;

  //A URL to media associated with the request, for example an image.
  as311.media_url = '';

  /*jshint camelcase:true*/

  return as311;

};


//-----------------------------------------------------------------------------
// ServiceRequestSchema Hooks
//-----------------------------------------------------------------------------

ServiceRequestSchema.pre('validate', function (next) {

  //ref
  const Counter = mongoose.model('Counter');

  //ensure call times
  this.call = this.call || {};
  this.call.startedAt = this.call.startedAt || new Date();
  this.call.endedAt = this.call.endedAt || new Date();

  //compute call duration in milliseconds
  this.call.duration =
    this.call.endedAt.getTime() - this.call.startedAt.getTime();

  //compute expected time to resolve the issue
  //based on service level agreement
  if (!this.expectedAt && this.service) {
    //obtain sla expected time ttr
    const ttr = _.get(this.service, 'sla.ttr');
    if (ttr) {
      //compute time to when a service request(issue) 
      //is expected to be resolve
      this.expectedAt =
        moment(this.createdAt).add(ttr, 'hours').toDate(); //or h
    }
  }

  //compute time to resolve (ttr) in milliseconds
  if (this.resolvedAt) {
    this.ttr =
      this.resolvedAt.getTime() - this.createdAt.getTime();
  }

  //ensure jurisdiction from service
  const jurisdiction = _.get(this.service, 'jurisdiction');
  if (!this.jurisdiction && jurisdiction) {
    this.jurisdiction = jurisdiction;
  }

  //ensure group from service
  const group = _.get(this.service, 'group');
  if (!this.group && group) {
    this.group = group;
  }

  //set default status & priority if not set
  //TODO preload default status & priority
  //TODO find nearby jurisdiction using request geo data
  if (!this.status || !this.priority || !this.code || _.isEmpty(this.code)) {
    async.parallel({

      jurisdiction: function (then) {
        const Jurisdiction = mongoose.model('Jurisdiction');
        const id = _.get(this.jurisdiction, '_id', this.jurisdiction);
        Jurisdiction.findById(id, then);
      }.bind(this),

      service: function (then) {
        const Service = mongoose.model('Service');
        const id = _.get(this.service, '_id', this.service);
        Service.findById(id, then);
      }.bind(this),

      status: function findDefaultStatus(then) {
        const Status = mongoose.model('Status');
        Status.findDefault(then);
      },
      priority: function findDefaultPriority(then) {
        const Priority = mongoose.model('Priority');
        Priority.findDefault(then);
      }
    }, function (error, result) {
      if (error) {
        next(error);
      } else {
        //set default status and priority
        this.status = (this.status || result.status || undefined);
        this.priority = (this.priority || result.priority || undefined);

        //set service request code
        //in format (Area Code Service Code Year Sequence)
        //i.e ILLK170001
        if (!this.code) {
          Counter
            .generate({
              jurisdiction: result.jurisdiction.code,
              service: result.service.code,
            }, function (error, ticketNumber) {
              if (!error && ticketNumber) {
                this.code = ticketNumber;
                next();
              } else {
                next(error);
              }
            }.bind(this));

        }

        //continue
        else {
          next();
        }

      }
    }.bind(this));

  }

  //continue
  else {
    next();
  }

});


ServiceRequestSchema.post('save', function (doc, next) {
  //refs
  // const Message = mongoose.model('Message');

  //TODO notify customer details to update details based on the account id
  //TODO send service request code to reporter(sms or email)
  //TODO send service request code to area(sms or email)

  //send ticket number to customer
  // const body =
  //   'Your ticket # is ' + doc.code + ' for ' + doc.service.name +
  //   ' you have reported. Thanks.';

  // const message = new Message({
  //   to: doc.reporter.phone, //TODO ensure e.164 format
  //   body: body
  // });

  // infobip.send(message, function (error, result) {
  //   console.log('error', error);
  //   console.log('result', result);
  // });

  next();

});


//-----------------------------------------------------------------------------
// ServiceRequestSchema Static Properties & Methods
//-----------------------------------------------------------------------------

//contact methods constants
ServiceRequestSchema.statics.CONTACT_METHOD_PHONE_CALL =
  CONTACT_METHOD_PHONE_CALL;
ServiceRequestSchema.statics.CONTACT_METHOD_FAX = CONTACT_METHOD_FAX;
ServiceRequestSchema.statics.CONTACT_METHOD_LETTER = CONTACT_METHOD_LETTER;
ServiceRequestSchema.statics.CONTACT_METHOD_VISIT = CONTACT_METHOD_VISIT;
ServiceRequestSchema.statics.CONTACT_METHOD_SMS = CONTACT_METHOD_SMS;
ServiceRequestSchema.statics.CONTACT_METHOD_USSD = CONTACT_METHOD_USSD;
ServiceRequestSchema.statics.CONTACT_METHOD_EMAIL = CONTACT_METHOD_EMAIL;
ServiceRequestSchema.statics.CONTACT_METHOD_MOBILE_APP =
  CONTACT_METHOD_MOBILE_APP;
ServiceRequestSchema.statics.CONTACT_METHODS = CONTACT_METHODS;


/**
 * @name createFromOpen311Client
 * @description create a new service request from open 311 compliant client
 * @return {Object, ServiceRequest}  open 311 compliant issue create response
 *                                   & new instance of service request
 * @since 0.1.0
 * @version 0.1.0
 * @public
 * @type {Function}
 */
ServiceRequestSchema.statics.createFromOpen311Client =
  function (serviceRequest, done) {

    //refs
    const ServiceRequest = this;
    const Service = mongoose.model('Service');

    async.waterfall([

      function ensureServiceExist(next) {
        /*jshint camelcase:false*/

        // find service by request code
        Service
          .findOne({ code: serviceRequest.service_code })
          .exec(function (error, service) {
            if (!service) {
              error = new Error('Service Not Found');
              error.status = 404;
            }

            next(error, service);
          });

        /*jshint camelcase:true*/
      },

      function createServiceRequest(service, next) {
        /*jshint camelcase:false*/

        //check for location presence
        let location;
        if (serviceRequest.long && serviceRequest.lat) {
          location = [serviceRequest.long, serviceRequest.lat];
        }

        //prepare service request
        serviceRequest = {
          service: service,
          reporter: {
            name: [serviceRequest.first_name,
              serviceRequest.last_name
            ].join(''),
            phone: serviceRequest.phone,
            email: serviceRequest.email
          },
          description: serviceRequest.description,
          address: serviceRequest.address_string,
          method: CONTACT_METHOD_MOBILE_APP,
          location: location ? location : undefined
        };

        /*jshint camelcase:false*/

        ServiceRequest.create(serviceRequest, next);
      },

      function prepareOpen311Response(serviceRequest, next) {
        /*jshint camelcase:false*/
        const open311Response = {
          service_request_id: serviceRequest.code,
          service_notice: '' //TODO return acknowledge
        };
        /*jshint camelcase:true*/
        next(null, [open311Response], serviceRequest);
      }

    ], done);

  };


//-----------------------------------------------------------------------------
// ServiceRequestSchema Statistics
//-----------------------------------------------------------------------------


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
    .count({ resolvedAt: { $ne: null } })
    .exec(done);

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
    .count({ resolvedAt: null })
    .exec(done);

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
    .aggregate()
    .lookup({
      from: 'jurisdictions',
      localField: 'jurisdiction',
      foreignField: '_id',
      as: 'jurisdiction'
    })
    .unwind('$jurisdiction')
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
    .aggregate()
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
    .aggregate()
    .lookup({
      from: 'servicegroups',
      localField: 'group',
      foreignField: '_id',
      as: 'group'
    })
    .unwind('$group')
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
    .aggregate()
    .lookup({
      from: 'services',
      localField: 'service',
      foreignField: '_id',
      as: 'service'
    })
    .unwind('$service')
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
    .aggregate()
    .lookup({
      from: 'parties',
      localField: 'operator',
      foreignField: '_id',
      as: 'operator'
    })
    .unwind('$operator')
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
    .aggregate()
    .lookup({
      from: 'status',
      localField: 'status',
      foreignField: '_id',
      as: 'status'
    })
    .unwind('$status')
    .group({
      _id: '$status.name',
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
    .aggregate()
    .lookup({
      from: 'priorities',
      localField: 'priority',
      foreignField: '_id',
      as: 'priority'
    })
    .unwind('$priority')
    .group({
      _id: '$priority.name',
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
    .aggregate()
    .group({
      _id: null,
      duration: { $avg: '$call.duration' }
    })
    .project({ _id: 0, duration: 1 })
    .exec(function (error, durations) {
      //obtain average duration
      let duration = _.first(durations).duration || 0;
      const minuteMilliSeconds = 1000 * 60;

      //convert duration to seconds
      duration = _.round(duration / 1000);

      //convert duration milliseconds to whole seconds used
      let seconds = 0;
      seconds = duration % minuteMilliSeconds;
      seconds = _.round(seconds);

      let minutes = 0;

      //convert duration milliseconds to minutes used
      if (duration > minuteMilliSeconds) {

        //obtain remained fractions after whole minutes
        const mod = duration % minuteMilliSeconds;

        //remove fraction minutes and obtain whole minutes
        minutes = (duration - mod) / minuteMilliSeconds;

      }

      done(error, { minutes, seconds });

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
 */
ServiceRequestSchema.statics.overviews = function (done) {
  //refs
  const ServiceRequest = mongoose.model('ServiceRequest');

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
ServiceRequestSchema.statics.summary = function (done) {

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
        .find({})
        .exec(function (error, services) {
          if (error) {
            done(null, {});
          } else {
            const works = {};
            _.forEach(services, function (service) {
              works[service._id] = function (then) {
                ServiceRequest
                  .count({ service: service._id, resolvedAt: null })
                  .exec(then);
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
            done(null, {});
          } else {
            const works = {};
            _.forEach(statuses, function (status) {
              works[status._id] = function (then) {
                ServiceRequest
                  .count({ status: status._id, resolvedAt: null })
                  .exec(then);
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
            done(null, {});
          } else {
            const works = {};
            _.forEach(priorities, function (priority) {
              works[priority._id] = function (then) {
                ServiceRequest
                  .count({ priority: priority._id, resolvedAt: null })
                  .exec(then);
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
            done(null, {});
          } else {
            const works = {};
            _.forEach(jurisdictions, function (jurisdiction) {
              works[jurisdiction._id] = function (then) {
                ServiceRequest
                  .count({
                    jurisdiction: jurisdiction._id,
                    resolvedAt: null
                  })
                  .exec(then);
              };
            });
            async.parallel(works, next);
          }
        });
    }
  }, done);

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
