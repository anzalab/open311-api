'use strict';

/**
 * @name timestamps
 * @description Common timestamps fields for service request and changelog
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
 * @name confirmedAt
 * @description A latest time when the service request(issue) received from
 * other channels(i.e not call center or customer care desk) confirmed.
 *
 * @type {Object}
 * @private
 * @since 0.1.0
 * @version 0.1.0
 */
exports.confirmedAt = {
  type: Date,
  index: true
};

/**
 * @name expectedAt
 * @description A latest time when the service request(issue) is expected to be
 * resolved.
 *
 * Computed by adding expected hours to resolve issue to the
 * reporting time of the issue i.e (createdAt + service.sla.ttr in hours).
 *
 * @type {Object}
 * @private
 * @since 0.1.0
 * @version 0.1.0
 */
exports.expectedAt = {
  type: Date,
  index: true
};

/**
 * @name assignedAt
 * @description A latest time when the service request(issue) was assigned
 * to latest assignee to work on it.
 *
 * @type {Object}
 * @private
 * @since 0.1.0
 * @version 0.1.0
 */
exports.assignedAt = {
  type: Date,
  index: true
};

/**
 * @name attendedAt
 * @description A latest time when the service request(issue) was marked as
 * work in progress(attending) by latest assignee.
 *
 * @type {Object}
 * @private
 * @since 0.1.0
 * @version 0.1.0
 */
exports.attendedAt = {
  type: Date,
  index: true
};

/**
 * @name completedAt
 * @description A latest time when the service request(issue) was marked as
 * complete(or done) by latest assignee.
 *
 * @type {Object}
 * @private
 * @since 0.1.0
 * @version 0.1.0
 */
exports.completedAt = {
  type: Date,
  index: true
};

/**
 * @name verifiedAt
 * @description A latest time when the service request(issue) was verified by
 * immediate supervisor(e.g technician).
 *
 * @type {Object}
 * @private
 * @since 0.1.0
 * @version 0.1.0
 */
exports.verifiedAt = {
  type: Date,
  index: true
};

/**
 * @name approvedAt
 * @description A latest time when the service request(issue) was approved by
 * final supervisor(e.g engineer).
 *
 * @type {Object}
 * @private
 * @since 0.1.0
 * @version 0.1.0
 */
exports.approvedAt = {
  type: Date,
  index: true
};

/**
 * @name resolvedAt
 * @description A latest time when the service request(issue) was resolved.
 *
 * @type {Object}
 * @private
 * @since 0.1.0
 * @version 0.1.0
 */
exports.resolvedAt = {
  type: Date,
  index: true
};

/**
 * @name reopenedAt
 * @description A latest time when the service request(issue) was reopened
 *
 * @type {Object}
 * @private
 * @since 0.1.0
 * @version 0.1.0
 */
exports.reopenedAt = {
  type: Date,
  index: true
};
