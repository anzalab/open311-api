'use strict';


/**
 * @name open311
 * @description router to handle open311 compliant requests
 * @see {@link http://wiki.open311.org/GeoReport_v2/| GeoReporter V2}
 * @since 0.1.0
 * @version 0.1.0
 * @public
 */


//dependencies
const path = require('path');
const express = require('express');
const router = express.Router();
const controller = require(path.join(__dirname, '..', 'controllers',
  'open311_controller'));

//TODO add jwtAuth on post requests
//TODO improve discovery with more metadata

/**
 * Handle Http GET on /discovery
 * @description check client discovery
 * @param  {HttpRequest} request  a http request
 * @param  {HttpResponse} response a http response
 */
router.get('/open311/discovery', function (request, response, next) {
  controller.discovery(request, response, next);
});


/**
 * Handle Http GET on /discovery.json
 * @description check client discovery.json
 * @param  {HttpRequest} request  a http request
 * @param  {HttpResponse} response a http response
 */
router.get('/open311/discovery.json', function (request, response, next) {
  controller.discovery(request, response, next);
});


/**
 * Handle Http GET on /services
 * @description check client services
 * @param  {HttpRequest} request  a http request
 * @param  {HttpResponse} response a http response
 */
router.get('/open311/services', function (request, response, next) {
  controller.services(request, response, next);
});


/**
 * Handle Http GET on /services.json
 * @description check client services.json
 * @param  {HttpRequest} request  a http request
 * @param  {HttpResponse} response a http response
 */
router.get('/open311/services.json', function (request, response, next) {
  controller.services(request, response, next);
});


/**
 * Handle Http POST on /requests
 * @description check client requests
 * @param  {HttpRequest} request  a http request
 * @param  {HttpResponse} response a http response
 */
router.post('/open311/requests', function (request, response, next) {
  controller.requests(request, response, next);
});


/**
 * Handle Http POST on /requests.json
 * @description check client requests.json
 * @param  {HttpRequest} request  a http request
 * @param  {HttpResponse} response a http response
 */
router.post('/open311/requests.json', function (request, response, next) {
  controller.requests(request, response, next);
});


//exports site router
module.exports = router;
