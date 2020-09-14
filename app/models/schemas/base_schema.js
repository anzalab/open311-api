'use strict';

const _ = require('lodash');
const { mergeObjects } = require('@lykmapipo/common');
const { ObjectId } = require('@lykmapipo/mongoose-common');
const { Predefine } = require('@lykmapipo/predefine');
const { Jurisdiction } = require('@codetanzania/majifix-jurisdiction');
const { Priority } = require('@codetanzania/majifix-priority');
const { ServiceGroup } = require('@codetanzania/majifix-service-group');
const { Service } = require('@codetanzania/majifix-service');
const { Status } = require('@codetanzania/majifix-status');

let jurisdiction;
let zone;
let type;
let group;
let service;
let status;
let priority;
let cause;
let measure;
let advisory;

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
 * @name jurisdiction
 * @description A jurisdiction responsible in handling service request(issue).
 *
 * @type {Object}
 * @see {@link Jurisdiction}
 * @private
 * @since 0.1.0
 * @version 0.1.0
 */
exports.jurisdiction = jurisdiction = {
  type: ObjectId,
  ref: Jurisdiction.MODEL_NAME,
  required: true,
  index: true,
  exists: true,
  // exists: { default: true, match: { default: true }, select: { name: 1 } }
  aggregatable: { unwind: true },
  autopopulate: {
    select: 'code name phone email website',
    maxDepth: 1
  }
};

/**
 * @name zone
 * @description A jurisdiction zone(or branch, neighbourhood) responsible
 * in handling service request(issue).
 *
 * @type {Object}
 * @see {@link Predefine}
 * @private
 * @since 0.1.0
 * @version 0.1.0
 */
exports.zone = zone = {
  type: ObjectId,
  ref: Predefine.MODEL_NAME,
  // required: true,
  index: true,
  exists: true,
  aggregatable: { unwind: true },
  autopopulate: {
    select: 'code name'
  }
};


/**
 * @name type
 * @description A service type underwhich request(issue) belongs to.
 *
 * @type {Object}
 * @see {@link Predefine}
 * @private
 * @since 0.1.0
 * @version 0.1.0
 */
exports.type = type = {
  type: ObjectId,
  ref: Predefine.MODEL_NAME,
  // required: true,
  index: true,
  exists: true,
  aggregatable: { unwind: true },
  autopopulate: Predefine.OPTION_AUTOPOPULATE,
};


/**
 * @name group
 * @description A service group undewhich request(issue) belongs to.
 *
 * @type {Object}
 * @see {@link ServiceGroup}
 * @private
 * @since 0.1.0
 * @version 0.1.0
 */
exports.group = group = {
  type: ObjectId,
  ref: ServiceGroup.MODEL_NAME,
  required: true,
  index: true,
  exists: true,
  aggregatable: { unwind: true },
  autopopulate: {
    select: 'code name color',
    maxDepth: 1
  }
};


/**
 * @name service
 * @description A service undewhich request(issue) belongs to.
 *
 * @type {Object}
 * @see {@link Service}
 * @private
 * @since 0.1.0
 * @version 0.1.0
 */
exports.service = service = {
  type: ObjectId,
  ref: Service.MODEL_NAME,
  required: true,
  index: true,
  exists: true,
  aggregatable: { unwind: true },
  autopopulate: {
    select: 'code name color group isExternal', // remove group?
    maxDepth: 1
  }
};


/**
 * @name status
 * @description A current status of the service request(issue).
 *
 * @type {Object}
 * @see {@link Status}
 * @private
 * @since 0.1.0
 * @version 0.1.0
 */
exports.status = status = {
  type: ObjectId,
  ref: Status.MODEL_NAME,
  // required: true,
  index: true,
  exists: true,
  aggregatable: { unwind: true },
  autopopulate: {
    maxDepth: 1
  }
};


/**
 * @name priority
 * @description A priority of the service request(issue).
 *
 * It used to weight a service request(issue) relative to other(s).
 *
 * @type {Object}
 * @see {@link Priority}
 * @private
 * @since 0.1.0
 * @version 0.1.0
 */
exports.priority = priority = {
  type: ObjectId,
  ref: Priority.MODEL_NAME,
  // required: true,
  index: true,
  exists: true,
  aggregatable: { unwind: true },
  autopopulate: {
    maxDepth: 1
  }
};

/**
 * @name cause
 * @description A root cause underwhich request(issue) belongs to.
 *
 * This field is used for quality control.
 *
 * @type {Object}
 * @see {@link Predefine}
 * @private
 * @since 0.1.0
 * @version 0.1.0
 */
exports.cause = cause = {
  type: ObjectId,
  ref: Predefine.MODEL_NAME,
  // required: true,
  index: true,
  exists: true,
  aggregatable: { unwind: true },
  autopopulate: Predefine.OPTION_AUTOPOPULATE,
};

/**
 * @name measure
 * @description A action taken to resolve a service request(issue).
 *
 * This field is used for quality control.
 *
 * @type {Object}
 * @see {@link Predefine}
 * @private
 * @since 0.1.0
 * @version 0.1.0
 */
exports.measure = measure = {
  type: ObjectId,
  ref: Predefine.MODEL_NAME,
  // required: true,
  index: true,
  exists: true,
  aggregatable: { unwind: true },
  autopopulate: Predefine.OPTION_AUTOPOPULATE,
};


/**
 * @name advisoru
 * @description A recommendation or suggested way forward for the resolved
 * service request(issue).
 *
 * This field is used for quality control.
 *
 * @type {Object}
 * @see {@link Predefine}
 * @private
 * @since 0.1.0
 * @version 0.1.0
 */
exports.advisory = advisory = {
  type: ObjectId,
  ref: Predefine.MODEL_NAME,
  // required: true,
  index: true,
  exists: true,
  aggregatable: { unwind: true },
  autopopulate: Predefine.OPTION_AUTOPOPULATE,
};


exports.requestBase = mergeObjects({
  jurisdiction,
  zone,
  type,
  group,
  service,
  status,
  priority,
  cause,
  measure,
  advisory
});
exports.changelogBase = _.mapValues(
  mergeObjects(exports.requestBase),
  optns => {
    delete optns.required;
    delete optns.exists;
    return optns;
  });
