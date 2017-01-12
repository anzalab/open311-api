'use strict';


/**
 * Role Router
 *
 * @description :: Server-side router for managing Role.
 */


//dependencies
const path = require('path');
const express = require('express');
const router = express.Router();
const controller =
  require(path.join(__dirname, '..', 'controllers', 'role_controller'));

//enable token authentication
const jwtAuth = require(path.join(__dirname, '..', 'middlewares', 'jwtAuth'));

//add specific middlewares to roles router
router.all('/roles*', jwtAuth);

/**
 * Handle Http GET on /roles
 * @description display a list of all roles
 * @param  {HttpRequest} request  a http request
 * @param  {HttpResponse} response a http response
 */
router.get('/roles', function (request, response, next) {
  controller.index(request, response, next);
});


/**
 * Handle Http POST on /roles
 * @description create a new role
 * @param  {HttpRequest} request  a http request
 * @param  {HttpResponse} response a http response
 */
router.post('/roles', function (request, response, next) {
  controller.create(request, response, next);
});


/**
 * Handle Http GET on /roles/:id
 * @description display a specific role
 * @param  {HttpRequest} request  a http request
 * @param  {HttpResponse} response a http response
 */
router.get('/roles/:id', function (request, response, next) {
  controller.show(request, response, next);
});


/**
 * Handle Http PUT on /roles/:id
 * @description update a specific role
 * @param  {HttpRequest} request  a http request
 * @param  {HttpResponse} response a http response
 */
router.put('/roles/:id', function (request, response, next) {
  controller.update(request, response, next);
});


/**
 * Handle Http PATCH on /roles/:id
 * @description update a specific role
 * @param  {HttpRequest} request  a http request
 * @param  {HttpResponse} response a http response
 */
router.patch('/roles/:id', function (request, response, next) {
  controller.update(request, response, next);
});


/**
 * Handle Http DELETE on /roles/:id
 * @description delete a specific role
 * @param  {HttpRequest} request  a http request
 * @param  {HttpResponse} response a http response
 */
router.delete('/roles/:id', function (request, response, next) {
  controller.destroy(request, response, next);
});


/**
 * exports roles router
 * @type {Object}
 */
module.exports = router;
