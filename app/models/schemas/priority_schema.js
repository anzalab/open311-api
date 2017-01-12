'use strict';


/**
 * @module PrioritySchema
 * @name PrioritySchema
 * @description manage entity(i.e service & service request(issue)) priority
 * @author lally elias <lallyelias87@mail.com>
 * @since 0.1.0
 * @version 0.1.0
 */


//dependencies
const _ = require('lodash');
const mongoose = require('mongoose');
const randomColor = require('randomcolor');
const Schema = mongoose.Schema;


//PrioritySchema Schema
const PrioritySchema = new Schema({
  /**
   * @name name
   * @description Human readable name of the priority 
   *              e.g High, Low, Medium
   * @type {Object}
   * @private
   * @since 0.1.0
   * @version 0.1.0
   */
  name: {
    type: String,
    index: true,
    default: 'NORMAL'
  },


  /**
   * @name weight
   * @description Weight of the priority to help in ordering service request
   *              based on priority
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
// PrioritySchema Hooks
//-----------------------------------------------------------------------------
PrioritySchema.pre('validate', function (next) {

  //set default color if not set
  if (_.isEmpty(this.color)) {
    this.color = randomColor();
  }

  next();

});

//TODO implement priority in service request to expose list of applicable priority

//exports Status Schema
module.exports = exports = PrioritySchema;
