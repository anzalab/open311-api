'use strict';
/**
 * ServiceRequest Router
 *
 * @description :: Server-side router for managing ServiceRequest.
 */

//dependencies
const path = require('path');
const express = require('express');
const router = express.Router();
const controller =
  require(path.join(__dirname, '..', 'controllers', 'service_request_controller'));

//enable token authentication
const jwtAuth = require(path.join(__dirname, '..', 'middlewares', 'jwtAuth'));

//add specific middlewares to servicerequests router
router.all('/servicerequests*', jwtAuth);

/**
 * Handle Http GET on /servicerequests
 * @description display a list of all servicerequests
 * @param  {HttpRequest} request  a http request
 * @param  {HttpResponse} response a http response
 */
router.get('/servicerequests', function (request, response, next) {
  controller.index(request, response, next);
});


/**
 * Handle Http POST on /servicerequests
 * @description create a new servicerequest
 * @param  {HttpRequest} request  a http request
 * @param  {HttpResponse} response a http response
 */
router.post('/servicerequests', function (request, response, next) {
  controller.create(request, response, next);
});


/**
 * Handle Http GET on /servicerequests/:id
 * @description display a specific servicerequest
 * @param  {HttpRequest} request  a http request
 * @param  {HttpResponse} response a http response
 */
router.get('/servicerequests/:id', function (request, response, next) {
  controller.show(request, response, next);
});


/**
 * Handle Http PUT on /servicerequests/:id
 * @description update a specific servicerequest
 * @param  {HttpRequest} request  a http request
 * @param  {HttpResponse} response a http response
 */
router.put('/servicerequests/:id', function (request, response, next) {
  controller.update(request, response, next);
});


/**
 * Handle Http PATCH on /servicerequests/:id
 * @description update a specific servicerequest
 * @param  {HttpRequest} request  a http request
 * @param  {HttpResponse} response a http response
 */
router.patch('/servicerequests/:id', function (request, response, next) {
  controller.update(request, response, next);
});


/**
 * Handle Http DELETE on /servicerequests/:id
 * @description delete a specific servicerequest
 * @param  {HttpRequest} request  a http request
 * @param  {HttpResponse} response a http response
 */
router.delete('/servicerequests/:id', function (request, response, next) {
  controller.destroy(request, response, next);
});


/**
 * exports servicerequests router
 * @type {Object}
 */
module.exports = router;
