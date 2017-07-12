'use strict';


/**
 * StatusChange Router
 *
 * @description :: Server-side router for managing StatusChange.
 */


//dependencies
const path = require('path');
const express = require('express');
const router = express.Router();
const controller =
  require(path.join(__dirname, '..', 'controllers', 'status_change_controller'));

//enable token authentication
const jwtAuth = require(path.join(__dirname, '..', 'middlewares', 'jwtAuth'));

//add specific middlewares to statuschanges router
router.all('/statuschanges*', jwtAuth);

/**
 * Handle Http GET on /statuschanges
 * @description display a list of all statuschanges
 * @param  {HttpRequest} request  a http request
 * @param  {HttpResponse} response a http response
 */
router.get('/statuschanges', function (request, response, next) {
  controller.index(request, response, next);
});


/**
 * Handle Http POST on /statuschanges
 * @description create a new statuschange
 * @param  {HttpRequest} request  a http request
 * @param  {HttpResponse} response a http response
 */
router.post('/statuschanges', function (request, response, next) {
  controller.create(request, response, next);
});


/**
 * Handle Http GET on /statuschanges/:id
 * @description display a specific statuschange
 * @param  {HttpRequest} request  a http request
 * @param  {HttpResponse} response a http response
 */
router.get('/statuschanges/:id', function (request, response, next) {
  controller.show(request, response, next);
});


/**
 * Handle Http PUT on /statuschanges/:id
 * @description update a specific statuschange
 * @param  {HttpRequest} request  a http request
 * @param  {HttpResponse} response a http response
 */
router.put('/statuschanges/:id', function (request, response, next) {
  controller.update(request, response, next);
});


/**
 * Handle Http PATCH on /statuschanges/:id
 * @description update a specific statuschange
 * @param  {HttpRequest} request  a http request
 * @param  {HttpResponse} response a http response
 */
router.patch('/statuschanges/:id', function (request, response, next) {
  controller.update(request, response, next);
});


/**
 * Handle Http DELETE on /statuschanges/:id
 * @description delete a specific statuschange
 * @param  {HttpRequest} request  a http request
 * @param  {HttpResponse} response a http response
 */
router.delete('/statuschanges/:id', function (request, response, next) {
  controller.destroy(request, response, next);
});


/**
 * exports statuschanges router
 * @type {Object}
 */
module.exports = router;
