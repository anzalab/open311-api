'use strict';


/**
 * @module Permission
 * @name Permission
 * @description manage party(ies) permission(s)
 *
 *              Note!: permissions are dynamic generated during booting and
 *              are only assignable to party(user) roles.
 *
 * @author lally elias <lallyelias87@mail.com>
 * @since 0.1.0
 * @version 0.1.0
 * @public
 */


//dependencies
const { Permission } = require('@lykmapipo/permission');



/**
 * @name Permission
 * @description register PermissionSchema and initialize Permission
 *              model
 * @type {Model}
 * @since 0.1.0
 * @version 0.1.0
 * @public
 */
module.exports = Permission;
