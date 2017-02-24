'use strict';


/**
 * Priority Router
 *
 * @description :: Server-side router for managing Priority.
 */


//dependencies
const path = require('path');
const express = require('express');
const router = express.Router();
const controller =
  require(path.join(__dirname, '..', 'controllers', 'priority_controller'));

//enable token authentication
const jwtAuth = require(path.join(__dirname, '..', 'middlewares', 'jwtAuth'));

//add specific middlewares to priorities router
router.all('/priorities*', jwtAuth);

/**
 * Handle Http GET on /priorities
 * @description display a list of all priorities
 * @param  {HttpRequest} request  a http request
 * @param  {HttpResponse} response a http response
 */
router.get('/priorities', function (request, response, next) {
  controller.index(request, response, next);
});


/**
 * Handle Http POST on /priorities
 * @description create a new priority
 * @param  {HttpRequest} request  a http request
 * @param  {HttpResponse} response a http response
 */
router.post('/priorities', function (request, response, next) {
  controller.create(request, response, next);
});


/**
 * Handle Http GET on /priorities/:id
 * @description display a specific priority
 * @param  {HttpRequest} request  a http request
 * @param  {HttpResponse} response a http response
 */
router.get('/priorities/:id', function (request, response, next) {
  controller.show(request, response, next);
});


/**
 * Handle Http PUT on /priorities/:id
 * @description update a specific priority
 * @param  {HttpRequest} request  a http request
 * @param  {HttpResponse} response a http response
 */
router.put('/priorities/:id', function (request, response, next) {
  controller.update(request, response, next);
});


/**
 * Handle Http PATCH on /priorities/:id
 * @description update a specific priority
 * @param  {HttpRequest} request  a http request
 * @param  {HttpResponse} response a http response
 */
router.patch('/priorities/:id', function (request, response, next) {
  controller.update(request, response, next);
});


/**
 * Handle Http DELETE on /priorities/:id
 * @description delete a specific priority
 * @param  {HttpRequest} request  a http request
 * @param  {HttpResponse} response a http response
 */
router.delete('/priorities/:id', function (request, response, next) {
  controller.destroy(request, response, next);
});


/**
 * exports priorities router
 * @type {Object}
 */
module.exports = router;
