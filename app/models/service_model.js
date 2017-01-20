'use strict';


/**
 * @module Service
 * @name Service
 * @description An acceptable service (request types)(e.g Water Leakage) 
 *              offered(or handled) by a jurisdiction
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
const randomColor = require('randomcolor');
const Schema = mongoose.Schema;
const ObjectId = Schema.Types.ObjectId;
const PrioritySchema =
  require(path.join(__dirname, 'schemas', 'priority_schema'));

//Service Schema
const ServiceSchema = new Schema({

  /**
   * @name jurisdiction
   * @description A jurisdiction undewhich a service (request type) is 
   *              applicable.
   *
   *              If not available a service is applicable to all 
   *              jurisdictions
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
   *              internal usage
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
    trim: true
  },


  /**
   * @name name
   * @description A unique human readable name of the service (request type)
   *              e.g Sanitation
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
    trim: true
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
    trim: true
  },


  /**
   * @name priority
   * @description A service request type priority.
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
    trim: true
  }

});


//-----------------------------------------------------------------------------
// ServiceSchema Hooks
//-----------------------------------------------------------------------------
ServiceSchema.pre('validate', function (next) {

  //set default color if not set
  if (_.isEmpty(this.color)) {
    this.color = randomColor();
  }

  //set service group code
  if (_.isEmpty(this.code) && !_.isEmpty(this.name)) {
    this.code = this.name.toUpperCase();
  }

  next();

});


//-----------------------------------------------------------------------------
// ServiceSchema Plugins
//-----------------------------------------------------------------------------

ServiceSchema.plugin(searchable, {
  fields: [
    'jurisdiction.name', 'group.name',
    'code', 'name', 'description'
  ],
  keywordsPath: 'keywords'
});


//exports Service model
module.exports = mongoose.model('Service', ServiceSchema);
