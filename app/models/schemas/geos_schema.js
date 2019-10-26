'use strict';

const { Point } = require('mongoose-geojson-schemas');

/**
 * @name geo
 * @description Common geo fields for service request and changelog
 * @see {@link ServiceRequest}
 * @see {@link ChangeLog}
 *
 * @author lally elias<lallyelias87@gmail.com>
 * @type {Schema}
 * @since  0.1.0
 * @version 0.1.0
 * @public
 */

module.exports = exports = {};

/**
 * @name address
 * @description A human entered address or description of location where
 * service request(issue) happened or work is performed.
 *
 * @type {Object}
 * @private
 * @since 0.1.0
 * @version 0.1.0
 */
exports.address = {
  type: String,
  trim: true,
  index: true,
  searchable: true,
  taggable: true
};

/**
 * @name location
 * @description A longitude and latitude pair of the location of a
 * service request(issue).
 *
 * The order of adding longitude and latitude in the array must
 * be <longitude> , <latitude> and not otherwise.
 *
 * @type {Object}
 * {@link https://docs.mongodb.com/manual/applications/geospatial-indexes/}
 * {@link https://docs.mongodb.com/manual/reference/operator/query-geospatial/}
 * @private
 * @since 0.1.0
 * @version 0.1.0
 */
exports.location = Point;
