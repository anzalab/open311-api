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
 * @description check client standings
 * @param  {HttpRequest} request  a http request
 * @param  {HttpResponse} response a http response
 */
router.get('/reports/standings', jwtAuth, function (request, response, next) {
  controller.standings(request, response, next);
});


//exports site router
module.exports = router;
