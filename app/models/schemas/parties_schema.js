'use strict';

const { ObjectId } = require('@lykmapipo/mongoose-common');
const Party = require('../party_model');


/**
 * @name base
 * @description Common base fields for service request and changelog
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
 * @name operator
 * @description A party oversee the work on the service request(issue).
 *
 * It also a party that is answerable for the progress and status
 * of the service request(issue) to a reporter.
 *
 * For jurisdiction that own a call center, then operator is a person
 * who received a call or confirm the service request(issue) with a reporter.
 *
 * @type {Object}
 * @see {@link Party}
 * @private
 * @since 0.1.0
 * @version 0.1.0
 */
exports.operator = {
  type: ObjectId,
  ref: Party.MODEL_NAME,
  index: true,
  exists: true,
  aggregatable: { unwind: true },
  autopopulate: {
    select: 'name email phone',
    maxDepth: 1
  }
};

/**
 * @name assignee
 * @description A latest party assigned to work on the service request(issue).
 *
 * It also a party that is answerable for the progress and
 * status of the service request(issue) to operator and overall
 * jurisdiction administrative structure.
 *
 * @type {Object}
 * @see {@link Party}
 * @private
 * @since 0.1.0
 * @version 0.1.0
 */
exports.assignee = {
  type: ObjectId,
  ref: Party.MODEL_NAME,
  index: true,
  exists: true,
  aggregatable: { unwind: true },
  autopopulate: {
    select: 'name email phone',
    maxDepth: 1
  }
};
