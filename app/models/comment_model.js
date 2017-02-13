'use strict';


/**
 * @module Comment
 * @name Comment
 * @description A record of a comment(or internal not) on a service 
 *              request(issue) by a party.
 *
 * @see {@link Party}
 * @see {@link ServiceRequest}
 * @author lally elias <lallyelias87@mail.com>
 * @since 0.1.0
 * @version 0.1.0
 * @public
 */


//dependencies
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ObjectId = Schema.Types.ObjectId;


/**
 * @name CommentSchema
 * @type {Schema}
 * @since 0.1.0
 * @version 0.1.0
 * @private
 */
const CommentSchema = new Schema({
  /**
   * @name request
   * @description A service requests which commented on
   * @type {Object}
   * @see {@link ServiceRequest}
   * @private
   * @since 0.1.0
   * @version 0.1.0
   */
  request: {
    type: ObjectId,
    ref: 'ServiceRequest',
    required: true,
    index: true,
    autoset: true,
    exists: true
  },


  /**
   * @name commentator
   * @description A party whose made a comment
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
    exists: true,
    autopopulate: {
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
    required: true,
    searchable: true
  }

}, { timestamps: true, emitIndexErrors: true });


/**
 * @name Comment
 * @description register CommentSchema and initialize Comment
 *              model
 * @type {Model}
 * @since 0.1.0
 * @version 0.1.0
 * @public
 */
module.exports = mongoose.model('Comment', CommentSchema);
