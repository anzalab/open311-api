'use strict';


/**
 * @module ServiceRequest
 * @name ServiceRequest
 * @description An issue(or service request) reported by civilian 
 *              e.g Water Leakage occur at a particular area
 *              
 * @author lally elias <lallyelias87@mail.com>
 * @since 0.1.0
 * @version 0.1.0
 * @public
 */


//TODO make service request to support call log in a call center
//TODO migrate location to use GeoJSON schema
//TODO obtain geo-data from jurisdiction if not available(or set)
//TODO add service group


//dependencies
const path = require('path');
const _ = require('lodash');
const async = require('async');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ObjectId = Schema.Types.ObjectId;
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
      select: 'code name domain'
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
      select: 'code name color group'
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
     * @description call duration in minutes from time when call picke up to
     *              time when a call released by the call center operator
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
     *              internal CRM.
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
   *              status of the service request(issue).
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
    index: true
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
  location: {
    type: [Number],
    index: '2dsphere'
  },


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
   * @description A time taken to resolve the issue(service request) in seconds.
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
  ttr: {
    type: Number,
    index: true,
    default: 0
  }

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
  return this.location ? this.location[0] : null;
});


/**
 * @name latitude
 * @description obtain service request(issue) latitude
 * @type {Number}
 * @since 0.1.0
 * @version 0.1.0
 */
ServiceRequestSchema.virtual('latitude').get(function () {
  return this.location ? this.location[1] : null;
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

  //compute call duration in seconds
  const durationInMilliseconds =
    this.call.endedAt.getTime() - this.call.startedAt.getTime();
  this.call.duration = (durationInMilliseconds / 1000);

  //compute mean time to resolve (ttr)
  if (this.resolvedAt) {
    const ttrInSeconds =
      (this.resolvedAt.getTime() - this.createdAt.getTime()) / (1000 * 60);
    this.ttr = ttrInSeconds;
  }

  //ensure jurisdiction from service
  const jurisdiction = _.get(this.service, 'jurisdiction');
  if (!this.jurisdiction && _.get(this.service, 'jurisdiction')) {
    this.jurisdiction = jurisdiction;
  }

  //set default status & priority if not set
  //TODO preload default status & priority
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
  //TODO notify customer details(DRM) to update details based on the account id
  //TODO send(queue) notification
  //TODO send service request code to reporter(sms or email)
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
