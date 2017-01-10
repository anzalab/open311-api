'use strict';
/**
 * Jurisdiction Router
 *
 * @description :: Server-side router for managing Jurisdiction.
 */

//dependencies
const path = require('path');
const express = require('express');
const router = express.Router();
const controller =
  require(path.join(__dirname, '..', 'controllers', 'jurisdiction_controller'));

//enable token authentication
const jwtAuth = require(path.join(__dirname, '..', 'middlewares', 'jwtAuth'));

//add specific middlewares to jurisdictions router
router.all('/jurisdictions*', jwtAuth);

/**
 * Handle Http GET on /jurisdictions
 * @description display a list of all jurisdictions
 * @param  {HttpRequest} request  a http request
 * @param  {HttpResponse} response a http response
 */
router.get('/jurisdictions', function (request, response, next) {
  controller.index(request, response, next);
});


/**
 * Handle Http POST on /jurisdictions
 * @description create a new jurisdiction
 * @param  {HttpRequest} request  a http request
 * @param  {HttpResponse} response a http response
 */
router.post('/jurisdictions', function (request, response, next) {
  controller.create(request, response, next);
});


/**
 * Handle Http GET on /jurisdictions/:id
 * @description display a specific jurisdiction
 * @param  {HttpRequest} request  a http request
 * @param  {HttpResponse} response a http response
 */
router.get('/jurisdictions/:id', function (request, response, next) {
  controller.show(request, response, next);
});


/**
 * Handle Http PUT on /jurisdictions/:id
 * @description update a specific jurisdiction
 * @param  {HttpRequest} request  a http request
 * @param  {HttpResponse} response a http response
 */
router.put('/jurisdictions/:id', function (request, response, next) {
  controller.update(request, response, next);
});


/**
 * Handle Http PATCH on /jurisdictions/:id
 * @description update a specific jurisdiction
 * @param  {HttpRequest} request  a http request
 * @param  {HttpResponse} response a http response
 */
router.patch('/jurisdictions/:id', function (request, response, next) {
  controller.update(request, response, next);
});


/**
 * Handle Http DELETE on /jurisdictions/:id
 * @description delete a specific jurisdiction
 * @param  {HttpRequest} request  a http request
 * @param  {HttpResponse} response a http response
 */
router.delete('/jurisdictions/:id', function (request, response, next) {
  controller.destroy(request, response, next);
});


/**
 * exports jurisdictions router
 * @type {Object}
 */
module.exports = router;
