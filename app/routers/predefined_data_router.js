'use strict';


/**
 * PredefinedData Router
 *
 * @description :: Server-side router for managing PredefinedData.
 */


//dependencies
const path = require('path');
const express = require('express');
const router = express.Router();
const controller =
  require(path.join(__dirname, '..', 'controllers',
    'predefined_data_controller'));

//enable token authentication
const jwtAuth = require(path.join(__dirname, '..', 'middlewares', 'jwtAuth'));

//add specific middlewares to predefines router
router.all('/predefines*', jwtAuth);

/**
 * Handle Http GET on /predefines
 * @description display a list of all predefines
 * @param  {HttpRequest} request  a http request
 * @param  {HttpResponse} response a http response
 */
router.get('/predefines', function (request, response, next) {
  controller.index(request, response, next);
});


/**
 * Handle Http POST on /predefines
 * @description create a new predefine
 * @param  {HttpRequest} request  a http request
 * @param  {HttpResponse} response a http response
 */
router.post('/predefines', function (request, response, next) {
  controller.create(request, response, next);
});


/**
 * Handle Http GET on /predefines/:id
 * @description display a specific predefine
 * @param  {HttpRequest} request  a http request
 * @param  {HttpResponse} response a http response
 */
router.get('/predefines/:id', function (request, response, next) {
  controller.show(request, response, next);
});


/**
 * Handle Http PUT on /predefines/:id
 * @description update a specific predefine
 * @param  {HttpRequest} request  a http request
 * @param  {HttpResponse} response a http response
 */
router.put('/predefines/:id', function (request, response, next) {
  controller.update(request, response, next);
});


/**
 * Handle Http PATCH on /predefines/:id
 * @description update a specific predefine
 * @param  {HttpRequest} request  a http request
 * @param  {HttpResponse} response a http response
 */
router.patch('/predefines/:id', function (request, response, next) {
  controller.update(request, response, next);
});


/**
 * Handle Http DELETE on /predefines/:id
 * @description delete a specific predefine
 * @param  {HttpRequest} request  a http request
 * @param  {HttpResponse} response a http response
 */
router.delete('/predefines/:id', function (request, response, next) {
  controller.destroy(request, response, next);
});


/**
 * exports predefines router
 * @type {Object}
 */
module.exports = router;
