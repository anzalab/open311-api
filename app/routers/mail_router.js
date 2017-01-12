'use strict';

/**
 * Mail Router
 *
 * @description :: Server-side router for managing Mail.
 */


//dependencies
const path = require('path');
const express = require('express');
const router = express.Router();
const controller =
  require(path.join(__dirname, '..', 'controllers', 'mail_controller'));

//enable token authentication
const jwtAuth = require(path.join(__dirname, '..', 'middlewares', 'jwtAuth'));

//add specific middlewares to mails router
router.all('/mails*', jwtAuth);

/**
 * Handle Http GET on /mails
 * @description display a list of all mails
 * @param  {HttpRequest} request  a http request
 * @param  {HttpResponse} response a http response
 */
router.get('/mails', function (request, response, next) {
  controller.index(request, response, next);
});


/**
 * Handle Http POST on /mails
 * @description create a new mail
 * @param  {HttpRequest} request  a http request
 * @param  {HttpResponse} response a http response
 */
router.post('/mails', function (request, response, next) {
  controller.create(request, response, next);
});


/**
 * Handle Http GET on /mails/:id
 * @description display a specific mail
 * @param  {HttpRequest} request  a http request
 * @param  {HttpResponse} response a http response
 */
router.get('/mails/:id', function (request, response, next) {
  controller.show(request, response, next);
});


/**
 * Handle Http PUT on /mails/:id
 * @description update a specific mail
 * @param  {HttpRequest} request  a http request
 * @param  {HttpResponse} response a http response
 */
router.put('/mails/:id', function (request, response, next) {
  controller.update(request, response, next);
});


/**
 * Handle Http PATCH on /mails/:id
 * @description update a specific mail
 * @param  {HttpRequest} request  a http request
 * @param  {HttpResponse} response a http response
 */
router.patch('/mails/:id', function (request, response, next) {
  controller.update(request, response, next);
});


/**
 * Handle Http DELETE on /mails/:id
 * @description delete a specific mail
 * @param  {HttpRequest} request  a http request
 * @param  {HttpResponse} response a http response
 */
router.delete('/mails/:id', function (request, response, next) {
  controller.destroy(request, response, next);
});


/**
 * exports mails router
 * @type {Object}
 */
module.exports = router;
