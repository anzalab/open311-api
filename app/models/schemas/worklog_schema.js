'use strict';


/**
 * @module WorkLog
 * @name WorkLog
 * @description A record of a work performed on a service request by a party.
 *
 *              Used log actual efforts (as in a length of time spent etc) 
 *              on the issue(service request).
 *              
 *              It also record a resolution of a service request.
 *              
 * @see {@link Party}
 * @see {@link ServiceRequest}
 * @author lally elias <lallyelias87@mail.com>
 * @since 0.1.0
 * @version 0.1.0
 */


//dependencies
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ObjectId = Schema.Types.ObjectId;


//WorkLog Schema
const WorkLog = new Schema({
  /**
   * @name workedAt
   * @description A time when a work was performed
   * @type {Object}
   * @private
   * @since 0.1.0
   * @version 0.1.0
   */
  workedAt: {
    type: Date,
    default: new Date(),
    index: true
  },


  /**
   * @name worker
   * @description A party performed a work
   * @type {Object}
   * @see {@link Party}
   * @private
   * @since 0.1.0
   * @version 0.1.0
   */
  worker: {
    type: ObjectId,
    ref: 'Party',
    required: true,
    index: true,
    autoset: true,
    autopupulate: {
      select: 'name email phone'
    }
  },


  /**
   * @name description
   * @description A detailed explanation of the work performed
   * @type {Object}
   * @private
   * @since 0.1.0
   * @version 0.1.0
   */
  description: {
    type: String,
    required: true
  },


  /**
   * @name resolution
   * @description A flag to to signal if the worklog is a resolution
   * @type {Object}
   * @private
   * @since 0.1.0
   * @version 0.1.0
   */
  resolution: {
    type: Boolean
  }

}, { timestamps: true });


//exports WorkLog Schema
module.exports = exports = WorkLog;
