'use strict';


/**
 * @module Status
 * @name Status
 * @description Manage entity(i.e service & service request(issue)) status.
 *
 *              Provides a way set status of service and service request
 *              types (issues) in order to track their progress.
 *
 * @see {@link Service}
 * @see {@link ServiceRequest}
 * @author lally elias <lallyelias87@mail.com>
 * @since 0.1.0
 * @version 0.1.0
 * @public
 */


//TODO review if status differ between jurisdictions
//TODO implement status in service request to expose list of applicable
//statuses
//TODO add support to status note
//TODO add flag for default status


//dependencies
const { Status } = require('@codetanzania/majifix-status');


/**
 * @name Status
 * @description register StatusSchema and initialize Status
 *              model
 * @type {Model}
 * @since 0.1.0
 * @version 0.1.0
 * @public
 */
module.exports = Status;
