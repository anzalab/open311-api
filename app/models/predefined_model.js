'use strict';


/**
 * @module Predefined
 * @name Predefined
 * @description manage predefined data e.g status, priority, 
 *              settings etc
 * @author lally elias <lallyelias87@mail.com>
 * @since 0.1.0
 * @version 0.1.0
 * @example
 * {
 *   group: 'Setting',
 *   name: 'dateFormat',
 *   value: 'dd/MM/yyyy',
 *   default: true
 * }
 */


//dependencies
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Mixed = Schema.Types.Mixed;


//constants
const DEFAULT_GROUP = 'Setting';


//PredefinedData Schema
const PredefineSchema = new Schema({

  /**
   * @name group
   * @description group underwhich predefined data belong.
   *              
   *              It is a resource that is stored as predefined data e.g status
   *              priority etc.
   *              
   * @type {Object}
   * @private
   * @since 0.1.0
   * @version 0.1.0
   */
  group: {
    type: String,
    trim: true,
    index: true,
    default: DEFAULT_GROUP
  },


  /**
   * @name name
   * @description human readable name given predefined data e.g dateFormat, 
   *              timeFormat, currency etc
   *              
   * @type {Object}
   * @private
   * @since 0.1.0
   * @version 0.1.0
   */
  name: {
    type: String,
    required: true,
    trim: true,
    unique: true
  },


  /**
   * @name value
   * @description value of the given predefined data e.g dd/MM/yyyy etc
   *              
   * @type {Object}
   * @private
   * @since 0.1.0
   * @version 0.1.0
   */
  value: {
    type: Mixed,
    required: true,
    trim: true
  },


  /**
   * @name deafult
   * @description signal if a given predefined can be used as a default data of
   *              a specific resource
   *              
   * @type {Object}
   * @private
   * @since 0.1.0
   * @version 0.1.0
   */
  default: {
    type: Boolean,
    default: false,
    index: true
  },


  /**
   * @name locale
   * @description local underwhich predefined can be used used. e.g en, sw etc.
   *              
   * @type {Object}
   * @private
   * @since 0.1.0
   * @version 0.1.0
   */
  locale: {
    type: String,
    default: 'en',
    index: true
  }

}, {
  timestamps: true
});

//exports PredefinedData model
module.exports = mongoose.model('Predefined', PredefineSchema);
