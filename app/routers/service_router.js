'use strict';


/**
 * Service Router
 *
 * @description :: Server-side router for managing Service.
 */


//dependencies
const path = require('path');
const express = require('express');
const router = express.Router();
const controller =
  require(path.join(__dirname, '..', 'controllers', 'service_controller'));

// enable token authentication
// const jwtAuth = require(path.join(__dirname, '..', 'middlewares', 'jwtAuth'));

// add specific middlewares to services router
// router.all('/services*', jwtAuth);

/**
 * Handle Http GET on /services
 * @description display a list of all services
 * @param  {HttpRequest} request  a http request
 * @param  {HttpResponse} response a http response
 */
router.get('/services', function (request, response, next) {
  controller.index(request, response, next);
});


/**
 * Handle Http POST on /services
 * @description create a new service
 * @param  {HttpRequest} request  a http request
 * @param  {HttpResponse} response a http response
 */
router.post('/services', function (request, response, next) {
  controller.create(request, response, next);
});


/**
 * Handle Http GET on /services/:id
 * @description display a specific service
 * @param  {HttpRequest} request  a http request
 * @param  {HttpResponse} response a http response
 */
router.get('/services/:id', function (request, response, next) {
  controller.show(request, response, next);
});


/**
 * Handle Http PUT on /services/:id
 * @description update a specific service
 * @param  {HttpRequest} request  a http request
 * @param  {HttpResponse} response a http response
 */
router.put('/services/:id', function (request, response, next) {
  controller.update(request, response, next);
});


/**
 * Handle Http PATCH on /services/:id
 * @description update a specific service
 * @param  {HttpRequest} request  a http request
 * @param  {HttpResponse} response a http response
 */
router.patch('/services/:id', function (request, response, next) {
  controller.update(request, response, next);
});


/**
 * Handle Http DELETE on /services/:id
 * @description delete a specific service
 * @param  {HttpRequest} request  a http request
 * @param  {HttpResponse} response a http response
 */
router.delete('/services/:id', function (request, response, next) {
  controller.destroy(request, response, next);
});


/**
 * exports services router
 * @type {Object}
 */
module.exports = router;
