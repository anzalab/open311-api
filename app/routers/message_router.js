'use strict';


/**
 * Message Router
 *
 * @description :: Server-side router for managing Message.
 */


//dependencies
const path = require('path');
const express = require('express');
const router = express.Router();
const controller =
  require(path.join(__dirname, '..', 'controllers', 'message_controller'));

//enable token authentication
const jwtAuth = require(path.join(__dirname, '..', 'middlewares', 'jwtAuth'));

//add specific middlewares to messages router
router.all('/messages*', jwtAuth);

/**
 * Handle Http GET on /messages
 * @description display a list of all messages
 * @param  {HttpRequest} request  a http request
 * @param  {HttpResponse} response a http response
 */
router.get('/messages', function (request, response, next) {
  controller.index(request, response, next);
});


/**
 * Handle Http POST on /messages
 * @description create a new message
 * @param  {HttpRequest} request  a http request
 * @param  {HttpResponse} response a http response
 */
router.post('/messages', function (request, response, next) {
  controller.create(request, response, next);
});


/**
 * Handle Http GET on /messages/:id
 * @description display a specific message
 * @param  {HttpRequest} request  a http request
 * @param  {HttpResponse} response a http response
 */
router.get('/messages/:id', function (request, response, next) {
  controller.show(request, response, next);
});


/**
 * Handle Http PUT on /messages/:id
 * @description update a specific message
 * @param  {HttpRequest} request  a http request
 * @param  {HttpResponse} response a http response
 */
router.put('/messages/:id', function (request, response, next) {
  controller.update(request, response, next);
});


/**
 * Handle Http PATCH on /messages/:id
 * @description update a specific message
 * @param  {HttpRequest} request  a http request
 * @param  {HttpResponse} response a http response
 */
router.patch('/messages/:id', function (request, response, next) {
  controller.update(request, response, next);
});


/**
 * Handle Http DELETE on /messages/:id
 * @description delete a specific message
 * @param  {HttpRequest} request  a http request
 * @param  {HttpResponse} response a http response
 */
router.delete('/messages/:id', function (request, response, next) {
  controller.destroy(request, response, next);
});


/**
 * exports messages router
 * @type {Object}
 */
module.exports = router;
