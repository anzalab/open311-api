'use strict';


//dependencies
const path = require('path');
const _ = require('lodash');
const config = require('config');
const { Message } = require('@lykmapipo/postman');
const parseTemplate = require('string-template');

//libs
const Send = require(path.join(__dirname, '..', 'libs', 'send'));


/**
 * Message Controller
 *
 * @description :: Server-side logic for managing Message.
 */
module.exports = {
  /**
   * @function
   * @name messages.index()
   * @description display a list of all messages
   * @param  {HttpRequest} request  a http request
   * @param  {HttpResponse} response a http response
   */
  index: function (request, response, next) {

    //obtain request options
    const options = _.merge({}, request.mquery);

    Message
      .get(options, function onGetMessages(error, results) {

        //forward error
        if (error) {
          next(error);
        }

        //handle response
        else {
          response.status(200);
          response.json(results);
        }

      });

  },


  /**
   * @function
   * @name messages.create()
   * @description create a new message
   * @param  {HttpRequest} request  a http request
   * @param  {HttpResponse} response a http response
   */
  create: function (request, response, next) {

    //send sms by default
    let message = request.body;
    message.type = message.type || Message.TYPE_SMS;

    //check for sms template to use
    if (message.template) {
      //compile message to send
      const template = _.get(config.get('infobip').templates, message.template) ||
        _.get(config.get('infobip').templates.ticket, message.template);
      message.body = parseTemplate(template, message);
    }

    Send
      .sms(message, function (error, message) {
        if (error) {
          next(error);
        } else {
          response.created(message);
        }
      });
  },


  /**
   * @function
   * @name messages.show()
   * @description display a specific message
   * @param  {HttpRequest} request  a http request
   * @param  {HttpResponse} response a http response
   */
  show: function (request, response, next) {

    //obtain request options
    const options = _.merge({}, request.mquery);

    //obtain jurisdiction id
    options._id = request.params.id;

    Message
      .getById(options, function onGetMessage(error, found) {

        //forward error
        if (error) {
          next(error);
        }

        //handle response
        else {
          response.status(200);
          response.json(found);
        }

      });

  },


  /**
   * @function
   * @name messages.update()
   * @description update a specific message
   * @param  {HttpRequest} request  a http request
   * @param  {HttpResponse} response a http response
   */
  update: function (request, response /*, next*/ ) {

    //prevent message updating
    let error = new Error('Method Not Allowed');
    error.status = error.message;
    error.code = 405;
    response.methodNotAllowed(error);

  },


  /**
   * @function
   * @name messages.destroy()
   * @description delete a specific message
   * @param  {HttpRequest} request  a http request
   * @param  {HttpResponse} response a http response
   */
  destroy: function (request, response /*, next*/ ) {
    //prevent message deleting
    let error = new Error('Method Not Allowed');
    error.status = error.message;
    error.code = 405;
    response.methodNotAllowed(error);
  }

};
