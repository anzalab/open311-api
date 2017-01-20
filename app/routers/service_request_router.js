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
  require(path.join(__dirname, '..', 'controllers',
    'service_request_controller'));

//enable token authentication
const jwtAuth = require(path.join(__dirname, '..', 'middlewares', 'jwtAuth'));

//add specific middlewares to servicerequests router
router.all('/issues*', jwtAuth);

/**
 * Handle Http GET on /issues
 * @description display a list of all servicerequests
 * @param  {HttpRequest} request  a http request
 * @param  {HttpResponse} response a http response
 */
router.get('/issues', function (request, response, next) {
  controller.index(request, response, next);
});


/**
 * Handle Http POST on /issues
 * @description create a new servicerequest
 * @param  {HttpRequest} request  a http request
 * @param  {HttpResponse} response a http response
 */
router.post('/issues', function (request, response, next) {
  controller.create(request, response, next);
});


/**
 * Handle Http GET on /issues/:id
 * @description display a specific servicerequest
 * @param  {HttpRequest} request  a http request
 * @param  {HttpResponse} response a http response
 */
router.get('/issues/:id', function (request, response, next) {
  controller.show(request, response, next);
});


/**
 * Handle Http PUT on /issues/:id
 * @description update a specific servicerequest
 * @param  {HttpRequest} request  a http request
 * @param  {HttpResponse} response a http response
 */
router.put('/issues/:id', function (request, response, next) {
  controller.update(request, response, next);
});


/**
 * Handle Http PATCH on /issues/:id
 * @description update a specific servicerequest
 * @param  {HttpRequest} request  a http request
 * @param  {HttpResponse} response a http response
 */
router.patch('/issues/:id', function (request, response, next) {
  controller.update(request, response, next);
});


/**
 * Handle Http DELETE on /issues/:id
 * @description delete a specific servicerequest
 * @param  {HttpRequest} request  a http request
 * @param  {HttpResponse} response a http response
 */
router.delete('/issues/:id', function (request, response, next) {
  controller.destroy(request, response, next);
});


/**
 * exports servicerequests router
 * @type {Object}
 */
module.exports = router;
