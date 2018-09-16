'use strict';

/**
 * @name send
 * @module send
 * @description utilities for send different type of messages
 *
 * @see {@link Message}
 * @author lally elias <lallyelias87@mail.com>
 * @since 0.1.0
 * @version 0.1.0
 * @public
 */


//dependencies
const _ = require('lodash');
const env = require('@lykmapipo/env');
const { Message, SMS } = require('@lykmapipo/postman');
const phone = require('phone');
const { getBoolean } = env;


/* constants */
const DEFAULT_SMS_SENDER_ID = env('DEFAULT_SMS_SENDER_ID');
const ENABLE_SYNC_TRANSPORT = getBoolean('ENABLE_SYNC_TRANSPORT', false);


/**
 * @name formatPhoneNumberToE164
 * @description format provided mobile phone number to E.164 format
 * @param {String} phoneNumber a phone number to be formatted
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
    countryCode = countryCode || env('DEFAULT_COUNTRY_CODE', 'TZ');
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
 * @param {Message|Object} message valid message instance or definition
 * @param {Function} done a callback to invoke on success or failure
 * @see {@link Message}
 * @author lally elias <lallyelias87@mail.com>
 * @since 0.1.0
 * @version 0.1.0
 * @public
 */
exports.sms = function (message, done) {

  //obtain current execution environment
  const { isProduction } = env;

  //prepare sms message
  const isMessageInstance = message instanceof Message;
  message = isMessageInstance ? message.toObject() : message;

  //ensure message sender
  message.sender = (message.sender || DEFAULT_SMS_SENDER_ID);

  //ensure receivers number are in e.164 format
  let receivers = _.uniq(_.compact([].concat(message.to)));
  receivers = _.map(receivers, function (receiver) {
    return exports.formatPhoneNumberToE164(receiver);
  });
  message.to = receivers;

  //instantiate sms
  const sms = new SMS(message);

  //queue message in production
  //or if is asynchronous send
  if (isProduction && !ENABLE_SYNC_TRANSPORT) {
    sms.queue();
    done(null, sms);
  }

  //direct sms send in development & test
  else {
    sms.send(done);
  }

};
