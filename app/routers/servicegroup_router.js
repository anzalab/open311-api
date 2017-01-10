'use strict';
/**
 * ServiceGroup Router
 *
 * @description :: Server-side router for managing ServiceGroup.
 */

//dependencies
const path = require('path');
const express = require('express');
const router = express.Router();
const controller =
  require(path.join(__dirname, '..', 'controllers', 'servicegroup_controller'));

//enable token authentication
const jwtAuth = require(path.join(__dirname, '..', 'middlewares', 'jwtAuth'));

//add specific middlewares to servicegroups router
router.all('/servicegroups*', jwtAuth);

/**
 * Handle Http GET on /servicegroups
 * @description display a list of all servicegroups
 * @param  {HttpRequest} request  a http request
 * @param  {HttpResponse} response a http response
 */
router.get('/servicegroups', function (request, response, next) {
  controller.index(request, response, next);
});


/**
 * Handle Http POST on /servicegroups
 * @description create a new servicegroup
 * @param  {HttpRequest} request  a http request
 * @param  {HttpResponse} response a http response
 */
router.post('/servicegroups', function (request, response, next) {
  controller.create(request, response, next);
});


/**
 * Handle Http GET on /servicegroups/:id
 * @description display a specific servicegroup
 * @param  {HttpRequest} request  a http request
 * @param  {HttpResponse} response a http response
 */
router.get('/servicegroups/:id', function (request, response, next) {
  controller.show(request, response, next);
});


/**
 * Handle Http PUT on /servicegroups/:id
 * @description update a specific servicegroup
 * @param  {HttpRequest} request  a http request
 * @param  {HttpResponse} response a http response
 */
router.put('/servicegroups/:id', function (request, response, next) {
  controller.update(request, response, next);
});


/**
 * Handle Http PATCH on /servicegroups/:id
 * @description update a specific servicegroup
 * @param  {HttpRequest} request  a http request
 * @param  {HttpResponse} response a http response
 */
router.patch('/servicegroups/:id', function (request, response, next) {
  controller.update(request, response, next);
});


/**
 * Handle Http DELETE on /servicegroups/:id
 * @description delete a specific servicegroup
 * @param  {HttpRequest} request  a http request
 * @param  {HttpResponse} response a http response
 */
router.delete('/servicegroups/:id', function (request, response, next) {
  controller.destroy(request, response, next);
});


/**
 * exports servicegroups router
 * @type {Object}
 */
module.exports = router;
