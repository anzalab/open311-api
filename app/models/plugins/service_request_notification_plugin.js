'use strict';

/**
 * @name notification
 * @description extend service request with notification(i.e sms, email etc) 
 *              hook points
 *              
 * @see {@link ServiceRequest}
 * @see {@link http://mongoosejs.com/docs/api.html#aggregate_Aggregate}
 * @see {@link http://mongoosejs.com/docs/api.html#aggregate_Aggregate-lookup}
 * @author lally elias <lallyelias87@mail.com>
 * @since 0.1.0
 * @version 0.1.0
 * @public
 */

//Note!: all plugin methods will be executed in parallel at their hook points

//global dependencies
// const path = require('path');

//libs
// const Send = require(path.join(__dirname, '..', 'libs', 'send'));

module.exports = exports = function notification(schema /*, options*/ ) {

  //extend schema with nitification fields

  schema.add({
    /**
     * @name wasOpenTicketSent
     * @description tells whether a notification contain a ticket number was 
     *              sent to a service request(issue) reporter using 
     *              sms, email etc. once a service request created.
     * @type {Object}
     * @private
     * @since 0.1.0
     * @version 0.1.0
     */
    wasOpenTicketSent: {
      type: Boolean,
      default: false
    },


    /**
     * @name wasResolveTicketSent
     * @description tells whether a notification was sent to a 
     *              service request(issue) reporter using sms, email etc. once
     *              a service request was marked as resolved.
     * @type {Object}
     * @private
     * @since 0.1.0
     * @version 0.1.0
     */
    wasResolveTicketSent: {
      type: Boolean,
      default: false
    }
  });


  //extend schema with pre validation hooks


  /**
   * @name restoreOpenTicket
   * @description restore open ticket state based on changed state of the
   *              opened service request
   * @param  {Function} next next middleware
   * @param  {Function} done a callback to invoke on success or failure
   * @private
   * @since 0.1.0
   * @version 0.1.0
   */
  schema.pre('validate', true, function restoreOpenTicket(next, done) {

    //kick next middleware in parallel
    next();

    //finalize this middleware
    done();

  });


  /**
   * @name restoreResolveTicket
   * @description restore resolve ticket state based on changed state of the
   *              opened service request
   * @param  {Function} next next middleware
   * @param  {Function} done a callback to invoke on success or failure
   * @private
   * @since 0.1.0
   * @version 0.1.0
   */
  schema.pre('validate', true, function restoreResolveTicket(next, done) {
    //if re-opened void resolve ticket was sent
    if (!this.resolvedAt) {
      this.wasResolveTicketSent = false;
    }

    //kick next middleware in parallel
    next();

    //finalize this middleware
    done();

  });


  //extend schema with post save hooks


  /**
   * @name sendOpenTicket
   * @description try sending opened service request ticket number to a
   *              reporter
   * @param  {Function} next a callback to invoke on success or failure
   * @private
   * @since 0.1.0
   * @version 0.1.0
   */
  schema.post('save', function sendOpenTicket(serviceRequest, next) {

    //kick next middleware in parallel
    next();

  });


  /**
   * @name sendResolveTicket
   * @description try sending resolve ticket to customer once service request
   *              marked as resolved
   * @param  {Function} next a callback to invoke on success or failure
   * @private
   * @since 0.1.0
   * @version 0.1.0
   */
  schema.post('save', function sendResolveTicket(serviceRequest, next) {

    //kick next middleware in parallel
    next();

  });


};
