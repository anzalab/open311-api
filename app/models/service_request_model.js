'use strict';


/**
 * @module ServiceRequest
 * @name ServiceRequest
 * @description An issue(or service request) reported by civilian 
 *              e.g Water Leakage
 *              
 * @author lally elias <lallyelias87@mail.com>
 * @since 0.1.0
 * @version 0.1.0
 */


//dependencies
const path = require('path');
const _ = require('lodash');
const mongoose = require('mongoose');
const searchable = require('mongoose-fts');
const shortid = require('shortid');
const Schema = mongoose.Schema;
const ObjectId = Schema.Types.ObjectId;
const MediaSchema =
  require(path.join(__dirname, 'schemas', 'media_schema'));
const CommentSchema =
  require(path.join(__dirname, 'schemas', 'comment_schema'));
const WorkLogSchema =
  require(path.join(__dirname, 'schemas', 'worklog_schema'));
const StatusSchema =
  require(path.join(__dirname, 'schemas', 'status_schema'));
const PrioritySchema =
  require(path.join(__dirname, 'schemas', 'priority_schema'));


//ServiceRequest Schema
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
    type: ObjectId,
    ref: 'Party',
    required: true,
    index: true,
    autoset: true,
    exists: true,
    autopopulate: {
      select: 'name email phone'
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
    uppercase: true
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
    required: true
  },


  /**
   * @name account
   * @description A jurisdiction internal associated account id of the 
   *              party submitting the request(issue).
   *
   *              This help a jurisdiction to link a reporter with the internal
   *              CRM.
   *
   *              When account id is available a reporter will be treated as a
   *              customer and not a normal civilian.
   *              
   * @type {Object}
   * @private
   * @since 0.1.0
   * @version 0.1.0
   */
  account: {
    type: String,
    trim: true,
    index: true
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
    type: StatusSchema,
    index: true,
    default: {
      name: 'OPEN'
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
    type: PrioritySchema,
    index: true,
    default: {
      name: 'NORMAL'
    }
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
  comments: { //TODO fix autopopulate commentor
    type: [CommentSchema],
    index: true
  },


  /**
   * @name works
   * @description Work(s) performed to resolve the issue(service request)
   * @type {Array}
   * @see {@link WorkLog}
   * @private
   * @since 0.1.0
   * @version 0.1.0
   */
  works: { //TODO fix autopopulate reporter
    type: [WorkLogSchema],
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
  }

}, { timestamps: true });


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
// ServiceRequestSchema Hooks
//-----------------------------------------------------------------------------

ServiceRequestSchema.pre('validate', function (next) {

  //set service request code
  //TODO update code algorithm
  if (_.isEmpty(this.code)) {
    this.code = [
      this.jurisdiction.code, this.service.code, shortid.generate()
    ].join('-').toUpperCase();
  }

  //set priority based on the service
  if (this.service && this.service.priority && !this.priority) {
    this.priority = this.service.priority;
  }

  next();

});


ServiceRequestSchema.post('save', function (doc, next) {
  //TODO notify CRM to update details based on the account id
  //TODO send(queue) notification
  //TODO send service request code to reporte(sms or email)
  next();
});


//-----------------------------------------------------------------------------
// PartySchema Instance Methods
//-----------------------------------------------------------------------------

/**
 * @name  attach
 * @description attach a media to a service request(issue).
 *              
 *              It assumed that a media will be already handled and uploaded
 *              before attach.
 *              
 * @param  {Media}   media    media details to be added as attachment
 * @param  {Function} done    a callback to invoke on success or failure
 * @return {ServiceRequest}   updated service request(issue)
 * @private
 * @since 0.1.0
 * @version 0.1.0
 */
ServiceRequestSchema.methods.attach = function (media, done) {
  //TODO use current signin user as an uploader(owner) of the media

  //merge default media details
  media = _.merge({}, { uploadedAt: new Date() }, media);

  //add attachment
  this.attachments.push(media);

  //persist attachments
  this.save(function afterAttach(error, serviceRequest) {
    //TODO send(queue) notifications
    done(error, serviceRequest);
  });

};


/**
 * @name comment
 * @description comment on the service request(issue).
 *              
 * @param  {Comment} comment  comment details
 * @param  {Function} done    a callback to invoke on success or failure
 * @return {ServiceRequest}   updated service request(issue)
 * @private
 * @since 0.1.0
 * @version 0.1.0
 */
ServiceRequestSchema.methods.comment = function (comment, done) {
  //TODO use current signin user as a commentor for the comment

  //merge default comment details
  comment = _.merge({}, { commentedAt: new Date() }, comment);

  //add comment
  this.works.push(comment);

  //persist comment
  this.save(function afterComment(error, serviceRequest) {
    //TODO send(queue) notifications
    done(error, serviceRequest);
  });

};


/**
 * @name  logWork
 * @description log work performed on the service request(issue).
 *              
 *              If work log is resoulution a service request(issue) will
 *              be flagged as resolved.
 *              
 * @param  {WorkLog}   workLog work performed
 * @param  {Function} done    a callback to invoke on success or failure
 * @return {ServiceRequest}   updated service request(issue)
 * @private
 * @since 0.1.0
 * @version 0.1.0
 */
ServiceRequestSchema.methods.logWork = function (workLog, done) {
  //TODO use current signin user as a worker for the worklog

  //merge default worklog details
  workLog = _.merge({}, { workedAt: new Date() }, workLog);

  //add worklog
  this.works.push(workLog);

  //update resolution state
  if (workLog.resolution) {
    this.resolvedAt = workLog.workedAt;
  }

  //persist work log
  this.save(function afterLogWork(error, serviceRequest) {
    //TODO send(queue) notifications
    done(error, serviceRequest);
  });

};


//-----------------------------------------------------------------------------
// ServiceRequestSchema Plugins
//-----------------------------------------------------------------------------

ServiceRequestSchema.plugin(searchable, {
  fields: [
    'jurisdiction.name', 'code', 'name',
    'account', 'address', 'description'
  ],
  keywordsPath: 'keywords'
});


//exports ServiceRequest model
module.exports = mongoose.model('ServiceRequest', ServiceRequestSchema);
