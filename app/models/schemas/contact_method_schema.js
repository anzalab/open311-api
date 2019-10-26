'use strict';

const { createSubSchema } = require('@lykmapipo/mongoose-common');
const {
  CONTACT_METHOD_PHONE_CALL,
  CONTACT_METHODS,
  WORKSPACE_OTHER
} = require('@codetanzania/majifix-common');

//TODO track if contact method is external method(or channel)

/**
 * @module ChangeLog
 * @name ChangeLog
 * @description Representing a method used by reporter or workspace
 * to receive(or report) service request.
 *
 * Example a customer may call call center and operator log the
 * service request, then a contact method is a call and workspace
 * is call center.
 *
 * @see {@link ServiceRequest}
 * @see {@link Party}
 * @author lally elias <lallyelias87@mail.com>
 * @type {Schema}
 * @since 0.1.0
 * @version 0.1.0
 * @public
 */
const ContactMethod = createSubSchema({
  /**
   * @name name
   * @description A communication(contact) method(mechanism) used by a reporter
   *              to report the issue
   *
   * @type {Object}
   * @private
   * @since 0.1.0
   * @version 0.1.0
   */
  name: {
    type: String,
    index: true,
    default: CONTACT_METHOD_PHONE_CALL,
    enum: CONTACT_METHODS,
    searchable: true
  },

  /**
   * @name workspace
   * @description workspace used be operator to receive service request
   * @type {Object}
   * @private
   * @since 0.1.0
   * @version 0.1.0
   */
  workspace: {
    type: String,
    index: true,
    default: WORKSPACE_OTHER,
    searchable: true
  }
});

/**
 * @name ContactMethod
 * @description exports contact method schema
 * @type {Schema}
 * @since  0.1.0
 * @version 0.1.0
 * @public
 */
module.exports = exports = ContactMethod;
