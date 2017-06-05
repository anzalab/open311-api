'use strict';


/**
 * @module SLA
 * @description service level agreement schema
 * @author lally elias<lallyelias87@gmail.com>
 * @since  0.1.0
 * @version 0.1.0
 */


//dependencies
const mongoose = require('mongoose');
const Schema = mongoose.Schema;


/**
 * @name SLASchema
 * @description Service Level Agreement schema
 * @type {Schema}
 */
const SlaSchema = new Schema({
  /**
   * @name ttr
   * @description time required in hours to resolve(mark as done) 
   *              an issue(service request)
   * @type {Object}
   */
  ttr: {
    type: Number
  }

}, { _id: false, timestamps: false });

/**
 * Exports service level agreement schema
 * @type {Schema}
 */
module.exports = exports = SlaSchema;
