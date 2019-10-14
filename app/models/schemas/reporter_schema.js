'use strict';

const { createSubSchema } = require('@lykmapipo/mongoose-common');

/**
 * @module Reporter
 * @description reporter schema used to log issue(service request)
 *              reporter(customer or civilian)
 *
 * @see {@link ServiceRequest}
 * @author lally elias<lallyelias87@gmail.com>
 * @type {Schema}
 * @since  0.1.0
 * @version 0.1.0
 * @public
 */
const ReporterSchema = createSubSchema({
  /**
   * @name name
   * @description Full name name of the reporter.
   * @type {Object}
   * @private
   * @since 0.1.0
   * @version 0.1.0
   */
  name: {
    type: String,
    trim: true,
    index: true,
    // required:true,
    searchable: true,
    taggable: true
  },


  /**
   * @name phone
   * @description A mobile phone number of the reporter.
   * @type {Object}
   * @private
   * @since 0.1.0
   * @version 0.1.0
   */
  phone: { //TODO should we rename to mobile so that we can accomodate others?
    type: String,
    required: true,
    index: true,
    searchable: true,
    taggable: true
  },


  /**
   * @name email
   * @description An email address of the reporter.
   * @type {Object}
   * @private
   * @since 0.1.0
   * @version 0.1.0
   */
  email: {
    type: String,
    trim: true,
    lowercase: true,
    index: true,
    searchable: true,
    taggable: true
  },


  /**
   * @name account
   * @description A jurisdiction internal associated account id of the
   *              reporter submitting the request(issue).
   *
   *              This help a jurisdiction to link a reporter with their
   *              internal customer database if available.
   *
   *              When account id is available a reporter will be treated as
   *              a customer and not a normal civilian.
   *
   * @type {Object}
   * @private
   * @since 0.1.0
   * @version 0.1.0
   */
  account: {
    type: String,
    trim: true,
    index: true,
    searchable: true,
    taggable: true
  }

});


//---------------------------------------------------------
// ReporterSchema Hooks
//---------------------------------------------------------


/**
 * @name  preValidate
 * @description pre validation logics for call
 * @param  {Function} next a callback to be called after pre validation logics
 * @since  0.1.0
 * @version 0.1.0
 * @private
 */
ReporterSchema.pre('validate', function (next) {

  //TODO convert phone number to E.164 format

  next(null, this);

});


/**
 * @name ReporterSchema
 * @description exports reporter schema
 * @type {Schema}
 * @since  0.1.0
 * @version 0.1.0
 * @public
 */
module.exports = exports = ReporterSchema;
