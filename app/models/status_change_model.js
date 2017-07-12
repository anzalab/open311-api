'use strict';


/**
 * @module StatusChange
 * @name StatusChange
 * @description A record of a status change on a service request(issue) 
 *              by a party.
 *
 * @see {@link Party}
 * @see {@link ServiceRequest}
 * @see {@link Status}
 * @author lally elias <lallyelias87@mail.com>
 * @since 0.1.0
 * @version 0.1.0
 * @public
 */


//dependencies
const config = require('config');
const environment = require('execution-environment');
const infobip = require('open311-infobip');
const _ = require('lodash');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ObjectId = Schema.Types.ObjectId;


/**
 * @name StatusChangeSchema
 * @type {Schema}
 * @since 0.1.0
 * @version 0.1.0
 * @private
 */
const StatusChangeSchema = new Schema({
  /**
   * @name request
   * @description A service requests which status has been changed
   * @type {Object}
   * @see {@link ServiceRequest}
   * @private
   * @since 0.1.0
   * @version 0.1.0
   */
  request: {
    type: ObjectId,
    ref: 'ServiceRequest',
    required: true,
    index: true,
    autoset: true,
    exists: true
  },


  /**
   * @name status
   * @description A current assigned status
   * @type {Object}
   * @see {@link Status}
   * @private
   * @since 0.1.0
   * @version 0.1.0
   */
  status: {
    type: ObjectId,
    ref: 'Status',
    required: true,
    index: true,
    autoset: true,
    exists: true,
    autopopulate: true
  },


  /**
   * @name changer
   * @description A party whose made a status change
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
   * @name remarks
   * @description A note provided by a change when changing a status
   * @type {Object}
   * @private
   * @since 0.1.0
   * @version 0.1.0
   */
  remarks: {
    type: String,
    index: true,
    trim: true,
    searchable: true
  },

  /**
   * @name notify
   * @description Signal to send remarks to a service request(issue) reporter
   *              using sms, email etc.
   * @type {Object}
   * @private
   * @since 0.1.0
   * @version 0.1.0
   */
  notify: {
    type: Boolean,
    default: false
  }

}, { timestamps: true, emitIndexErrors: true });


//-----------------------------------------------------------------------------
// StatusChangeSchema Hooks
//-----------------------------------------------------------------------------


/**
 * @name preSave
 * @description pre save logics to be run before status change is saved
 * @param  {Function} next a callback to be run after pre save logics
 * @private
 * @since 0.1.0
 * @version 0.1.0
 * @type {Function}
 */
StatusChangeSchema.pre('save', function (next) {

  //ensure service request have the same status
  const serviceRequestHasSameStatus =
    (this.request && this.status) &&
    ((this.request.status || {})._id === this.status._id);

  //update current service request status
  if (!serviceRequestHasSameStatus) {
    this.request.status = this.status;

    //update request to ensure it has current status
    this.request.save(function (error /*, request*/ ) {

      //notify error
      if (error) {
        //flag internal server error
        error.code = error.status = 500;
        next(error);
      }

      //continue to save status change
      else {
        next(null, this);
      }

    }.bind(this)); //ensure instance context
  }

  //continue with saving status change
  else {
    next();
  }

});



/**
 * @name postSave
 * @description post save logics to be run status status change has been saved
 * @param  {Function} next a callback to be run after save logics
 * @private
 * @since 0.1.0
 * @version 0.1.0
 * @type {Function}
 */
StatusChangeSchema.post('save', function (statusChange, next) {

  // references
  const Message = mongoose.model('Message');

  //TODO how about notifying other correspondents

  //check if should notify reporter
  const notifyReporter =
    (statusChange && statusChange.notify && statusChange.remarks) &&
    (statusChange.request && statusChange.request.reporter &&
      !_.isEmpty(statusChange.request.reporter.phone));

  //notify reporter
  if (notifyReporter) {

    //obtain current execution environment
    const isProduction = environment.isProd();

    //obtain sms configuration
    const options = config.get('infobip');
    const shouldSendSynchronously = options.sync;

    //TODO what about salutation to a reporter?
    //TODO what about issue ticket number?

    //prepare sms message
    const message = new Message({
      type: Message.TYPE_SMS,
      to: statusChange.request.reporter.phone, //TODO ensure e.164 format
      body: statusChange.remarks //TODO salute reporter
    });

    //queue message in production
    //or if is asynchronous send
    if (isProduction || !shouldSendSynchronously) {
      infobip.queue(message);
      next();
    }

    //direct sms send in development & test
    else {
      infobip.send(message, function (error, result) {
        next(error, message);
      });
    }

  }

  //continue without notify
  else {
    next();
  }

});



/**
 * @name StatusChange
 * @description register StatusChangeSchema and initialize StatusChange
 *              model
 * @type {Model}
 * @since 0.1.0
 * @version 0.1.0
 * @public
 */
module.exports = mongoose.model('StatusChange', StatusChangeSchema);
