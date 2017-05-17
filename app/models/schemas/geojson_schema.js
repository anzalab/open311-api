'use strict';


/**
 * @module GeoJSON
 * @description GeoJSON schema defition for mongoose
 * @author lally elias<lallyelias87@gmail.com>
 * @see  {@link http://geojson.org/geojson-spec.html}
 * @see  {@link http://www.macwright.org/2015/03/23/geojson-second-bite.html}
 * @see  {@link https://docs.mongodb.com/manual/core/2dsphere/}
 * @see  {@link https://docs.mongodb.com/manual/reference/geojson/}
 * @see  {@link http://mongoosejs.com/docs/guide.html#_id}
 * @since  0.1.0
 * @version 0.1.0
 */

//Note!: _id:false schema option is set so that id is not set by mongoose
//when persisting geojson schema

//Important!: Always list coordinates in longitude, latitude order.

//TODO add geojson schema validations
//TODO improve test coverage

//dependencies
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Mixed = Schema.Types.Mixed;


//const geojson types
exports.TYPE_POINT = 'Point';
exports.TYPE_POLYGON = 'Polygon';


/**
 * @name Point
 * @description Point GeoJSON Geometry
 * @type {Schema}
 */
exports.Point = new Schema({
  /**
   * @name type
   * @description type of geojson geometry
   * @type {Object}
   */
  type: {
    type: String,
    default: exports.TYPE_POINT,
    enum: [exports.TYPE_POINT]
  },

  //TODO add validation for point characteristics
  coordinates: {
    type: [Number],
    default: [0, 0] //TODO use settings for default coordinates
  }

}, { _id: false, timestamps: false });


/**
 * @name Polygon
 * @description Polygon GeoJSON Geometry
 * @type {Schema}
 */
exports.Polygon = new Schema({
  /**
   * @name type
   * @description type of geojson geometry
   * @type {Object}
   */
  type: {
    type: String,
    default: exports.TYPE_POLYGON,
    enum: [exports.TYPE_POLYGON]
  },

  //TODO add validation for polygon characteristics
  coordinates: {
    type: [Mixed],
    default: [ //TODO use settings to provide default values
      [
        [ //double array are used to prevent mongoose schema casting error
          [-1, -1],
          [1, -1],
          [1, 1],
          [-1, 1],
          [-1, -1]
        ]
      ]
    ]
  }

}, { _id: false, timestamps: false });
