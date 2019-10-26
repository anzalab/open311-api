'use strict';

const { ObjectId } = require('@lykmapipo/mongoose-common');
const { Predefine } = require('@lykmapipo/predefine');
const {
  MODEL_NAME_SERVICEREQUEST,
  VISIBILITIES,
  VISIBILITY_PRIVATE
} = require('@codetanzania/majifix-common');


/**
 * @name basic
 * @description Common basic fields for changelog
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
 * @name request
 * @description Associated service request(issue)
 *
 * @type {Object}
 * @see {@link ServiceRequest}
 * @since 0.1.0
 * @version 0.1.0
 * @instance
 */
exports.request = {
  type: ObjectId,
  ref: MODEL_NAME_SERVICEREQUEST,
  required: true,
  index: true,
  exists: true,
  aggregatable: { unwind: true },
  autopopulate: {
    select: 'code',
    maxDepth: 1
  }
};




/**
 * @name comment
 * @description Additional note for the changes. It may be an internal note
 * telling how far the service request(issue) has been worked on or a message
 * to a reporter.
 *
 * @type {Object}
 * @since 0.1.0
 * @version 0.1.0
 * @instance
 */
exports.comment = {
  type: String,
  index: true,
  trim: true,
  searchable: true
};

/**
 * @name shouldNotify
 * @description Signal to send notification to a service request(issue)
 * reporter using sms, email etc. about work(progress) done so far to resolve
 * the issue.
 *
 * @type {Object}
 * @since 0.1.0
 * @version 0.1.0
 * @instance
 */
exports.shouldNotify = {
  type: Boolean,
  default: false
};


/**
 * @name wasNotificationSent
 * @description Tells if a notification contain a changes was
 * sent to a service request(issue) reporter using sms, email etc.
 * once a service request changed.
 *
 * Note!: status changes trigger a notification to be sent always.
 *
 * @type {Object}
 * @since 0.1.0
 * @version 0.1.0
 * @instance
 */
exports.wasNotificationSent = {
  type: Boolean,
  default: false
};


/**
 * @name visibility
 * @description Signal if this changelog is public or private viewable.
 * Note!: status changes are always public viewable by default.
 *
 * @type {Object}
 * @since 0.1.0
 * @version 0.1.0
 * @instance
 */
exports.visibility = {
  type: String,
  index: true,
  enum: VISIBILITIES,
  default: VISIBILITY_PRIVATE
};

/**
 * @name item
 * @description A item(material, equipment etc) used on work on service
 * request(issue).
 *
 * @type {Object}
 * @see {@link Predefine}
 * @private
 * @since 0.1.0
 * @version 0.1.0
 */
exports.item = {
  type: ObjectId,
  ref: Predefine.MODEL_NAME,
  index: true,
  exists: true,
  aggregatable: { unwind: true },
  autopopulate: {
    maxDepth: 1
  }
};

/**
 * @name quantity
 * @description Amount of item(material, equipment etc) used on work
 * on service request(issue).
 *
 * @type {Object}
 * @private
 * @since 0.1.0
 * @version 0.1.0
 */
exports.quantity = {
  type: Number,
  min: 1
};
