'use strict';


/**
 * @module ChangeLog
 * @name ChangeLog
 * @description A record(log) of a changes on a service request(issue).
 *              
 *              It may be status change, priority change, assignee change, 
 *              private comment(internal note) or public comment etc.
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


//global dependencies(or imports)
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ObjectId = Schema.Types.ObjectId;


//local dependencies(or imports)


//constants
const VISIBILITY_PUBLIC = 'Public';
const VISIBILITY_PRIVATE = 'Private';
const VISIBILITIES = [VISIBILITY_PRIVATE, VISIBILITY_PUBLIC];

//TODO hook on service request pre validation
//TODO hook on service request pre save
//TODO hook on service request post save
//TODO ensure notification is sent once there are changes
//TODO always sort them in order of update before send them
//TODO notify assignee once changed(previous and current)

/**
 * @name ChangeLogSchema
 * @type {Schema}
 * @since 0.1.0
 * @version 0.1.0
 * @private
 */
const ChangeLogSchema = new Schema({


  /**
   * @name status
   * @description A current assigned status of the service request.
   * @type {Status}
   * @see {@link Status}
   * @private
   * @since 0.1.0
   * @version 0.1.0
   */
  status: {
    type: ObjectId,
    ref: 'Status',
    index: true,
    autoset: true,
    exists: true,
    autopopulate: {
      select: 'name weight color'
    }
  },


  /**
   * @name priority
   * @description A current assigned priority of the service request
   * @type {Priority}
   * @see {@link Priority}
   * @private
   * @since 0.1.0
   * @version 0.1.0
   */
  priority: {
    type: ObjectId,
    ref: 'Priority',
    index: true,
    autoset: true,
    exists: true,
    autopopulate: {
      select: 'name weight color'
    }
  },


  /**
   * @name assignee
   * @description A current assigned party to work on service request(issue)
   * @type {Party}
   * @see {@link Priority}
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
   * @name changer
   * @description A party whose made changes to a servie request(issue)
   * @type {Object}
   * @see {@link Party}
   * @private
   * @since 0.1.0
   * @version 0.1.0
   */
  changer: {
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
   * @name comment
   * @description A note provided by a change when changing a status. 
   *
   *              It may be an internal note telling how far the service 
   *              request(issue) has been worked on or a message to a reporter.
   *              
   * @type {Object}
   * @private
   * @since 0.1.0
   * @version 0.1.0
   */
  comment: {
    type: String,
    index: true,
    trim: true,
    searchable: true
  },


  /**
   * @name shouldNotify
   * @description Signal to send notification to a service request(issue) 
   *              reporter using sms, email etc. about work(progress) done
   *              so far to resolve the issue.
   *              
   * @type {Object}
   * @private
   * @since 0.1.0
   * @version 0.1.0
   */
  shouldNotify: {
    type: Boolean,
    default: false
  },


  /**
   * @name wasNotificationSent
   * @description Tells if a notification contain a changes was 
   *              sent to a service request(issue) reporter using 
   *              sms, email etc. once a service request changed.
   *
   *              Note!: status changes trigger a notification to be sent
   *              always.
   *              
   * @type {Object}
   * @private
   * @since 0.1.0
   * @version 0.1.0
   */
  wasNotificationSent: {
    type: Boolean,
    default: false
  },


  /**
   * @name visibility
   * @description Signal if this changelog is public or private viewable.
   *
   *              Note!: status changes are always public viewable by default.
   *              
   * @type {Object}
   * @private
   * @since 0.1.0
   * @version 0.1.0
   */
  visibility: {
    type: String,
    index: true,
    enum: VISIBILITIES,
    default: VISIBILITY_PRIVATE
  }

}, { timestamps: true, emitIndexErrors: true });


//---------------------------------------------------------
// ChangeLogSchema Hooks
//---------------------------------------------------------


/**
 * @name  preValidate
 * @description pre validation logics for changelog
 * @param  {Function} next a callback to be called after pre validation logics
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


//---------------------------------------------------------
// ChangeLogSchema Statics
//---------------------------------------------------------

//expose changelog visibility flags(constants)
ChangeLogSchema.VISIBILITY_PRIVATE =
  ChangeLogSchema.statics.VISIBILITY_PRIVATE = VISIBILITY_PRIVATE;

ChangeLogSchema.VISIBILITY_PUBLIC =
  ChangeLogSchema.statics.VISIBILITY_PUBLIC = VISIBILITY_PUBLIC;

ChangeLogSchema.VISIBILITIES =
  ChangeLogSchema.statics.VISIBILITIES = VISIBILITIES;


//TODO post save send notification
//TODO for public comment notify reporter
//TODO do not notify private changes(?)


/**
 * @name ChangeLogSchema
 * @description exports changelog schema
 * @type {Schema}
 * @since  0.1.0
 * @version 0.1.0
 * @public
 */
module.exports = exports = ChangeLogSchema;
