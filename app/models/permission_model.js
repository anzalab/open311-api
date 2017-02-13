'use strict';


/**
 * @module Permission
 * @name Permission
 * @description manage party(ies) permission(s)
 * 
 *              Note!: permissions are dynamic generated during booting.
 *              
 * @author lally elias <lallyelias87@mail.com>
 * @since 0.1.0
 * @version 0.1.0
 */


//dependencies
const _ = require('lodash');
const inflection = require('inflection');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;


//Permission Schema
const PermissionSchema = new Schema({

  /**
   * @name action
   * @description an action permit that this permission offer
   *              e.g create, delete, update, read etc
   * @type {Object}
   * @private
   * @since 0.1.0
   * @version 0.1.0
   */
  action: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
    searchable: true
  },


  /**
   * @name resource
   * @description resource constrained under this permission
   *              e.g Party etc
   * @type {Object}
   * @private
   * @since 0.1.0
   * @version 0.1.0
   */
  resource: {
    type: String,
    required: true,
    trim: true,
    searchable: true
  },


  /**
   * @name description
   * @description additional explanation about this permission 
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
   * @name wildcard
   * @description unique identifier of this permission 
   * @type {Object}
   * @private
   * @since 0.1.0
   * @version 0.1.0
   */
  wildcard: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    searchable: true
  }

}, { timestamps: true, emitIndexErrors: true });


//-----------------------------------------------------------------------------
// PermissionSchema Hooks
//-----------------------------------------------------------------------------

PermissionSchema.pre('validate', function (next) {

  //normalize attributes
  if (!_.isEmpty(this.resource)) {
    this.resource = inflection.classify(this.resource);
  }

  if (!_.isEmpty(this.action)) {
    this.action = this.action.toLowerCase();
  }

  if (_.isEmpty(this.description)) {
    this.description =
      this.description ?
      this.description : [this.resource, this.action].join(' ');
  }

  //generate permission wildcard
  if (_.isEmpty(this.wildcard)) {
    this.wildcard = [this.resource, this.action].join(':');
  }

  next();

});


//exports Permission model
module.exports = mongoose.model('Permission', PermissionSchema);
