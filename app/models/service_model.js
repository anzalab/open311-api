'use strict';


/**
 * @module Service
 * @name Service
 * @description An acceptable service (request types)(e.g Water Leakage) 
 *              offered(or handled) by a specific jurisdiction.
 *              
 * @author lally elias <lallyelias87@mail.com>
 * @since 0.1.0
 * @version 0.1.0
 * @public
 */


//TODO migrate priority to model
//TODO ensure default priority
//TODO on UI add jurisdiction and service group filter
//TODO add a flag to make a service request under a specified service to be public


//dependencies
const _ = require('lodash');
const mongoose = require('mongoose');
const randomColor = require('randomcolor');
const Schema = mongoose.Schema;
const ObjectId = Schema.Types.ObjectId;


/**
 * @name ServiceSchema
 * @type {Schema}
 * @since 0.1.0
 * @version 0.1.0
 * @private
 */
const ServiceSchema = new Schema({

  /**
   * @name jurisdiction
   * @description A jurisdiction undewhich a service (request type) is 
   *              applicable.
   *
   *              If not available a service is applicable to all 
   *              jurisdictions.
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
    index: true,
    autoset: true,
    exists: true,
    autopopulate: {
      select: 'code name domain'
    }
  },


  /**
   * @name group
   * @description A service group underwhich a service belongs to
   * @type {Object}
   * @see {@link ServiceGroup}
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
   * @name code
   * @description A unique identifier of the service. 
   *              
   *              Used in deriving code of the service request(issue) and 
   *              internal usage.
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
    searchable: true
  },


  /**
   * @name name
   * @description A unique human readable name of the service (request type)
   *              e.g Water Leakage
   *              
   * @type {Object}
   * @private
   * @since 0.1.0
   * @version 0.1.0
   */
  name: {
    type: String,
    unique: true,
    required: true,
    trim: true,
    searchable: true
  },


  /**
   * @name description
   * @description A detailed human readable explanation about the service
   *              (request type)
   *               
   * @type {Object}
   * @private
   * @since 0.1.0
   * @version 0.1.0
   */
  description: {
    type: String,
    trim: true,
    searchable: true
  },


  /**
   * @name color
   * @description A color (hexadecimal format) used to differentiate service 
   *              request type visually from other service
   *               
   * @type {Object}
   * @private
   * @since 0.1.0
   * @version 0.1.0
   */
  color: {
    type: String,
    trim: true,
    uppercase: true
  }

}, { timestamps: true, emitIndexErrors: true });


//-----------------------------------------------------------------------------
// ServiceSchema Instance Methods
//-----------------------------------------------------------------------------


/**
 * @name toOpen311
 * @description convert service instance to Open311 compliant schema
 * @return {Object} open311 compliant service instance
 * @private
 * @since 0.1.0
 * @version 0.1.0
 * @type {Function}
 */
ServiceSchema.methods.toOpen311 = function () {
  /*jshint camelcase:false*/

  let as311 = {};

  // The unique identifier for the service request type
  as311.service_code = this.code;

  // The human readable name of the service request type
  as311.service_name = this.name;

  // A brief description of the service request type.
  as311.description = this.description || this.name;

  //Determines whether there are additional form fields for this service type.
  //Current we don't support additional form fields
  as311.metadata = false;

  // The service request ID(ticket number) will be returned immediately after 
  // the service request is submitted.
  as311.type = 'realtime';

  // A comma separated list of tags or keywords to help users identify 
  // the request type. This can provide synonyms of the service_name and group.
  as311.keywords =
    _.compact([this.name, (this.group || {}).name]).join(',');

  // A category to group this service type within. 
  // This provides a way to group several service request types under 
  // one category such as "sanitation"
  as311.group = (this.group || {}).name;

  /*jshint camelcase:true*/

  return as311;

};


//-----------------------------------------------------------------------------
// ServiceSchema Hooks
//-----------------------------------------------------------------------------


/**
 * @name  preValidate
 * @return {Fuction} next a callback invoked after pre validate
 * @type {Function}
 */
ServiceSchema.pre('validate', function (next) {

  //set default color if not set
  if (_.isEmpty(this.color)) {
    this.color = randomColor();
  }

  //ensure jurisdiction from service group
  const jurisdiction = _.get(this.group, 'jurisdiction');
  if (!this.jurisdiction && _.get(this.group, 'jurisdiction')) {
    this.jurisdiction = jurisdiction;
  }

  //set service code
  if (_.isEmpty(this.code) && !_.isEmpty(this.name)) {

    //generate code from service group name
    this.code = _.take(this.name, 1).join('').toUpperCase();

  }

  next();

});


//-----------------------------------------------------------------------------
// ServiceSchema Static Properties & Methods
//-----------------------------------------------------------------------------


/**
 * @name Service
 * @description register ServiceSchema and initialize Service
 *              model
 * @type {Model}
 * @since 0.1.0
 * @version 0.1.0
 * @public
 */
module.exports = mongoose.model('Service', ServiceSchema);
