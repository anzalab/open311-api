'use strict';

/**
 * @name send
 * @module send
 * @description utilities for sendind different type of messages on top of
 *              open311-messages
 *
 * @see {@link Message}
 * @author lally elias <lallyelias87@mail.com>
 * @since 0.1.0
 * @version 0.1.0
 * @public 
 */


//dependencies
const _ = require('lodash');
const config = require('config');
const environment = require('execution-environment');
const infobip = require('open311-infobip');
const phone = require('phone');
const mongoose = require('mongoose');
const Message = mongoose.model('Message');


/**
 * @name formatPhoneNumberToE164
 * @description format provided mobile phone number to E.164 format
 * @param  {String} phoneNumber a phone number to be formatted
 * @param {String} [country] 2 or 3 letter ISO country code. default to TZ
 * @return {String} E.164 formated phone number without leading plus sign
 * @see {@link https://en.wikipedia.org/wiki/E.164|e.164}
 * @author lally elias <lallyelias87@mail.com>
 * @since 0.1.0
 * @version 0.1.0
 * @public
 */
exports.formatPhoneNumberToE164 = function (phoneNumber, countryCode) {

  //try convert give phone number to e.164
  try {
    countryCode = countryCode || 'TZ';
    phoneNumber = phone(phoneNumber, countryCode);
    phoneNumber = _.first(phoneNumber).replace(/\+/g, '');
    return phoneNumber;
  }

  //fail to convert, return original format
  catch (error) {
    return phoneNumber;
  }

};


/**
 * @name sms
 * @description send a given message as an sms
 * @param  {Message|Object}   message valid message instance or definition
 * @param  {Function} done    a callback to invoke on success or failure
 * @see {@link Message}
 * @author lally elias <lallyelias87@mail.com>
 * @since 0.1.0
 * @version 0.1.0
 * @public
 */
exports.sms = function (message, done) {

  //obtain current execution environment
  const isProduction = environment.isProd();

  //obtain sms configuration
  const options = config.get('infobip');
  const shouldSendSynchronously = options.sync;


  //prepare sms message
  const isMessageInstance = message instanceof Message;
  message = isMessageInstance ? message : new Message(message);

  //ensure message sender
  message.from = message.from || options.from;

  //ensure number is in e.164 format
  let to = _.map(message.to, function (to) {
    return exports.formatPhoneNumberToE164(to); //TODO support other countries
  });
  to = _.compact(to);
  message.to = to;

  //queue message in production
  //or if is asynchronous send
  if (isProduction && !shouldSendSynchronously) {
    infobip.queue(message);
    done(null, message); //TODO listen to queue errors and notify
  }

  //direct sms send in development & test
  else {

    //force message persist
    message.save(function (error, saved) {

      //back-off in case of error
      if (error) {
        done(error);
      }

      //continue with sending
      else {
        //send sms synchronous
        infobip.send(saved, function (error /*, result*/ ) {
          done(error, saved);
        });
      }

    });

  }

};
