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
const path = require('path');
const _ = require('lodash');
const mongoose = require('mongoose');
const parseTemplate = require('string-template');
const config = require('config');


//libs
const Send = require(path.join(__dirname, '..', '..', 'libs', 'send'));


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
   * @name sendOpenTicket
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
          !_.isEmpty(serviceRequest.reporter.phone));

      //send open notification to a reporter
      if (sendTicket) {

        //compile message to send to reporter
        const template = config.get('infobip').templates.ticket.open;
        const body = parseTemplate(template, {
          ticket: serviceRequest.code,
          service: serviceRequest.service.name,
          phone: config.get('phone')
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
            serviceRequest.save(next);
          }

        });

      }

      //continue without sending open ticket notification
      else {
        next();
      }

    });


  /**
   * @name sendResolveTicket
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
        const template = config.get('infobip').templates.ticket.resolve;
        const body = parseTemplate(template, {
          ticket: serviceRequest.code,
          service: serviceRequest.service.name,
          phone: config.get('phone')
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

          //set resolve notification was sent
          else {
            serviceRequest.wasResolveTicketSent = true;
            serviceRequest.save(next);
          }

        });

      }

      //continue without sending resolve notification
      else {
        next();
      }

    });


};
