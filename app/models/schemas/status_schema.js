'use strict';


/**
 * @module StatusSchema
 * @name StatusSchema
 * @description Manage service request status
 * @author lally elias <lallyelias87@mail.com>
 * @since 0.1.0
 * @version 0.1.0
 */


//dependencies
const _ = require('lodash');
const mongoose = require('mongoose');
const randomColor = require('randomcolor');
const Schema = mongoose.Schema;


//StatusSchema Schema
const StatusSchema = new Schema({
  /**
   * @name name
   * @description Human readable name of the status 
   *              e.g Open, In Progress, Resolved
   * @type {Object}
   * @since 0.1.0
   * @version 0.1.0
   */
  name: {
    type: String,
    index: true,
    default: 'Open'
  },


  /**
   * @name weight
   * @description Weight of the status to help in ordering service request
   *              based on status
   * @type {Object}
   * @since 0.1.0
   * @version 0.1.0
   */
  weight: {
    type: Number,
    index: true,
    default: -5
  },


  /**
   * @name color
   * @description A color code used to differentiate a service request status
   *              visually
   * @type {Object}
   * @private
   * @since 0.1.0
   * @version 0.1.0
   */
  color: {
    type: String,
    trim: true
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

//TODO implement status in service request to expose list of applicable status

//exports Status Schema
module.exports = exports = StatusSchema;
