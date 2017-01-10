'use strict';


/**
 * @module Jurisdiction
 * @name Jurisdiction
 * @description an entity (e.g minicipal) responsible for addressing 
 *              service request(issue)
 * @author lally elias <lallyelias87@mail.com>
 * @since 0.1.0
 * @version 0.1.0
 */


//dependencies
const mongoose = require('mongoose');
const searchable = require('mongoose-fts');
const Schema = mongoose.Schema;
const ObjectId = Schema.Types.ObjectId;


//Jurisdiction Schema
const JurisdictionSchema = new Schema({
  /**
   * @name jurisdiction
   * @description Top jurisdiction for this jurisdiction. 
   *              
   *              This is applicable where a large jurisdiction delegates 
   *              its power to its division
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
    autopopulate: {
      select: 'code name domain'
    }
  },


  /**
   * @name code
   * @description Human readable coded name of the jurisdiction. 
   *              Used in deriving service request code.
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

});


//-----------------------------------------------------------------------------
// JurisdictionSchema Plugins
//-----------------------------------------------------------------------------

JurisdictionSchema.plugin(searchable, {
  fields: ['code', 'name', 'domain', 'about'],
  keywordsPath: 'keywords'
});


//exports Jurisdiction model
module.exports = mongoose.model('Jurisdiction', JurisdictionSchema);
