'use strict';


/**
 * Priority Router
 *
 * @description :: Server-side router for managing Priority.
 */


//dependencies
const path = require('path');
const express = require('express');
const router = express.Router();
const controller =
  require(path.join(__dirname, '..', 'controllers', 'priority_controller'));

//enable token authentication
const jwtAuth = require(path.join(__dirname, '..', 'middlewares', 'jwtAuth'));

//add specific middlewares to priorities router
router.all('/priorities*', jwtAuth);

/**
 * @api {get} /priorities Get all priorities
 * @apiName GetPriorities
 * @apiGroup Priority
 *
 * @apiHeader {String}      accept         Accept value
 * @apiHeader {String}      authorization  Authorization token
 *
 * @apiExample Example Usage
 * curl -i http://dawasco.herokuapp.com/priorities
 *
 *
 * @apiSuccess {String}     name          Unique Human readable name of the priority e.g High, Low, Medium.
 * @apiSuccess {Number}     weight        Weight of the priority to help in ordering service request(issue) based on priority.
 * @apiSuccess {String}     color         A color code used to differentiate a service request priority visually.
 * @apiSuccess {ObjectId}   _id           Priority Id
 * @apiSuccess {Timestamp}  createdAt     Priority creation date
 * @apiSuccess {Timestamp}  updatedAt     Priority updated date
 * @apiSuccess {String}     uri           Priority URI
 * @apiSuccess {Number}     pages         Number of results pages
 * @apiSuccess {Number}     count         Number of priority results in the current json response
 *
 * @apiSuccessExample {json} Success-Response:
 *    HTTP/1.1 200 OK
 *    {
 *      "priorities": [
 *           {
 *             "name": "Low",
 *             "weight": 0,
 *             "color": "#1B5E20",
 *             "_id": "592029e5e8dd8e00048c1816",
 *             "createdAt": "2017-05-20T11:35:01.586Z",
 *             "updatedAt": "2017-05-20T11:35:01.586Z",
 *             "uri": "https://dawasco.herokuapp.com/priorities/592029e5e8dd8e00048c1816"
 *         },
 *          {
 *              "name": "Normal",
 *              "weight": 5,
 *              "color": "#4CAF50",
 *              "_id": "592029e5e8dd8e00048c1817",
 *              "createdAt": "2017-05-20T11:35:01.601Z",
 *              "updatedAt": "2017-05-20T11:35:01.601Z",
 *             "uri": "https://dawasco.herokuapp.com/priorities/592029e5e8dd8e00048c1817"
 *          },
 *          {
 *             "name": "Medium",
 *             "weight": 10,
 *             "color": "#FFC107",
 *             "_id": "592029e5e8dd8e00048c1818",
 *             "createdAt": "2017-05-20T11:35:01.615Z",
 *             "updatedAt": "2017-05-20T11:35:01.615Z",
 *             "uri": "https://dawasco.herokuapp.com/priorities/592029e5e8dd8e00048c1818"
 *         },
 *         {
 *             "name": "High",
 *             "weight": 15,
 *             "color": "#FF9800",
 *             "_id": "592029e5e8dd8e00048c1819",
 *             "createdAt": "2017-05-20T11:35:01.625Z",
 *             "updatedAt": "2017-05-20T11:35:01.625Z",
 *             "uri": "https://dawasco.herokuapp.com/priorities/592029e5e8dd8e00048c1819"
 *         },
 *         {
 *             "name": "Critical",
 *             "weight": 20,
 *             "color": "#F44336",
 *             "_id": "592029e5e8dd8e00048c181a",
 *             "createdAt": "2017-05-20T11:35:01.636Z",
 *             "updatedAt": "2017-05-20T11:35:01.636Z",
 *             "uri": "https://dawasco.herokuapp.com/priorities/592029e5e8dd8e00048c181a"
 *         }
 *      ],
 *      "pages": 1,
 *      "count": 5
 *   }
 *
 * @apiError  AuthorizationHeaderRequired  Authorization header is required
 *
 * @apiErrorExample   {json} Error-Response:
 *    HTTP/1.1 403 Forbidden
 *    {
 *      "success":false,
 *      "message :"Authorization header required",
 *      "error":{}
 *    }
 *
 * @apiError  JWTExpired                   Authorization token has expired
 *
 * @apiErrorExample  {json}   Error-Response:
 *    HTTP/1.1 403 Forbidden
 *    {
 *      "success":false,
 *      "message :"jwt expired",
 *      "error":{}
 *    }
 */
router.get('/priorities', function (request, response, next) {
  controller.index(request, response, next);
});


/**
 * @api {post} /priorities Create a new priority
 * @apiName PostPriority
 * @apiGroup Priority
 *
 * @apiHeader {String}      accept           Accept value
 * @apiHeader {String}      authorization    Authorization token
 * @apiHeader {String}      content-type     Sent content type
 *
 * @apiParam   {String}     name             Unique Human readable name of the priority e.g High, Low, Medium.
 * @apiParam   {Number}     weight           Weight of the priority to help in ordering service request(issue) based on priority.
 * @apiParam   {String}     color            A color code used to differentiate a service request priority visually.
 *
 *
 * @apiSuccess {String}     name             Unique Human readable name of the priority e.g High, Low, Medium.
 * @apiSuccess {Number}     weight           Weight of the priority to help in ordering service request(issue) based on priority.
 * @apiSuccess {String}     color            A color code used to differentiate a service request priority visually.
 * @apiSuccess {ObjectId}   _id              Priority Id
 * @apiSuccess {Timestamp}  createdAt        Priority creation date
 * @apiSuccess {Timestamp}  updatedAt        Priority updated date
 * @apiSuccess {String}     uri              Priority URI
 *
 * @apiSuccessExample {json} Success-Response:
 *    HTTP/1.1 201 Created
 *    {
 *        "name": "Very High",
 *        "weight": 20,
 *        "color": "#0D47A1",
 *        "_id": "592029e5e8dd8e00048c180d",
 *        "createdAt": "2017-05-20T11:35:01.059Z",
 *        "updatedAt": "2017-05-20T11:35:01.059Z",
 *       "uri": "https://dawasco.herokuapp.com/priorities/592029e5e8dd8e00048c180d"
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
 *
 * @apiError  JWTExpired                   Authorization token has expired
 *
 * @apiErrorExample  {json}   Error-Response:
 *    HTTP/1.1 403 Forbidden
 *    {
 *      "success":false,
 *      "message :"jwt expired",
 *      "error":{}
 *    }
 */
router.post('/priorities', function (request, response, next) {
  controller.create(request, response, next);
});


/**
 * @api {get}   /priorities/:id   Request Priority information
 * @apiName GetPriority
 * @apiGroup Priority
 *
 * @apiHeader {String}      accept         Accept value i.e application/json
 * @apiHeader {String}      authorization  Authorization token

 *
 * @apiParam {ObjectId}     id             Priority unique ID.
 *
 * @apiSuccess {String}     name           Unique Human readable name of the priority e.g High, Low, Medium.
 * @apiSuccess {Number}     weight         Weight of the priority to help in ordering service request(issue) based on priority.
 * @apiSuccess {String}     color          A color code used to differentiate a service request priority visually.
 * @apiSuccess {ObjectId}   _id            Priority Id
 * @apiSuccess {Timestamp}  createdAt      Priority creation date
 * @apiSuccess {Timestamp}  updatedAt      Priority updated date
 * @apiSuccess {String}     uri            Priority URI
 *
 * @apiSuccessExample {json} Success-Response:
 *    HTTP/1.1 200 OK
 *    {
 *       "name": "Low",
 *       "weight": 0,
 *       "color": "#1B5E20",
 *       "_id": "592029e5e8dd8e00048c1816",
 *       "createdAt": "2017-05-20T11:35:01.059Z",
 *       "updatedAt": "2017-05-20T11:35:01.059Z",
 *       "uri": "https://dawasco.herokuapp.com/priorities/592029e5e8dd8e00048c1816"
 *     }
 *
 * @apiError JWTExpired     Authorization token has expired
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
router.get('/priorities/:id', function (request, response, next) {
  controller.show(request, response, next);
});


/**
 * @api {put}   /priorities/:id   Update Priority information
 * @apiName  PutPriority
 * @apiGroup Priority
 *
 * @apiHeader {String}      accept           Accept value i.e application/json
 * @apiHeader {String}      authorization    Authorization token
 * @apiHeader {String}      content-type     Content type i.e application/json
 *
 * @apiParam   {ObjectId}   id               Priority unique ID.
 * @apiParam   {String}     name             Unique Human readable name of the priority e.g High, Low, Medium.
 * @apiParam   {Number}     weight           Weight of the priority to help in ordering service request(issue) based on priority.
 * @apiParam   {String}     color            A color code used to differentiate a service request priority visually.
 *
 * @apiSuccess {String}     name             Unique Human readable name of the priority e.g High, Low, Medium.
 * @apiSuccess {Number}     weight           Weight of the priority to help in ordering service request(issue) based on priority.
 * @apiSuccess {String}     color            A color code used to differentiate a service request priority visually.
 * @apiSuccess {ObjectId}   _id              Priority Id
 * @apiSuccess {Timestamp}  createdAt        Priority creation date
 * @apiSuccess {Timestamp}  updatedAt        Priority updated date
 * @apiSuccess {String}     uri              Priority URI
 *
 * @apiSuccessExample {json} Success-Response:
 *    HTTP/1.1 200 OK
 *    {
 *       "name": "Low",
 *       "weight": 0,
 *       "color": "#1B5E21",
 *       "_id": "592029e5e8dd8e00048c1816",
 *       "createdAt": "2017-05-20T11:35:01.059Z",
 *       "updatedAt": "2017-05-20T11:35:01.059Z",
 *       "uri": "https://dawasco.herokuapp.com/priorities/592029e5e8dd8e00048c1816"
 *     }
 *
 * @apiError JWTExpired     Authorization token has expired
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
router.put('/priorities/:id', function (request, response, next) {
  controller.update(request, response, next);
});


/**
 * @api {patch}   /priorities/:id   Update Priority information
 * @apiName  PatchPriority
 * @apiGroup Priority
 *
 * @apiHeader {String}      accept           Accept value i.e application/json
 * @apiHeader {String}      authorization    Authorization token
 * @apiHeader {String}      content-type     Content type i.e application/json
 *
 * @apiParam   {ObjectId}   id               Priority unique ID.
 * @apiParam   {String}     name             Unique Human readable name of the priority e.g High, Low, Medium.
 * @apiParam   {Number}     weight           Weight of the priority to help in ordering service request(issue) based on priority.
 * @apiParam   {String}     color            A color code used to differentiate a service request priority visually.
 *
 * @apiSuccess {String}     name             Unique Human readable name of the priority e.g High, Low, Medium.
 * @apiSuccess {Number}     weight           Weight of the priority to help in ordering service request(issue) based on priority.
 * @apiSuccess {String}     color            A color code used to differentiate a service request priority visually.
 * @apiSuccess {ObjectId}   _id              Priority Id
 * @apiSuccess {Timestamp}  createdAt        Priority creation date
 * @apiSuccess {Timestamp}  updatedAt        Priority updated date
 * @apiSuccess {String}     uri              Priority URI
 *
 * @apiSuccessExample {json} Success-Response:
 *    HTTP/1.1 200 OK
 *    {
 *       "name": "Low",
 *       "weight": 0,
 *       "color": "#1B5E21",
 *       "_id": "592029e5e8dd8e00048c1816",
 *       "createdAt": "2017-05-20T11:35:01.059Z",
 *       "updatedAt": "2017-05-20T11:35:01.059Z",
 *       "uri": "https://dawasco.herokuapp.com/priorities/592029e5e8dd8e00048c1816"
 *     }
 *
 * @apiError JWTExpired     Authorization token has expired
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
router.patch('/priorities/:id', function (request, response, next) {
  controller.update(request, response, next);
});


/**
 * @api {delete}  /priorities/:id  Delete Priority
 * @apiName  DeletePriority
 * @apiGroup Priority
 *
 * @apiHeader {String}      accept           Accept value i.e application/json
 * @apiHeader {String}      authorization    Authorization token
 *
 * @apiParam {ObjectId}     id               Priority unique ID.
 *
 * @apiSuccess {String}     name             Unique Human readable name of the priority e.g High, Low, Medium.
 * @apiSuccess {Number}     weight           Weight of the priority to help in ordering service request(issue) based on priority.
 * @apiSuccess {String}     color            A color code used to differentiate a service request priority visually.
 * @apiSuccess {ObjectId}   _id              Priority Id
 * @apiSuccess {Timestamp}  createdAt        Priority creation date
 * @apiSuccess {Timestamp}  updatedAt        Priority updated date
 * @apiSuccess {String}     uri              Priority URI
 *
 * @apiSuccessExample {json} Success-Response:
 *    HTTP/1.1 200 OK
 *    {
 *       "name": "Example",
 *       "weight": 0,
 *       "color": "#0D47A1",
 *       "_id": "597cd4aa3118df0004bc3f87",
 *       "createdAt": "2017-05-20T11:35:01.059Z",
 *       "updatedAt": "2017-05-20T11:35:01.059Z",
 *       "uri": "https://dawasco.herokuapp.com/priorities/597cd4aa3118df0004bc3f87"
 *     }
 *
 * @apiError JWTExpired     Authorization token has expired
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
router.delete('/priorities/:id', function (request, response, next) {
  controller.destroy(request, response, next);
});


/**
 * exports priorities router
 * @type {Object}
 */
module.exports = router;
