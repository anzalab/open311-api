'use strict';


/**
 * Report Router
 *
 * @description :: Server-side report router.
 */


//dependencies
const path = require('path');
const express = require('express');
const router = express.Router();
const controller = require(path.join(__dirname, '..', 'controllers',
  'report_controller'));

//enable token authentication
const jwtAuth = require(path.join(__dirname, '..', 'middlewares', 'jwtAuth'));


/**
 * Handle Http GET on /reports/standings
 * @description obtain issue(service request) standings
 * @param  {HttpRequest} request  a http request
 * @param  {HttpResponse} response a http response
 */
router.get('/reports/standings', jwtAuth, function (request, response, next) {
  controller.standings(request, response, next);
});


/**
 * Handle Http GET on /reports/overviews
 * @description obtain issue(service request) overviews
 * @param  {HttpRequest} request  a http request
 * @param  {HttpResponse} response a http response
 */
router.get('/reports/overviews', jwtAuth, function (request, response, next) {
  controller.overviews(request, response, next);
});


/**
 * Handle Http GET on /reports/pipelines
 * @description obtain issue(service request) pipelines
 * @param  {HttpRequest} request  a http request
 * @param  {HttpResponse} response a http response
 */
router.get('/reports/pipelines', jwtAuth, function (request, response, next) {
  controller.pipelines(request, response, next);
});


/**
 * Handle Http GET on /reports/exports
 * @description obtain issue(service request) exports
 * @param  {HttpRequest} request  a http request
 * @param  {HttpResponse} response a http response
 */
router.get('/reports/exports', jwtAuth, function (request, response, next) {
  controller.export(request, response, next);
});


//exports site router
module.exports = router;
