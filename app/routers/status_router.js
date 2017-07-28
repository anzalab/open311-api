'use strict';


/**
 * Status Router
 *
 * @description :: Server-side router for managing Status.
 */


//dependencies
const path = require('path');
const express = require('express');
const router = express.Router();
const controller =
  require(path.join(__dirname, '..', 'controllers', 'status_controller'));

//enable token authentication
const jwtAuth = require(path.join(__dirname, '..', 'middlewares', 'jwtAuth'));

//add specific middlewares to statuses router
router.all('/statuses*', jwtAuth);

/**
 * @api {get} /statuses Get all statuses
 * @apiName GetStatutes
 * @apiGroup Status
 *
 * @apiHeader {String}      accept         Accept value
 * @apiHeader {String}      authorization  Authorization token
 *
 * @apiExample Example Usage
 * curl -i http://dawasco.herokuapp.com/statuses
 *
 *
 * @apiSuccess {String}     name          Status Name
 * @apiSuccess {Number}     weight        Weight of the status to help in ordering service request(issue) based on status
 * @apiSuccess {String}     color         A color code used to differentiate a service request status visually.
 * @apiSuccess {ObjectId}   _id           Status Id
 * @apiSuccess {Timestamp}  createdAt     Status creation date
 * @apiSuccess {Timestamp}  updatedAt     Status updated date
 * @apiSuccess {String}     uri           Status URI
 * @apiSuccess {Number}     pages         Number of results pages
 * @apiSuccess {Number}     count         Number of status contained in the current json response
 *
 * @apiSuccessExample {json} Success-Response:
 *    HTTP/1.1 200 OK
 *    {
 *      "statuses": [
 *         {
 *            "name": "Open",
 *            "weight": -5,
 *            "color": "#0D47A1",
 *            "_id": "592029e5e8dd8e00048c180d",
 *             "createdAt": "2017-05-20T11:35:01.059Z",
 *             "updatedAt": "2017-05-20T11:35:01.059Z",
 *             "uri": "https://dawasco.herokuapp.com/statuses/592029e5e8dd8e00048c180d"
 *         },
 *         {
 *             "name": "In Progress",
 *             "weight": 0,
 *             "color": "#F9A825",
 *             "_id": "592029e5e8dd8e00048c180e",
 *             "createdAt": "2017-05-20T11:35:01.334Z",
 *             "updatedAt": "2017-05-20T11:35:01.334Z",
 *             "uri": "https://dawasco.herokuapp.com/statuses/592029e5e8dd8e00048c180e"
 *         },
 *         {
 *             "name": "Closed",
 *             "weight": 5,
 *             "color": "#1B5E20",
 *             "_id": "592029e5e8dd8e00048c180f",
 *             "createdAt": "2017-05-20T11:35:01.380Z",
 *             "updatedAt": "2017-05-20T11:35:01.380Z",
 *             "uri": "https://dawasco.herokuapp.com/statuses/592029e5e8dd8e00048c180f"
 *         }
 *      ],
 *      "pages": 1,
 *      "count": 3
 *   }
 *
 * @apiError  AuthorizationHeaderRequired  Authorization header is required
 *
 *
 * @apiErrorExample   {json} Error-Response:
 *    HTTP/1.1 403 Forbidden
 *    {
 *      "success":false,
 *      "message :"Authorization header required",
 *      "error":{}
 *    }
 */
router.get('/statuses', function (request, response, next) {
  controller.index(request, response, next);
});


/**
 * @api {post} /statuses Create a new status
 * @apiName PostStatus
 * @apiGroup Status
 *
 * @apiHeader {String}      accept           Accept value
 * @apiHeader {String}      authorization    Authorization token
 * @apiHeader {String}      content-type     Sent content type
 *
 * @apiParam   {String}     name             Human readable name of the status e.g Open, In Progress, Resolved.
 * @apiParam   {Number}     weight           Weight of the status to help in ordering service request(issue) based on status
 * @apiParam   {String}     [color]            A color code used to differentiate a service request status visually.
 *
 *
 * @apiSuccess {String}     name             Status Name
 * @apiSuccess {Number}     weight           Weight of the status to help in ordering service request(issue) based on status
 * @apiSuccess {String}     color            A color code used to differentiate a service request status visually.
 * @apiSuccess {ObjectId}   _id              Status Id
 * @apiSuccess {Timestamp}  createdAt        Status creation date
 * @apiSuccess {Timestamp}  updatedAt        Status updated date
 * @apiSuccess {String}     uri              Status URI
 *
 * @apiSuccessExample {json} Success-Response:
 *    HTTP/1.1 201 Created
 *    {
 *      "statuses": [
 *         {
 *            "name": "Suspended",
 *            "weight": 2,
 *            "color": "#0D47A1",
 *            "_id": "592029e5e8dd8e00048c180d",
 *             "createdAt": "2017-05-20T11:35:01.059Z",
 *             "updatedAt": "2017-05-20T11:35:01.059Z",
 *             "uri": "https://dawasco.herokuapp.com/statuses/597acd4932494800041ed7b2"
 *         }
 *   }
 *
 * @apiError  AuthorizationHeaderRequired  Authorization header is required
 *
 *
 * @apiErrorExample   {json} Error-Response:
 *    HTTP/1.1 403 Forbidden
 *    {
 *      "success":false,
 *      "message :"Authorization header required",
 *      "error":{}
 *    }
 */
router.post('/statuses', function (request, response, next) {
  controller.create(request, response, next);
});


/**
 * @api {get} /statues/:id Request Status information
 * @apiName GetStatus
 * @apiGroup Status
 *
 * @apiHeader {String}      accept         Accept value
 * @apiHeader {String}      authorization  Authorization token
 *
 * @apiParam {ObjectId}     id               Status unique ID.
 *
 * @apiSuccess {String}     name             Status Name
 * @apiSuccess {Number}     weight           Weight of the status to help in ordering service request(issue) based on status
 * @apiSuccess {String}     color            A color code used to differentiate a service request status visually.
 * @apiSuccess {ObjectId}   _id              Status Id
 * @apiSuccess {Timestamp}  createdAt        Status creation date
 * @apiSuccess {Timestamp}  updatedAt        Status updated date
 * @apiSuccess {String}     uri              Status URI
 *
 * @apiSuccessExample {json} Success-Response:
 *    HTTP/1.1 201 Created
 *    {
 *       "name": "Open",
 *       "weight": -5,
 *       "color": "#0D47A1",
 *       "_id": "592029e5e8dd8e00048c180d",
 *       "createdAt": "2017-05-20T11:35:01.059Z",
 *       "updatedAt": "2017-05-20T11:35:01.059Z",
 *       "uri": "https://dawasco.herokuapp.com/statuses/592029e5e8dd8e00048c180d"
 *     }
 *
 * @apiError JWTExpired
 *
 * @apiErrorExample  {json}   Error-Response:
 *    HTTP/1.1 403 Forbidden
 *    {
 *      "success":false,
 *      "message :"jwt expired",
 *      "error":{}
 *    }
 *
 */
router.get('/statuses/:id', function (request, response, next) {
  controller.show(request, response, next);
});


/**
 * Handle Http PUT on /statuses/:id
 * @description update a specific status
 * @param  {HttpRequest} request  a http request
 * @param  {HttpResponse} response a http response
 */
router.put('/statuses/:id', function (request, response, next) {
  controller.update(request, response, next);
});


/**
 * Handle Http PATCH on /statuses/:id
 * @description update a specific status
 * @param  {HttpRequest} request  a http request
 * @param  {HttpResponse} response a http response
 */
router.patch('/statuses/:id', function (request, response, next) {
  controller.update(request, response, next);
});


/**
 * Handle Http DELETE on /statuses/:id
 * @description delete a specific status
 * @param  {HttpRequest} request  a http request
 * @param  {HttpResponse} response a http response
 */
router.delete('/statuses/:id', function (request, response, next) {
  controller.destroy(request, response, next);
});


/**
 * exports statuses router
 * @type {Object}
 */
module.exports = router;
