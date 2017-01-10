'use strict';

/**
 * open311 Compliant Router
 *
 * @description :: Server-side open311 router.
 */

//dependencies
const path = require('path');
const express = require('express');
const router = express.Router();
const controller = require(path.join(__dirname, '..', 'controllers',
  'open311_controller'));

/**
 * Handle Http GET on /discovery
 * @description check client discovery
 * @param  {HttpRequest} request  a http request
 * @param  {HttpResponse} response a http response
 */
router.get('/discovery', function (request, response, next) {
  controller.discovery(request, response, next);
});


//exports site router
module.exports = router;
