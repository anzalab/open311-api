'use strict';

/**
 * @module ChangeLog
 * @name ChangeLog
 * @description A record(log) of a changes on a service request(issue).
 *              
 *              It may be status, priority, assignee change, private or public
 *              comments etc.
 *
 * @see {@link Party}
 * @see {@link ServiceRequest}
 * @see {@link Status}
 * @see {@link Priority}
 * @author lally elias <lallyelias87@mail.com>
 * @since 0.1.0
 * @version 0.1.0
 * @public
 */


//dependencies
const path = require('path');
const _ = require('lodash');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ObjectId = Schema.Types.ObjectId;


//constants
const VISIBILITY_PUBLIC = 'Public';
const VISIBILITY_PRIVATE = 'Private';


/**
 * @name ChangeLogSchema
 * @type {Schema}
 * @since 0.1.0
 * @version 0.1.0
 * @private
 */
const ChangeLogSchema = new Schema({

  /**
   * @name status
   * @description A current assigned status
   * @type {Object}
   * @see {@link Status}
   * @private
   * @since 0.1.0
   * @version 0.1.0
   */
  status: {
    type: ObjectId,
    ref: 'Status',
    required: true,
    index: true,
    autoset: true,
    exists: true,
    autopopulate: true
  },


  /**
   * @name priority
   * @description A current assigned priority
   * @type {Object}
   * @see {@link Priority}
   * @private
   * @since 0.1.0
   * @version 0.1.0
   */
  priority: {
    type: ObjectId,
    ref: 'Priority',
    required: true,
    index: true,
    autoset: true,
    exists: true,
    autopopulate: true
  },


  /**
   * @name changer
   * @description A party whose made changes
   * @type {Object}
   * @see {@link Party}
   * @private
   * @since 0.1.0
   * @version 0.1.0
   */
  changer: {
    type: ObjectId,
    ref: 'Party',
    required: true,
    index: true,
    autoset: true,
    exists: true,
    autopopulate: {
      select: 'name email phone'
    }
  },


  /**
   * @name remarks
   * @description A note provided by a change when changing a status
   * @type {Object}
   * @private
   * @since 0.1.0
   * @version 0.1.0
   */
  remarks: {
    type: String,
    index: true,
    trim: true,
    searchable: true
  },

  /**
   * @name notify
   * @description Signal to send remarks to a service request(issue) reporter
   *              using sms, email etc.
   * @type {Object}
   * @private
   * @since 0.1.0
   * @version 0.1.0
   */
  notify: {
    type: Boolean,
    default: false
  }

}, { timestamps: true, emitIndexErrors: true });
