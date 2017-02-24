'use strict';


/**
 * Status Router
 *
 * @description :: Server-side router for managing Status.
 */


//dependencies
const path = require('path');
const express = require('express');
const router = express.Router();
const controller =
  require(path.join(__dirname, '..', 'controllers', 'status_controller'));

//enable token authentication
const jwtAuth = require(path.join(__dirname, '..', 'middlewares', 'jwtAuth'));

//add specific middlewares to statuses router
router.all('/statuses*', jwtAuth);

/**
 * Handle Http GET on /statuses
 * @description display a list of all statuses
 * @param  {HttpRequest} request  a http request
 * @param  {HttpResponse} response a http response
 */
router.get('/statuses', function (request, response, next) {
  controller.index(request, response, next);
});


/**
 * Handle Http POST on /statuses
 * @description create a new status
 * @param  {HttpRequest} request  a http request
 * @param  {HttpResponse} response a http response
 */
router.post('/statuses', function (request, response, next) {
  controller.create(request, response, next);
});


/**
 * Handle Http GET on /statuses/:id
 * @description display a specific status
 * @param  {HttpRequest} request  a http request
 * @param  {HttpResponse} response a http response
 */
router.get('/statuses/:id', function (request, response, next) {
  controller.show(request, response, next);
});


/**
 * Handle Http PUT on /statuses/:id
 * @description update a specific status
 * @param  {HttpRequest} request  a http request
 * @param  {HttpResponse} response a http response
 */
router.put('/statuses/:id', function (request, response, next) {
  controller.update(request, response, next);
});


/**
 * Handle Http PATCH on /statuses/:id
 * @description update a specific status
 * @param  {HttpRequest} request  a http request
 * @param  {HttpResponse} response a http response
 */
router.patch('/statuses/:id', function (request, response, next) {
  controller.update(request, response, next);
});


/**
 * Handle Http DELETE on /statuses/:id
 * @description delete a specific status
 * @param  {HttpRequest} request  a http request
 * @param  {HttpResponse} response a http response
 */
router.delete('/statuses/:id', function (request, response, next) {
  controller.destroy(request, response, next);
});


/**
 * exports statuses router
 * @type {Object}
 */
module.exports = router;
