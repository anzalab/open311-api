'use strict';


/**
 * @module Jurisdiction
 * @name Jurisdiction
 * @description an entity (e.g minicipal) responsible for addressing 
 *              service request(issue).
 *
 *              It may be a self managed entity or division within an entity.
 *
 * @author lally elias <lallyelias87@mail.com>
 * @since 0.1.0
 * @version 0.1.0
 * @public
 */


//dependencies
const _ = require('lodash');
const mongoose = require('mongoose');
const searchable = require('mongoose-fts');
const Schema = mongoose.Schema;
const ObjectId = Schema.Types.ObjectId;


/**
 * @name JurisdictionSchema
 * @type {Schema}
 * @since 0.1.0
 * @version 0.1.0
 * @private
 */
const JurisdictionSchema = new Schema({
  /**
   * @name jurisdiction
   * @description Top jurisdiction under which this jurisdiction derived. 
   *              
   *              This is applicable where a large jurisdiction delegates 
   *              its power to its division(s).
   *
   *              If not set the jurisdiction will be treated as a top
   *              jurisdiction and will be affected by any logics implemented
   *              accordingly.
   *              
   * @type {Object}
   * @private
   * @since 0.1.0
   * @version 0.1.0
   */
  jurisdiction: {
    type: ObjectId,
    ref: 'Jurisdiction',
    autoset: true,
    exists: true,
    autopopulate: {
      select: 'code name domain'
    }
  },


  /**
   * @name code
   * @description Human readable coded name of the jurisdiction. 
   *              Used in deriving service request code.
   *              
   * @type {Object}
   * @private
   * @since 0.1.0
   * @version 0.1.0
   */
  code: {
    type: String,
    required: true,
    trim: true,
    unique: true
  },


  /**
   * @name name
   * @description Human readable name of the jurisdiction
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
   * @name domain
   * @description Unique reserved domain name of the jurisdiction 
   *              e.g example.go.tz. It used as jurisdiction_id in open311 api
   *              specification and whenever applicable
   *              
   * @type {Object}
   * @private
   * @since 0.1.0
   * @version 0.1.0
   */
  domain: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
    unique: true
  },


  /**
   * @name description
   * @description A brief summary about jurusdiction if available i.e
   *              additional details that clarify what a jurisdiction do.
   * @type {Object}
   * @private
   * @since 0.1.0
   * @version 0.1.0
   */
  about: {
    type: String
  }

}, {
  timestamps: true
});


//-----------------------------------------------------------------------------
// JurisdictionSchema Hooks
//-----------------------------------------------------------------------------
JurisdictionSchema.pre('validate', function (next) {

  //set juridiction code
  if (_.isEmpty(this.code) && !_.isEmpty(this.name)) {
    this.code = this.name.split(' ').join('-').toUpperCase();
  }

  next();

});


//-----------------------------------------------------------------------------
// JurisdictionSchema Instance Methods
//-----------------------------------------------------------------------------


JurisdictionSchema.methods.groups = function (done) {
  //1. fetch all parent service groups
  //2. fetch all jurisdiction service groups
  //3. fetch global service groups
  done();
};


JurisdictionSchema.methods.services = function (done) {
  //1. fetch all parent services
  //2. fetch all jurisdiction services
  //3. fetch global services
  done();
};


//-----------------------------------------------------------------------------
// JurisdictionSchema Plugins
//-----------------------------------------------------------------------------

JurisdictionSchema.plugin(searchable, {
  fields: [
    'jurisdiction.name', 'code',
    'name', 'domain', 'about'
  ],
  keywordsPath: 'keywords'
});


/**
 * @name Jurisdiction
 * @description register JurisdictionSchema and initialize Jurisdiction
 *              model
 * @type {Model}
 * @since 0.1.0
 * @version 0.1.0
 * @public
 */
module.exports = mongoose.model('Jurisdiction', JurisdictionSchema);
