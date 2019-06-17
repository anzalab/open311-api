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
const { getString, getBoolean, isProduction } = require('@lykmapipo/env');
const { Message, SMS } = require('@lykmapipo/postman');
const { toE164 } = require('@lykmapipo/phone');


/* constants */
const DEFAULT_SMS_SENDER_ID = getString('DEFAULT_SMS_SENDER_ID');
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
exports.formatPhoneNumberToE164 = toE164;


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

  //prepare sms message
  const isMessageInstance = message instanceof Message;
  message = isMessageInstance ? message.toObject() : message;

  //ensure message sender
  message.sender = (message.sender || DEFAULT_SMS_SENDER_ID);

  //ensure receivers number are in e.164 format
  let receivers = _.uniq(_.compact([].concat(message.to)));
  receivers = _.map(receivers, function (receiver) {
    return toE164(receiver);
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
