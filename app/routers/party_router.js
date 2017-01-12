'use strict';


/**
 * Party Router
 *
 * @description :: Server-side router for managing Party.
 */


//dependencies
const path = require('path');
const express = require('express');
const router = express.Router();
const controller =
  require(path.join(__dirname, '..', 'controllers', 'party_controller'));

//enable token authentication
const jwtAuth = require(path.join(__dirname, '..', 'middlewares', 'jwtAuth'));

//add specific middlewares to parties router
router.all('/parties*', jwtAuth);

/**
 * Handle Http GET on /parties
 * @description display a list of all parties
 * @param  {HttpRequest} request  a http request
 * @param  {HttpResponse} response a http response
 */
router.get('/parties', function (request, response, next) {
  controller.index(request, response, next);
});


/**
 * Handle Http POST on /parties
 * @description create a new party
 * @param  {HttpRequest} request  a http request
 * @param  {HttpResponse} response a http response
 */
router.post('/parties', function (request, response, next) {
  controller.create(request, response, next);
});


/**
 * Handle Http GET on /parties/:id
 * @description display a specific party
 * @param  {HttpRequest} request  a http request
 * @param  {HttpResponse} response a http response
 */
router.get('/parties/:id', function (request, response, next) {
  controller.show(request, response, next);
});


/**
 * Handle Http PUT on /parties/:id
 * @description update a specific party
 * @param  {HttpRequest} request  a http request
 * @param  {HttpResponse} response a http response
 */
router.put('/parties/:id', function (request, response, next) {
  controller.update(request, response, next);
});


/**
 * Handle Http PATCH on /parties/:id
 * @description update a specific party
 * @param  {HttpRequest} request  a http request
 * @param  {HttpResponse} response a http response
 */
router.patch('/parties/:id', function (request, response, next) {
  controller.update(request, response, next);
});


/**
 * Handle Http DELETE on /parties/:id
 * @description delete a specific party
 * @param  {HttpRequest} request  a http request
 * @param  {HttpResponse} response a http response
 */
router.delete('/parties/:id', function (request, response, next) {
  controller.destroy(request, response, next);
});


/**
 * exports parties router
 * @type {Object}
 */
module.exports = router;
