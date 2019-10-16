'use strict';

const { createSubSchema } = require('@lykmapipo/mongoose-common');

//constants

//methods
const PHONE_CALL = 'Call';
const EMAIL = 'Email';
const SMS = 'SMS';
const USSD = 'USSD';
const VISIT = 'Visit';
const LETTER = 'Letter';
const FAX = 'Fax';
const MOBILE_APP = 'Mobile';
const WEBSITE = 'Website';
const METHODS = [
  PHONE_CALL,
  EMAIL,
  SMS,
  USSD,
  VISIT,
  LETTER,
  FAX,
  MOBILE_APP,
  WEBSITE
];
const WEB_METHODS = [PHONE_CALL, EMAIL, SMS, VISIT, LETTER, FAX];

//TODO track if contact method is external method(or channel)

/**
 * @module ChangeLog
 * @name ChangeLog
 * @description Representing a method used by reporter or workspace
 *              to receive(or report) service request.
 *
 *              Example a customer may call call center and operator log the service request, then
 *              a contact method is a call and workspace is call center.
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
    default: PHONE_CALL,
    enum: METHODS,
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
    searchable: true // TODO set default: Unknown
  }
});

//---------------------------------------------------------
// ContactMethod Statics
//---------------------------------------------------------

//expose contact methods(constants)
ContactMethod.PHONE_CALL = ContactMethod.statics.PHONE_CALL = PHONE_CALL;

ContactMethod.EMAIL = ContactMethod.statics.EMAIL = EMAIL;

ContactMethod.SMS = ContactMethod.statics.SMS = SMS;

ContactMethod.VISIT = ContactMethod.statics.VISIT = VISIT;

ContactMethod.LETTER = ContactMethod.statics.LETTER = LETTER;

ContactMethod.FAX = ContactMethod.statics.FAX = FAX;

ContactMethod.MOBILE_APP = ContactMethod.statics.MOBILE_APP = MOBILE_APP;

ContactMethod.WEBSITE = ContactMethod.statics.WEBSITE = WEBSITE;

ContactMethod.METHODS = ContactMethod.statics.METHODS = METHODS;

ContactMethod.WEB_METHODS = ContactMethod.statics.WEB_METHODS = WEB_METHODS;

/**
 * @name ContactMethod
 * @description exports contact method schema
 * @type {Schema}
 * @since  0.1.0
 * @version 0.1.0
 * @public
 */
module.exports = exports = ContactMethod;
