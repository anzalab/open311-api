'use strict';


/**
 * Comment Router
 *
 * @description :: Server-side router for managing Comment.
 */


//dependencies
const path = require('path');
const express = require('express');
const router = express.Router();
const controller =
  require(path.join(__dirname, '..', 'controllers', 'comment_controller'));

//enable token authentication
const jwtAuth = require(path.join(__dirname, '..', 'middlewares', 'jwtAuth'));

//add specific middlewares to comments router
router.all('/comments*', jwtAuth);

/**
 * Handle Http GET on /comments
 * @description display a list of all comments
 * @param  {HttpRequest} request  a http request
 * @param  {HttpResponse} response a http response
 */
router.get('/comments', function (request, response, next) {
  controller.index(request, response, next);
});


/**
 * Handle Http POST on /comments
 * @description create a new comment
 * @param  {HttpRequest} request  a http request
 * @param  {HttpResponse} response a http response
 */
router.post('/comments', function (request, response, next) {
  controller.create(request, response, next);
});


/**
 * Handle Http GET on /comments/:id
 * @description display a specific comment
 * @param  {HttpRequest} request  a http request
 * @param  {HttpResponse} response a http response
 */
router.get('/comments/:id', function (request, response, next) {
  controller.show(request, response, next);
});


/**
 * Handle Http PUT on /comments/:id
 * @description update a specific comment
 * @param  {HttpRequest} request  a http request
 * @param  {HttpResponse} response a http response
 */
router.put('/comments/:id', function (request, response, next) {
  controller.update(request, response, next);
});


/**
 * Handle Http PATCH on /comments/:id
 * @description update a specific comment
 * @param  {HttpRequest} request  a http request
 * @param  {HttpResponse} response a http response
 */
router.patch('/comments/:id', function (request, response, next) {
  controller.update(request, response, next);
});


/**
 * Handle Http DELETE on /comments/:id
 * @description delete a specific comment
 * @param  {HttpRequest} request  a http request
 * @param  {HttpResponse} response a http response
 */
router.delete('/comments/:id', function (request, response, next) {
  controller.destroy(request, response, next);
});


/**
 * exports comments router
 * @type {Object}
 */
module.exports = router;
