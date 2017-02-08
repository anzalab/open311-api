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

//Note!:_id:false schema option is set so that id is not set by mongoose
//when persisting geojson schema

//TODO add geojson schema validations
//TODO improve test coverage

//dependencies
const mongoose = require('mongoose');
const Schema = mongoose.Schema;


//const geojson types
const TYPE_POINT = 'Point';
const TYPE_POLYGON = 'Polygon';


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
    default: TYPE_POINT,
    enum: [TYPE_POINT]
  },

  coordinates: {
    type: Array
  }

}, { _id: false });


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
    default: TYPE_POLYGON,
    enum: [TYPE_POLYGON]
  },

  coordinates: {
    type: Array
  }

}, { _id: false });
