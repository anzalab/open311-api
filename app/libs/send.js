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

const _ = require('lodash');
const { uniq } = require('@lykmapipo/common');
const { getString, getBoolean, isProduction } = require('@lykmapipo/env');
const { toE164 } = require('@lykmapipo/phone');
const {
  CHANNEL_EMAIL,
  CHANNEL_PUSH,
  Message,
  Campaign,
  SMS,
  Email,
  Push
} = require('@lykmapipo/postman');


/* constants */
const DEFAULT_EMAIL_SENDER = getString('SMTP_FROM');
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
 * @deprecated
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
exports.sms = function sendSMS(message, done) {
  // prepare sms message
  const isMessageInstance = message instanceof Message;
  message = isMessageInstance ? message.toObject() : message;

  // force message type to sms
  message.type = Message.TYPE_SMS;

  // ensure message sender
  message.sender = (message.sender || DEFAULT_SMS_SENDER_ID);

  // ensure receivers number are in e.164 format
  let receivers = uniq([].concat(message.to));
  receivers = _.map(receivers, receiver => {
    return toE164(receiver);
  });
  message.to = receivers;

  // instantiate sms
  const sms = new SMS(message);

  // queue message in production
  // or if is asynchronous send
  if (isProduction() && !ENABLE_SYNC_TRANSPORT) {
    sms.queue();
    done(null, sms);
  }

  // direct sms send in development & test
  else {
    sms.send(done);
  }

};

/**
 * @name push
 * @description send a given message as push notification
 * @param {Message|Object} message valid message instance or definition
 * @param {Function} done a callback to invoke on success or failure
 * @see {@link Message}
 * @author lally elias <lallyelias87@mail.com>
 * @since 0.1.0
 * @version 0.1.0
 * @public
 */
exports.push = function sendPush(message, done) {
  // prepare sms message
  const isMessageInstance = message instanceof Message;
  message = isMessageInstance ? message.toObject() : message;

  // force message type to push
  message.type = Message.TYPE_PUSH;

  // ensure receivers push token
  const receivers = uniq([].concat(message.to));
  message.to = receivers;

  // instantiate push
  const push = new Push(message);

  // queue message in production
  // or if is asynchronous send
  if (isProduction() && !ENABLE_SYNC_TRANSPORT) {
    push.queue();
    done(null, push);
  }

  // direct push send in development & test
  else {
    push.send(done);
  }

};

/**
 * @name email
 * @description send a given message as email
 * @param {Message|Object} message valid message instance or definition
 * @param {Function} done a callback to invoke on success or failure
 * @see {@link Message}
 * @author lally elias <lallyelias87@mail.com>
 * @since 0.1.0
 * @version 0.1.0
 * @public
 */
exports.email = function sendEmail(message, done) {
  // prepare sms message
  const isMessageInstance = message instanceof Message;
  message = isMessageInstance ? message.toObject() : message;

  // force message type to email
  message.type = Message.TYPE_EMAIL;

  // ensure message sender
  message.sender = (message.sender || DEFAULT_EMAIL_SENDER);

  // ensure receivers emails
  const receivers = uniq([].concat(message.to));
  message.to = receivers;

  // ensure cc'ed
  const cced = uniq([].concat(message.cc));
  message.cc = cced;

  // ensure bcc'ed
  const bcced = uniq([].concat(message.bcc));
  message.bcc = bcced;

  // instantiate email
  const email = new Email(message);

  // queue message in production
  // or if is asynchronous send
  if (isProduction() && !ENABLE_SYNC_TRANSPORT) {
    email.queue();
    done(null, email);
  }

  // direct email send in development & test
  else {
    email.send(done);
  }

};


/**
 * @name campaign
 * @description send a given campaign
 * @param {Object} message valid campaign instance or definition
 * @param {Function} done a callback to invoke on success or failure
 * @see {@link Message}
 * @see {@link Campaign}
 * @author lally elias <lallyelias87@mail.com>
 * @since 0.1.0
 * @version 0.1.0
 * @public
 */
exports.campaign = function sendCampaign(message, done) {
  // prepare campaign
  const isCampaignInstance = message instanceof Campaign;
  message = isCampaignInstance ? message.toObject() : message;

  // ensure campaign channels
  message.channels =
    uniq([CHANNEL_PUSH, CHANNEL_EMAIL].concat(message.channels));

  // instantiate campaign
  const campaign = new Campaign(message);

  // queue campaign in production
  // or if is asynchronous send
  if (isProduction() && !ENABLE_SYNC_TRANSPORT) {
    campaign.queue();
    done(null, campaign);
  }

  // direct send campaign in development & test
  else {
    campaign.send(done);
  }

};
