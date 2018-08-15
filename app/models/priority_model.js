'use strict';


/**
 * @module Priority
 * @name Priority
 * @description Manage entity(i.e service & service request(issue)) priority.
 *
 *              Provides a way to prioritize service and service request
 *              types (issues) in order of their importance.
 *
 * @see {@link Service}
 * @see {@link ServiceRequest}
 * @author lally elias <lallyelias87@mail.com>
 * @since 0.1.0
 * @version 0.1.0
 * @public
 */


//TODO review if priority differ between jurisdictions
//TODO implement priority in service request to expose list of applicable
//priority


//dependencies
const { Priority } = require('@codetanzania/majifix-priority');


/**
 * @name Priority
 * @description register PrioritySchema and initialize Priority
 *              model
 * @type {Model}
 * @since 0.1.0
 * @version 0.1.0
 * @public
 */
module.exports = Priority;
