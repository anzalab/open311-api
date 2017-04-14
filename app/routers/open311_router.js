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
 * Handle Http GET on /discovery.json
 * @description handle open311 api discovery request
 * @param  {HttpRequest} request  a http request
 * @param  {HttpResponse} response a http response
 */
router.get('/open311/discovery\.:ext?', function (request, response, next) {
  controller.discovery(request, response, next);
});


/**
 * Handle Http GET on /services.json
 * @description display a list of available service requests
 * @param  {HttpRequest} request  a http request
 * @param  {HttpResponse} response a http response
 */
router.get('/open311/services\.:ext?', function (request, response, next) {
  controller.services(request, response, next);
});


/**
 * Handle Http POST on /requests.json
 * @description create a new service request from open311 compliant client
 * @param  {HttpRequest} request  a http request
 * @param  {HttpResponse} response a http response
 */
router.post('/open311/requests\.:ext?', function (request, response, next) {
  controller.create(request, response, next);
});


/**
 * Handle Http GET on /requests.json
 * @description display a list service requests in open 311 compliant format
 * @param  {HttpRequest} request  a http request
 * @param  {HttpResponse} response a http response
 */
router.get('/open311/requests\.:ext?', function (request, response, next) {
  controller.index(request, response, next);
});


/**
 * Handle Http GET on /requests/:id
 * @description display a specific service request in open 311 compliant format
 * @param  {HttpRequest} request  a http request
 * @param  {HttpResponse} response a http response
 */
router.get('/open311/requests/:id\.:ext?', function (request, response, next) {
  controller.show(request, response, next);
});


//exports site router
module.exports = router;
