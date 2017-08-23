'use strict';


/**
 * Application Router
 *
 * @description :: Server-side application router.
 */


//dependencies
const path = require('path');
const express = require('express');
const router = express.Router();
const controller = require(path.join(__dirname, '..', 'controllers',
  'application_controller'));

//enable token authentication
const jwtAuth = require(path.join(__dirname, '..', 'middlewares', 'jwtAuth'));
const jurisdiction =
  require(path.join(__dirname, '..', 'middlewares', 'jurisdiction'));

//TODO refactor out reports to report router

/**
 * Handle Http POST on /signup
 * @description register new party credentials for authentication
 * @param  {HttpRequest} request  a http request
 * @param  {HttpResponse} response a http response
 */
router.post('/signup', function (request, response, next) {
  controller.signup(request, response, next);
});


/**
 * Handle Http POST on /signin
 * @description authenticate user and return authentication token
 * @param  {HttpRequest} request  a http request
 * @param  {HttpResponse} response a http response
 */
router.post('/signin', function (request, response, next) {
  controller.signin(request, response, next);
});



/**
 * Handle Http PUT on /confirm
 * @description confirm user account
 * @param  {HttpRequest} request  a http request
 * @param  {HttpResponse} response a http response
 */
router.put('/confirm', function (request, response, next) {
  controller.confirm(request, response, next);
});



/**
 * Handle Http PUT on /forgot
 * @description send user recovery token
 * @param  {HttpRequest} request  a http request
 * @param  {HttpResponse} response a http response
 */
router.put('/forgot', function (request, response, next) {
  controller.forgot(request, response, next);
});


/**
 * Handle Http PUT on /recover
 * @description recover user password
 * @param  {HttpRequest} request  a http request
 * @param  {HttpResponse} response a http response
 */
router.put('/recover', function (request, response, next) {
  controller.recover(request, response, next);
});



/**
 * Handle Http PUT on /change
 * @description change user password
 * @param  {HttpRequest} request  a http request
 * @param  {HttpResponse} response a http response
 */
router.put('/change', jwtAuth, function (request, response, next) {
  controller.change(request, response, next);
});


/**
 * Handle Http PUT on /unlock
 * @description change user password
 * @param  {HttpRequest} request  a http request
 * @param  {HttpResponse} response a http response
 */
router.put('/unlock', function (request, response, next) {
  controller.unlock(request, response, next);
});


/**
 * Handle Http GET on /heartbeats
 * @description check client heartbeats
 * @param  {HttpRequest} request  a http request
 * @param  {HttpResponse} response a http response
 */
router.get('/heartbeats', function (request, response, next) {
  controller.heartbeats(request, response, next);
});


/**
 * Handle Http GET on /overviews
 * @description check client overviews
 * @param  {HttpRequest} request  a http request
 * @param  {HttpResponse} response a http response
 */
router.get('/overviews', function (request, response, next) {
  controller.overviews(request, response, next);
});


/**
 * Handle Http GET on /summaries
 * @description check client summaries
 * @param  {HttpRequest} request  a http request
 * @param  {HttpResponse} response a http response
 */
router.get('/summaries', jwtAuth, function (request, response, next) {
  controller.summaries(request, response, next);
});


/**
 * Handle Http GET on /endpoints
 * @description check client endpoints
 * @param  {HttpRequest} request  a http request
 * @param  {HttpResponse} response a http response
 */
router.get('/endpoints', jwtAuth, jurisdiction,
  function (request, response, next) {
    controller.endpoints(request, response, next);
  });


//exports site router
module.exports = router;
