'use strict';


/**
 * @module Jurisdiction
 * @name Jurisdiction
 * @description An entity (e.g minicipal) responsible for addressing 
 *              service request(issue).
 *
 *              It may be a self managed entity or division within another
 *              entity(jurisdiction) in case there is hierarchy.
 *
 * @author lally elias <lallyelias87@mail.com>
 * @since 0.1.0
 * @version 0.1.0
 * @public
 */


//Important!: ensure 2dsphere index before any geo queries

//TODO add service inverse relation mapping & use restrictive population
//TODO add service group inverse relation mapping & use restrictive population


//dependencies
const path = require('path');
const _ = require('lodash');
const async = require('async');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ObjectId = Schema.Types.ObjectId;
const GeoJSON = require(path.join(__dirname, 'schemas', 'geojson_schema'));

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
    index: true,
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
    uppercase: true,
    searchable: true,
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
    searchable: true,
    unique: true
  },


  /**
   * @name domain
   * @description Unique reserved domain name of the jurisdiction 
   *              e.g example.go.tz. 
   *              
   *              It used as jurisdiction_id in open311 api specification and
   *              whenever applicable
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
    searchable: true,
    unique: true
  },


  /**
   * @name description
   * @description A brief summary about jurusdiction if available i.e
   *              additional details that clarify what a jurisdiction do.
   *              
   * @type {Object}
   * @private
   * @since 0.1.0
   * @version 0.1.0
   */
  about: {
    type: String,
    trim: true,
    searchable: true
  },


  /**
   * @name location
   * @description a center of jurisdiction
   * @since  0.1.0
   * @version  0.1.0
   * @type {Object}
   * @private
   */
  location: GeoJSON.Point,


  /**
   * @name boundaries
   * @description jurisdiction boundaries. 
   *
   *              It mailnly used when geo lookup for service request 
   *              jurisdiction based on geo coordinates
   *              
   * @since  0.1.0
   * @version 0.1.0
   * @type {Object}
   * @private
   */
  boundaries: GeoJSON.Polygon

}, { timestamps: true, emitIndexErrors: true });


//-----------------------------------------------------------------------------
// JurisdictionSchema Index
//-----------------------------------------------------------------------------


//ensure `2dsphere` on jurisdiction location and boundaries
JurisdictionSchema.index({ location: '2dsphere' });
JurisdictionSchema.index({ boundaries: '2dsphere' });



//-----------------------------------------------------------------------------
// JurisdictionSchema Hooks
//-----------------------------------------------------------------------------
JurisdictionSchema.pre('validate', function (next) {

  //set juridiction code
  if (_.isEmpty(this.code) && !_.isEmpty(this.name)) {
    this.code = _.take(this.name, 1).join('').toUpperCase();
  }

  next();

});


//-----------------------------------------------------------------------------
// JurisdictionSchema Static Methods
//-----------------------------------------------------------------------------


/**
 * @name findNearBy
 * @description find jurisdiction near a specified coordinates
 * @param  {Number}   options.minDistance min distance in meters
 * @param  {Number}   options.maxDistance max distance in meters
 * @param  {[Number]}   options.coordinates coordinates of the location
 * @param  {Function} done        a callback to invoke on success or error
 * @return {[Object]}             collection  of jurisdiction near by 
 *                                specified coordinates  
 * @see {@link https://docs.mongodb.com/manual/reference/operator/query/nearSphere/#op._S_nearSphere}
 * @since 0.1.0
 * @version 0.1.0
 * @public
 */
JurisdictionSchema.statics.findNearBy = function (options, done) {
  //default criteria
  let criteria = {
    $nearSphere: {
      $geometry: {
        type: GeoJSON.TYPE_POLYGON,
        coordinates: []
      }
    }
  };

  //set $geomentry coordinates
  if (_.isArray(options)) {
    criteria.$nearSphere.$geometry.coordinates =
      _.compact(criteria.$nearSphere.$geometry.coordinates.concat(options));
  }

  if (_.isPlainObject(options)) {
    //set minDistance criteria
    if (options.minDistance) {
      criteria.$nearSphere.$minDistance = options.minDistance;
    }

    //set maxDistance criteria
    if (options.maxDistance) {
      criteria.$nearSphere.$maxDistance = options.maxDistance;
    }

    //ensure coordinates
    criteria.$nearSphere.$geometry.coordinates =
      _.compact(criteria.$nearSphere.$geometry.coordinates.concat(options.coordinates));
  }

  //reference jurisdiction
  const Jurisdiction = this;

  //find jurisdiction(s) which is near by provided coordinates
  async.waterfall([

    function ensureIndexes(next) {
      Jurisdiction.ensureIndexes(function (error) {
        next(error, true);
      });
    },

    function query(indexed, next) {
      Jurisdiction.find({
        boundaries: criteria
      }, next);
    }

  ], done);

};


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
