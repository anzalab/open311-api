'use strict';


/**
 * @module ServiceGroup
 * @name ServiceGroup
 * @description Provide ability to group service offered by a jurisdiction(s)
 *              into meaningful categories e.g Sanitation
 *
 *              It provides a way to group several service request types
 *              (issues) under meaningful categories such as Sanitation,
 *              Commercial, Billing, Non-Commercial etc.
 *
 * @see {@link Jurisdiction}
 * @author lally elias <lallyelias87@mail.com>
 * @since 0.1.0
 * @version 0.1.0
 * @public
 */


//dependencies
const { ServiceGroup } = require('@codetanzania/majifix-service-group');


/**
 * @name ServiceGroup
 * @description register ServiceGroupSchema and initialize ServiceGroup
 *              model
 * @type {Model}
 * @since 0.1.0
 * @version 0.1.0
 * @public
 */
module.exports = ServiceGroup;
