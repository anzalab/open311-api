'use strict';


/**
 * @module Status
 * @name Status
 * @description Manage entity(i.e service & service request(issue)) status.
 *              
 *              Provides a way set status of service and service request 
 *              types (issues) in order to track their progress.
 *
 * @see {@link Service}
 * @see {@link ServiceRequest}
 * @author lally elias <lallyelias87@mail.com>
 * @since 0.1.0
 * @version 0.1.0
 * @public
 */


//dependencies
const _ = require('lodash');
const mongoose = require('mongoose');
const randomColor = require('randomcolor');
const Schema = mongoose.Schema;


//TODO review if status differ between jurisdictions
//TODO implement status in service request to expose list of applicable 
//statuses


/**
 * @name StatusSchema
 * @type {Schema}
 * @since 0.1.0
 * @version 0.1.0
 * @private
 */
const StatusSchema = new Schema({
  /**
   * @name name
   * @description Human readable name of the status 
   *              e.g Open, In Progress, Resolved.
   *              
   * @type {Object}
   * @private
   * @since 0.1.0
   * @version 0.1.0
   */
  name: {
    type: String,
    unique: true,
    trim: true,
    searchable: true
  },


  /**
   * @name weight
   * @description Weight of the status to help in ordering 
   *              service request(issue) based on status.
   *              
   * @type {Object}
   * @private
   * @since 0.1.0
   * @version 0.1.0
   */
  weight: {
    type: Number,
    index: true,
    default: 0
  },


  /**
   * @name type
   * @description A color code used to differentiate a service request status
   *              visually.
   *              
   * @type {Object}
   * @private
   * @since 0.1.0
   * @version 0.1.0
   */
  color: {
    type: String,
    trim: true,
    uppercase: true,
    required: true
  }

}, { timestamps: true });


//-----------------------------------------------------------------------------
// StatusSchema Hooks
//-----------------------------------------------------------------------------
StatusSchema.pre('validate', function (next) {

  //set default color if not set
  if (_.isEmpty(this.color)) {
    this.color = randomColor();
  }

  next();

});


//-----------------------------------------------------------------------------
// PartySchema Static Methods & Properties
//-----------------------------------------------------------------------------

/**
 * @name findDefault
 * @description find default status
 * @param  {Function} done a callback to invoke on success or failure
 * @return {Status}        default status
 * @since 0.1.0
 * @version 0.1.0
 * @public
 */
StatusSchema.statics.findDefault = function (done) {
  //reference status
  const Status = this;

  //TODO make use of default status settings

  //sort status by weight descending and take one
  Status.findOne().sort({ weight: -1 }).exec(done);

};


/**
 * @name Status
 * @description register StatusSchema and initialize Status
 *              model
 * @type {Model}
 * @since 0.1.0
 * @version 0.1.0
 * @public
 */
module.exports = mongoose.model('Status', StatusSchema);
