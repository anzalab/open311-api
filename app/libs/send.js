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
const config = require('config');
const environment = require('execution-environment');
const infobip = require('open311-infobip');
const mongoose = require('mongoose');
const Message = mongoose.model('Message');


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

  //TODO ensure number is in e.164 format

  //queue message in production
  //or if is asynchronous send
  if (isProduction || !shouldSendSynchronously) {
    infobip.queue(message);
    done(null, message); //TODO listen to queue errors and notify
  }

  //direct sms send in development & test
  else {
    infobip.send(message, function (error /*, result*/ ) {
      done(error, message);
    });
  }

};
