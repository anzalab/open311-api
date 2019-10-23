'use strict';

const { idOf } = require('@lykmapipo/common');
const { ObjectId, isObjectId } = require('@lykmapipo/mongoose-common');
const Party = require('../party_model');

let operator;
let assignee;
let changer;
let team;

/**
 * @name parties
 * @description Common parties fields for service request and changelog
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
exports.operator = operator = {
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
exports.assignee = assignee = {
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
 * @name changer
 * @description A party who made changes to a service request(issue).
 *
 * @type {Object}
 * @see {@link Party}
 * @since 0.1.0
 * @version 0.1.0
 * @instance
 */
exports.changer = changer = {
  type: ObjectId,
  ref: Party.MODEL_NAME,
  index: true,
  exists: true,
  autopopulate: {
    select: 'name email phone',
    maxDepth: 1
  },
  aggregatable: { unwind: true }
};

/**
 * @name team
 * @description A parties who work, follow and watch a service request(issue).
 *
 * These are parties get notified when an action(or changes) has been applied
 * to a service request.
 *
 * Assignee and Operator are directly subscribed to a team, other parties may
 * opt to follow or added.
 *
 * @type {Object}
 * @see {@link Party}
 * @since 0.1.0
 * @version 0.1.0
 * @instance
 */
exports.team = team = {
  type: [ObjectId],
  ref: Party.MODEL_NAME,
  index: true,
  // exists: true,
  duplicate: (a, b) => { // TODO: refactor to areSameObjectId(vali8&common)
    const idOfA = idOf(a) || a;
    const idOfB = idOf(b) || b;
    if (isObjectId(idOfA)) {
      return idOfA.equals(idOfB);
    }
    return idOfA === idOfB;
  },
  autopopulate: {
    select: 'name email phone relation',
    maxDepth: 1
  },
};


exports.requestParties = { operator, assignee, team };
exports.changelogParties = { assignee, changer };
