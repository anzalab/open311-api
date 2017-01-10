'use strict';
/**
 * Setting Router
 *
 * @description :: Server-side router for managing Setting.
 */

//dependencies
const path = require('path');
const express = require('express');
const router = express.Router();
const controller =
  require(path.join(__dirname, '..', 'controllers', 'setting_controller'));

//enable token authentication
const jwtAuth = require(path.join(__dirname, '..', 'middlewares', 'jwtAuth'));

//add specific middlewares to settings router
router.all('/settings*', jwtAuth);

/**
 * Handle Http GET on /settings
 * @description display a list of all settings
 * @param  {HttpRequest} request  a http request
 * @param  {HttpResponse} response a http response
 */
router.get('/settings', function (request, response, next) {
  controller.index(request, response, next);
});


/**
 * Handle Http POST on /settings
 * @description create a new setting
 * @param  {HttpRequest} request  a http request
 * @param  {HttpResponse} response a http response
 */
router.post('/settings', function (request, response, next) {
  controller.create(request, response, next);
});


/**
 * Handle Http GET on /settings/:id
 * @description display a specific setting
 * @param  {HttpRequest} request  a http request
 * @param  {HttpResponse} response a http response
 */
router.get('/settings/:id', function (request, response, next) {
  controller.show(request, response, next);
});


/**
 * Handle Http PUT on /settings/:id
 * @description update a specific setting
 * @param  {HttpRequest} request  a http request
 * @param  {HttpResponse} response a http response
 */
router.put('/settings/:id', function (request, response, next) {
  controller.update(request, response, next);
});


/**
 * Handle Http PATCH on /settings/:id
 * @description update a specific setting
 * @param  {HttpRequest} request  a http request
 * @param  {HttpResponse} response a http response
 */
router.patch('/settings/:id', function (request, response, next) {
  controller.update(request, response, next);
});


/**
 * Handle Http DELETE on /settings/:id
 * @description delete a specific setting
 * @param  {HttpRequest} request  a http request
 * @param  {HttpResponse} response a http response
 */
router.delete('/settings/:id', function (request, response, next) {
  controller.destroy(request, response, next);
});


/**
 * exports settings router
 * @type {Object}
 */
module.exports = router;
