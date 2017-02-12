'use strict';


/**
 * @module Priority
 * @name Priority
 * @description Manage entity(i.e service & service request(issue)) priority.
 *              
 *              Provides a way to prioritize service and service request 
 *              types (issues) in order of their importance.
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


//TODO review if priority differ between jurisdictions
//TODO implement priority in service request to expose list of applicable 
//priority


/**
 * @name PrioritySchema
 * @type {Schema}
 * @since 0.1.0
 * @version 0.1.0
 * @private
 */
const PrioritySchema = new Schema({
  /**
   * @name name
   * @description Human readable name of the priority 
   *              e.g High, Low, Medium.
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
   * @description Weight of the priority to help in ordering 
   *              service request(issue) based on priority.
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
   * @description A color code used to differentiate a service request priority
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
// PrioritySchema Hooks
//-----------------------------------------------------------------------------
PrioritySchema.pre('validate', function (next) {

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
 * @description find default priority
 * @param  {Function} done a callback to invoke on success or failure
 * @return {Priority}        default priority
 * @since 0.1.0
 * @version 0.1.0
 * @public
 */
PrioritySchema.statics.findDefault = function (done) {
  //reference priority
  const Priority = this;

  //TODO make use of default priority settings

  //sort priority by weight ascending and take one
  Priority.findOne().sort({ weight: 1 }).exec(done);

};


/**
 * @name Priority
 * @description register PrioritySchema and initialize Priority
 *              model
 * @type {Model}
 * @since 0.1.0
 * @version 0.1.0
 * @public
 */
module.exports = mongoose.model('Priority', PrioritySchema);
