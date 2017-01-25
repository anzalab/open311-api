'use strict';


/**
 * @module ServiceGroup
 * @name ServiceGroup
 * @description Provide ability to group service offered by a jurisdiction
 *              into meaningful categories e.g Sanitation
 *              
 *              It provides a way to group several service request types under 
 *              one category such as Sanitation.
 *              
 * @author lally elias <lallyelias87@mail.com>
 * @since 0.1.0
 * @version 0.1.0
 */


//dependencies
const _ = require('lodash');
const mongoose = require('mongoose');
const searchable = require('mongoose-fts');
const randomColor = require('randomcolor');
const Schema = mongoose.Schema;
const ObjectId = Schema.Types.ObjectId;


//ServiceGroup Schema
const ServiceGroupSchema = new Schema({

  /**
   * @name jurisdiction
   * @description A jurisdiction undewhich a service group is applicable
   *
   *              If not available a service group is applicable to all 
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
    autoset: true,
    exists: true,
    index: true,
    autopopulate: {
      select: 'code name domain'
    }
  },


  /**
   * @name code
   * @description A unique identifier of the service group. 
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
   * @description A unique human readable name of the service group
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
   *              group
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
   * @name color
   * @description A color code(in hexdecimal format) used to differentiate a 
   *              service group visually from other service group
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
// ServiceGroupSchema Hooks
//-----------------------------------------------------------------------------
ServiceGroupSchema.pre('validate', function (next) {

  //set default color if not set
  if (_.isEmpty(this.color)) {
    this.color = randomColor();
  }

  //set service group code
  if (_.isEmpty(this.code) && !_.isEmpty(this.name)) {
    this.code = this.name.split(' ').join('-').toUpperCase();
  }

  next();

});

//-----------------------------------------------------------------------------
// ServiceGroupSchema Plugins
//-----------------------------------------------------------------------------

ServiceGroupSchema.plugin(searchable, {
  fields: [
    'jurisdiction.name',
    'code', 'name', 'description'
  ],
  keywordsPath: 'keywords'
});


//exports ServiceGroup model
module.exports = mongoose.model('ServiceGroup', ServiceGroupSchema);