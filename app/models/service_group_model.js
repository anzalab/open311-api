'use strict';


/**
 * @module ServiceGroup
 * @name ServiceGroup
 * @description Provide ability to group service offered by a jurisdiction
 *              into meaningful categories e.g Sanitation
 *              
 *              It provides a way to group several service request types
 *              (issues) under meaningful categories such as Sanitation.
 *
 * @see {@link Jurisdiction}
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
const ObjectId = Schema.Types.ObjectId;


//TODO make use of compaund unique index to allow name to be usable in more
//than once jurisdiction

//TODO fix unique indexes on code and name in case used in more than
//one jurisdiction with different administration


/**
 * @name ServiceGroupSchema
 * @type {Schema}
 * @since 0.1.0
 * @version 0.1.0
 * @private
 */
const ServiceGroupSchema = new Schema({

  /**
   * @name jurisdiction
   * @description A jurisdiction undewhich a service group is applicable.
   *
   *              If not available a service group is applicable to all 
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
   *              internal jurisdiction usage i.e act as an issue 
   *              identifier.
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
    trim: true,
    searchable: true
  },


  /**
   * @name description
   * @description A detailed human readable explanation about the service
   *              group.
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
   * @description A color code(in hexdecimal format) eg. #363636 used to
   *              differentiate a service group visually from other service
   *              group.
   *
   *              If not provided it will randomly generated, but it is not
   *              guarantee its visual appeal.
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

}, { timestamps: true });


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
    //generate code from jurisdiction code
    //and service group name
    const jurisdictionCode = _.get(this.jurisdiction, 'code');
    if (jurisdictionCode) {
      this.code = [].concat(jurisdictionCode).concat(_.take(this.name, 1));
      this.code = this.code.join('').toUpperCase();
    }

    //generate code from service group name
    else {
      this.code = _.take(this.name, 3).join('').toUpperCase();
    }
  }

  next();

});


/**
 * @name ServiceGroup
 * @description register ServiceGroupSchema and initialize ServiceGroup
 *              model
 * @type {Model}
 * @since 0.1.0
 * @version 0.1.0
 * @public
 */
module.exports = mongoose.model('ServiceGroup', ServiceGroupSchema);
