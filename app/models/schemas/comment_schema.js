'use strict';


/**
 * @module CommentSchema
 * @name CommentSchema
 * @description A record of a comment on a service request(issue) by a party
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


//CommentSchema Schema
const CommentSchema = new Schema({
  /**
   * @name commentedAt
   * @description A time of commenting
   * @type {Object}
   * @private
   * @since 0.1.0
   * @version 0.1.0
   */
  commentedAt: {
    type: Date,
    default: new Date(),
    index: true
  },


  /**
   * @name commentator
   * @description A party comment
   * @type {Object}
   * @see {@link Party}
   * @private
   * @since 0.1.0
   * @version 0.1.0
   */
  commentator: {
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
   * @name content
   * @description A content of a comment
   * @type {Object}
   * @private
   * @since 0.1.0
   * @version 0.1.0
   */
  content: {
    type: String,
    required: true
  }

}, { timestamps: true });


//exports Comment Schema
module.exports = exports = CommentSchema;
