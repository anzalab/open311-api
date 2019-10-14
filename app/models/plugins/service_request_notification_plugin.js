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

//TODO notify customer details to update details based on the account id
//TODO send service request ticket to area/agency/jurisdiction(sms or email)
//TODO send service request ticket to assignee(sms or email)
//TODO migrate to use queue than sync transport once everything works fine

//global dependencies
const _ = require('lodash');
const mongoose = require('mongoose');
const { parseTemplate } = require('@lykmapipo/common');
const { getString } = require('@lykmapipo/env');


//libs
const Send = require('../../libs/send');


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
   * @type {Function}
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
   * @type {Function}
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
   * @name sendOpenTicketToReporter
   * @description try sending opened service request ticket number to a
   *              reporter
   * @param  {Function} next a callback to invoke on success or failure
   * @private
   * @since 0.1.0
   * @version 0.1.0
   * @type {Function}
   */
  schema.post('save',
    function sendOpenTicketToReporter(serviceRequest, next) {


      //refs
      const Message = mongoose.model('Message');

      //check if should send open ticket notification to reporter
      const sendTicket =
        (!serviceRequest.wasOpenTicketSent &&
          !_.isEmpty(serviceRequest.reporter.phone) &&
          !serviceRequest.resolvedAt);

      //send open notification to a reporter
      if (sendTicket) {

        //compile message to send to reporter
        const template = getString('TEMPLATES_TICKET_OPEN');
        const body = parseTemplate(template, {
          ticket: serviceRequest.code,
          service: serviceRequest.service.name.en,
          phone: getString('APP_PHONE')
        });

        //TODO send email
        //TODO send push

        //prepare sms message
        const message = {
          type: Message.TYPE_SMS,
          to: serviceRequest.reporter.phone,
          body: body
        };

        //send message
        Send.sms(message, function (error /*, result*/ ) {

          //error, back-off
          if (error) {
            next(error);
          }

          //set open ticket notification was sent
          else {
            serviceRequest.wasOpenTicketSent = true;
            serviceRequest.save(function (error, saved) {
              next(error, saved);
            });
          }

        });

      }

      //continue without sending open ticket notification
      else {
        next();
      }

    });


  /**
   * @name sendResolveTicketToReporter
   * @description try sending resolve ticket to customer once service request
   *              marked as resolved
   * @param  {Function} next a callback to invoke on success or failure
   * @private
   * @since 0.1.0
   * @version 0.1.0
   * @type {Function}
   */
  schema.post('save',
    function sendResolveTicketToReporter(serviceRequest, next) {

      //refs
      const Message = mongoose.model('Message');

      //check if should send resolve ticket to reporter
      const sendTicket =
        (serviceRequest.resolvedAt && !serviceRequest.wasResolveTicketSent &&
          !_.isEmpty(serviceRequest.reporter.phone));

      //send resolve nofitication to a reporter
      if (sendTicket) {

        //compile message to send to reporter
        const template = getString('TEMPLATES_TICKET_RESOLVE');
        const body = parseTemplate(template, {
          ticket: serviceRequest.code,
          service: serviceRequest.service.name.en,
          phone: getString('APP_PHONE')
        });

        //TODO use campaign
        //TODO send email
        //TODO send push

        //prepare sms message
        const message = {
          type: Message.TYPE_SMS,
          to: serviceRequest.reporter.phone,
          body: body
        };

        //send message
        Send.sms(message, function (error /*, result*/ ) {

          //error, back-off
          if (error) {
            next(error);
          }

          //set resolve notification was sent
          else {
            serviceRequest.wasResolveTicketSent = true;
            serviceRequest.save(function (error, saved) {
              next(error, saved);
            });
          }

        });

      }

      //continue without sending resolve notification
      else {
        next();
      }

    });


};
