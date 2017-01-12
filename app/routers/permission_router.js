'use strict';


/**
 * Permission Router
 *
 * @description :: Server-side router for managing Permission.
 */


//dependencies
const path = require('path');
const express = require('express');
const router = express.Router();
const controller =
  require(path.join(__dirname, '..', 'controllers', 'permission_controller'));

//enable token authentication
const jwtAuth = require(path.join(__dirname, '..', 'middlewares', 'jwtAuth'));

//add specific middlewares to permissions router
router.all('/permissions*', jwtAuth);


/**
 * Handle Http GET on /permissions
 * @description display a list of all permissions
 * @param  {HttpRequest} request  a http request
 * @param  {HttpResponse} response a http response
 */
router.get('/permissions', function (request, response, next) {
  controller.index(request, response, next);
});


/**
 * Handle Http POST on /permissions
 * @description create a new permission
 * @param  {HttpRequest} request  a http request
 * @param  {HttpResponse} response a http response
 */
router.post('/permissions', function (request, response, next) {
  controller.create(request, response, next);
});


/**
 * Handle Http GET on /permissions/:id
 * @description display a specific permission
 * @param  {HttpRequest} request  a http request
 * @param  {HttpResponse} response a http response
 */
router.get('/permissions/:id', function (request, response, next) {
  controller.show(request, response, next);
});


/**
 * Handle Http PUT on /permissions/:id
 * @description update a specific permission
 * @param  {HttpRequest} request  a http request
 * @param  {HttpResponse} response a http response
 */
router.put('/permissions/:id', function (request, response, next) {
  controller.update(request, response, next);
});


/**
 * Handle Http PATCH on /permissions/:id
 * @description update a specific permission
 * @param  {HttpRequest} request  a http request
 * @param  {HttpResponse} response a http response
 */
router.patch('/permissions/:id', function (request, response, next) {
  controller.update(request, response, next);
});


/**
 * Handle Http DELETE on /permissions/:id
 * @description delete a specific permission
 * @param  {HttpRequest} request  a http request
 * @param  {HttpResponse} response a http response
 */
router.delete('/permissions/:id', function (request, response, next) {
  controller.destroy(request, response, next);
});


/**
 * exports permissions router
 * @type {Object}
 */
module.exports = router;
