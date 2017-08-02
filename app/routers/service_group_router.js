'use strict';


/**
 * ServiceGroup Router
 *
 * @description :: Server-side router for managing ServiceGroup.
 */


//dependencies
const path = require('path');
const express = require('express');
const router = express.Router();
const controller =
  require(path.join(__dirname, '..', 'controllers', 'service_group_controller'));

// enable token authentication
const jwtAuth = require(path.join(__dirname, '..', 'middlewares', 'jwtAuth'));

// add specific middlewares to servicegroups router
router.all('/servicegroups*', jwtAuth);

/**
 * @api {get} /servicegroups Get all ServiceGroups
 * @apiName GetServiceGroups
 * @apiGroup ServiceGroup
 *
 * @apiHeader {String}      accept         Accept value i.e application/json
 * @apiHeader {String}      authorization  Authorization token
 *
 * @apiExample Example Usage
 * curl -i http://dawasco.herokuapp.com/servicegroups
 *
 *
 * @apiSuccess {Object}       jurisdiction        A jurisdiction under which a service group is applicable. If not available a service group is applicable to all  jurisdictions.
 * @apiSuccess {String}       code                A unique identifier of the service group.Used in deriving code of the service request(issue) and internal jurisdiction usage i.e act as an issue identifier.
 * @apiSuccess {String}       name                A unique human readable name of the service group e.g Sanitation
 * @apiSuccess {String}       description         A detailed human readable explanation about the service group.
 * @apiSuccess {String}       color           		A color code(in hexadecimal format) eg. #363636 used to differentiate a service group visually from other service group.  If not provided it will randomly generated, but it is not guarantee its visual appeal.
 * @apiSuccess {ObjectId}     _id           		  Unique Service Group Id
 * @apiSuccess {Timestamp}    createdAt       	  Service group creation date
 * @apiSuccess {Timestamp}    updatedAt           Service group last updated date
 * @apiSuccess {String}       uri          		    Service group URI
 * @apiSuccess {Number}       pages       		    Number of results pages
 * @apiSuccess {Number}       count       		    Number of Service groups results  in the current json response
 *
 * @apiSuccessExample {json} Success-Response:
 *    HTTP/1.1 200 OK
 *    {
 *     "servicegroups": [
 *       {
 *           "jurisdiction": {
 *               "code": "H",
 *               "name": "HQ",
 *               "phone": "255714999888",
 *               "email": "N/A",
 *               "domain": "dawasco.org",
 *               "_id": "592029e5e8dd8e00048c184b",
 *               "longitude": 0,
 *               "latitude": 0,
 *               "uri": "https://dawasco.herokuapp.com/jurisdictions/592029e5e8dd8e00048c184b"
 *           },
 *           "code": "C",
 *           "name": "Commercial",
 *           "description": "Commercial related service request(issue)",
 *           "color": "#06C947",
 *           "_id": "592029e6e8dd8e00048c184c",
 *           "createdAt": "2017-05-20T11:35:02.033Z",
 *           "updatedAt": "2017-05-20T11:35:02.033Z",
 *           "uri": "https://dawasco.herokuapp.com/servicegroups/592029e6e8dd8e00048c184c"
 *       },
 *       {
 *           "jurisdiction": {
 *               "code": "H",
 *               "name": "HQ",
 *               "phone": "255714999888",
 *               "email": "N/A",
 *               "domain": "dawasco.org",
 *               "_id": "592029e5e8dd8e00048c184b",
 *               "longitude": 0,
 *               "latitude": 0,
 *               "uri": "https://dawasco.herokuapp.com/jurisdictions/592029e5e8dd8e00048c184b"
 *           },
 *           "code": "N",
 *           "name": "Non Commercial",
 *           "description": "Non commercial related service request(issue)",
 *           "color": "#960F1E",
 *           "_id": "592029e6e8dd8e00048c184d",
 *           "createdAt": "2017-05-20T11:35:02.054Z",
 *           "updatedAt": "2017-05-20T11:35:02.054Z",
 *           "uri": "https://dawasco.herokuapp.com/servicegroups/592029e6e8dd8e00048c184d"
 *       },
 *       {
 *           "jurisdiction": {
 *               "code": "H",
 *               "name": "HQ",
 *               "phone": "255714999888",
 *               "email": "N/A",
 *               "domain": "dawasco.org",
 *               "_id": "592029e5e8dd8e00048c184b",
 *               "longitude": 0,
 *               "latitude": 0,
 *               "uri": "https://dawasco.herokuapp.com/jurisdictions/592029e5e8dd8e00048c184b"
 *           },
 *           "code": "O",
 *           "name": "Other",
 *           "description": "Other related service request(issue)",
 *           "color": "#C8B1EF",
 *           "_id": "592029e6e8dd8e00048c184e",
 *           "createdAt": "2017-05-20T11:35:02.066Z",
 *           "updatedAt": "2017-05-20T11:35:02.066Z",
 *           "uri": "https://dawasco.herokuapp.com/servicegroups/592029e6e8dd8e00048c184e"
 *       }
 *    ],
 *    "pages": 1,
 *    "count": 3
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
router.get('/servicegroups', function (request, response, next) {
  controller.index(request, response, next);
});


/**
 * @api {post} /servicegroups Create a new service group
 * @apiName PostServiceGroup
 * @apiGroup ServiceGroup
 *
 * @apiHeader {String}      accept           Accept value i.e application/json
 * @apiHeader {String}      authorization    Authorization token
 * @apiHeader {String}      content-type     Sent content type i.e application/json
 *
 * @apiParam {ObjectId}     jurisdiction        A jurisdiction under which a service group is applicable. If not available a service group is applicable to all  jurisdictions.
 * @apiParam {String}       code                A unique identifier of the service group.Used in deriving code of the service request(issue) and internal jurisdiction usage i.e act as an issue identifier.
 * @apiParam {String}       name                A unique human readable name of the service group e.g Sanitation
 * @apiParam {String}       description         A detailed human readable explanation about the service group.
 * @apiParam {String}       color           		A color code(in hexadecimal format) eg. #363636 used to differentiate a service group visually from other service group.  If not provided it will randomly generated, but it is not guarantee its visual appeal.
 *
 *
 * @apiSuccess {Object}       jurisdiction        A jurisdiction under which a service group is applicable. If not available a service group is applicable to all  jurisdictions.
 * @apiSuccess {String}       code                A unique identifier of the service group.Used in deriving code of the service request(issue) and internal jurisdiction usage i.e act as an issue identifier.
 * @apiSuccess {String}       name                A unique human readable name of the service group e.g Sanitation
 * @apiSuccess {String}       description         A detailed human readable explanation about the service group.
 * @apiSuccess {String}       color           		A color code(in hexadecimal format) eg. #363636 used to differentiate a service group visually from other service group.  If not provided it will randomly generated, but it is not guarantee its visual appeal.
 * @apiSuccess {ObjectId}     _id           		  Unique Service Group Id
 * @apiSuccess {Timestamp}    createdAt       	  Service group creation date
 * @apiSuccess {Timestamp}    updatedAt           Service group last updated date
 * @apiSuccess {String}       uri          		    Service group URI
 *
 * @apiSuccessExample {json} Success-Response:
 *    HTTP/1.1 201 Created
 *    {
 *           "jurisdiction": {
 *               "code": "H",
 *               "name": "HQ",
 *               "phone": "255714999888",
 *               "email": "N/A",
 *               "domain": "dawasco.org",
 *               "_id": "592029e5e8dd8e00048c184b",
 *               "longitude": 0,
 *               "latitude": 0,
 *               "uri": "https://dawasco.herokuapp.com/jurisdictions/592029e5e8dd8e00048c184b"
 *           },
 *           "code": "C",
 *           "name": "Commercial",
 *           "description": "Commercial related service request(issue)",
 *           "color": "#06C947",
 *           "_id": "592029e6e8dd8e00048c184c",
 *           "createdAt": "2017-05-20T11:35:02.033Z",
 *           "updatedAt": "2017-05-20T11:35:02.033Z",
 *           "uri": "https://dawasco.herokuapp.com/servicegroups/592029e6e8dd8e00048c184c"
 *    }
 *
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
router.post('/servicegroups', function (request, response, next) {
  controller.create(request, response, next);
});


/**
 * @api {get} /servicegroups/:id Request Service Group information
 * @apiName GetServiceGroup
 * @apiGroup ServiceGroup
 *
 * @apiHeader {String}      accept         Accept value i.e application/json
 * @apiHeader {String}      authorization  Authorization token

 *
 * @apiParam {ObjectId}       id                  Unique Service Group  Id.
 *
 * @apiSuccess {Object}       jurisdiction        A jurisdiction under which a service group is applicable. If not available a service group is applicable to all  jurisdictions.
 * @apiSuccess {String}       code                A unique identifier of the service group.Used in deriving code of the service request(issue) and internal jurisdiction usage i.e act as an issue identifier.
 * @apiSuccess {String}       name                A unique human readable name of the service group e.g Sanitation
 * @apiSuccess {String}       description         A detailed human readable explanation about the service group.
 * @apiSuccess {String}       color           		A color code(in hexadecimal format) eg. #363636 used to differentiate a service group visually from other service group.  If not provided it will randomly generated, but it is not guarantee its visual appeal.
 * @apiSuccess {ObjectId}     _id           		  Unique Service Group Id
 * @apiSuccess {Timestamp}    createdAt       	  Service group creation date
 * @apiSuccess {Timestamp}    updatedAt           Service group last updated date
 * @apiSuccess {String}       uri          		    Service group URI
 *
 *
 * @apiSuccessExample {json} Success-Response:
 *    HTTP/1.1 200 OK
 *    {
 *           "jurisdiction": {
 *               "code": "H",
 *               "name": "HQ",
 *               "phone": "255714999888",
 *               "email": "N/A",
 *               "domain": "dawasco.org",
 *               "_id": "592029e5e8dd8e00048c184b",
 *               "longitude": 0,
 *               "latitude": 0,
 *               "uri": "https://dawasco.herokuapp.com/jurisdictions/592029e5e8dd8e00048c184b"
 *           },
 *           "code": "C",
 *           "name": "Commercial",
 *           "description": "Commercial related service request(issue)",
 *           "color": "#06C947",
 *           "_id": "592029e6e8dd8e00048c184c",
 *           "createdAt": "2017-05-20T11:35:02.033Z",
 *           "updatedAt": "2017-05-20T11:35:02.033Z",
 *           "uri": "https://dawasco.herokuapp.com/servicegroups/592029e6e8dd8e00048c184c"
 *    }
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
router.get('/servicegroups/:id', function (request, response, next) {
  controller.show(request, response, next);
});


/**
 * @api {put} /servicegroups/:id Update specific service group information
 * @apiName PutServiceGroup
 * @apiGroup ServiceGroup
 *
 * @apiHeader {String}      accept           Accept value i.e application/json
 * @apiHeader {String}      authorization    Authorization token
 * @apiHeader {String}      content-type     Sent content type i.e application/json
 *
 * @apiParam {ObjectId}     jurisdiction        A jurisdiction under which a service group is applicable. If not available a service group is applicable to all  jurisdictions.
 * @apiParam {String}       code                A unique identifier of the service group.Used in deriving code of the service request(issue) and internal jurisdiction usage i.e act as an issue identifier.
 * @apiParam {String}       name                A unique human readable name of the service group e.g Sanitation
 * @apiParam {String}       description         A detailed human readable explanation about the service group.
 * @apiParam {String}       color           		A color code(in hexadecimal format) eg. #363636 used to differentiate a service group visually from other service group.  If not provided it will randomly generated, but it is not guarantee its visual appeal.
 *
 *
 * @apiSuccess {Object}       jurisdiction        A jurisdiction under which a service group is applicable. If not available a service group is applicable to all  jurisdictions.
 * @apiSuccess {String}       code                A unique identifier of the service group.Used in deriving code of the service request(issue) and internal jurisdiction usage i.e act as an issue identifier.
 * @apiSuccess {String}       name                A unique human readable name of the service group e.g Sanitation
 * @apiSuccess {String}       description         A detailed human readable explanation about the service group.
 * @apiSuccess {String}       color           		A color code(in hexadecimal format) eg. #363636 used to differentiate a service group visually from other service group.  If not provided it will randomly generated, but it is not guarantee its visual appeal.
 * @apiSuccess {ObjectId}     _id           		  Unique Service Group Id
 * @apiSuccess {Timestamp}    createdAt       	  Service group creation date
 * @apiSuccess {Timestamp}    updatedAt           Service group last updated date
 * @apiSuccess {String}       uri          		    Service group URI
 *
 * @apiSuccessExample {json} Success-Response:
 *    HTTP/1.1 200 OK
 *    {
 *           "jurisdiction": {
 *               "code": "H",
 *               "name": "HQ",
 *               "phone": "255714999888",
 *               "email": "N/A",
 *               "domain": "dawasco.org",
 *               "_id": "592029e5e8dd8e00048c184b",
 *               "longitude": 0,
 *               "latitude": 0,
 *               "uri": "https://dawasco.herokuapp.com/jurisdictions/592029e5e8dd8e00048c184b"
 *           },
 *           "code": "C",
 *           "name": "Commercial",
 *           "description": "Commercial related service request(issue)",
 *           "color": "#06C947",
 *           "_id": "592029e6e8dd8e00048c184c",
 *           "createdAt": "2017-05-20T11:35:02.033Z",
 *           "updatedAt": "2017-05-20T11:35:02.033Z",
 *           "uri": "https://dawasco.herokuapp.com/servicegroups/592029e6e8dd8e00048c184c"
 *    }
 *
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
router.put('/servicegroups/:id', function (request, response, next) {
  controller.update(request, response, next);
});


/**
 * @api {patch} /servicegroups/:id Update specific service group information
 * @apiName PatchServiceGroup
 * @apiGroup ServiceGroup
 *
 * @apiHeader {String}      accept           Accept value i.e application/json
 * @apiHeader {String}      authorization    Authorization token
 * @apiHeader {String}      content-type     Sent content type i.e application/json
 *
 * @apiParam {ObjectId}     jurisdiction        A jurisdiction under which a service group is applicable. If not available a service group is applicable to all  jurisdictions.
 * @apiParam {String}       code                A unique identifier of the service group.Used in deriving code of the service request(issue) and internal jurisdiction usage i.e act as an issue identifier.
 * @apiParam {String}       name                A unique human readable name of the service group e.g Sanitation
 * @apiParam {String}       description         A detailed human readable explanation about the service group.
 * @apiParam {String}       color           		A color code(in hexadecimal format) eg. #363636 used to differentiate a service group visually from other service group.  If not provided it will randomly generated, but it is not guarantee its visual appeal.
 *
 *
 * @apiSuccess {Object}       jurisdiction        A jurisdiction under which a service group is applicable. If not available a service group is applicable to all  jurisdictions.
 * @apiSuccess {String}       code                A unique identifier of the service group.Used in deriving code of the service request(issue) and internal jurisdiction usage i.e act as an issue identifier.
 * @apiSuccess {String}       name                A unique human readable name of the service group e.g Sanitation
 * @apiSuccess {String}       description         A detailed human readable explanation about the service group.
 * @apiSuccess {String}       color           		A color code(in hexadecimal format) eg. #363636 used to differentiate a service group visually from other service group.  If not provided it will randomly generated, but it is not guarantee its visual appeal.
 * @apiSuccess {ObjectId}     _id           		  Unique Service Group Id
 * @apiSuccess {Timestamp}    createdAt       	  Service group creation date
 * @apiSuccess {Timestamp}    updatedAt           Service group last updated date
 * @apiSuccess {String}       uri          		    Service group URI
 *
 * @apiSuccessExample {json} Success-Response:
 *    HTTP/1.1 200 OK
 *    {
 *           "jurisdiction": {
 *               "code": "H",
 *               "name": "HQ",
 *               "phone": "255714999888",
 *               "email": "N/A",
 *               "domain": "dawasco.org",
 *               "_id": "592029e5e8dd8e00048c184b",
 *               "longitude": 0,
 *               "latitude": 0,
 *               "uri": "https://dawasco.herokuapp.com/jurisdictions/592029e5e8dd8e00048c184b"
 *           },
 *           "code": "C",
 *           "name": "Commercial",
 *           "description": "Commercial related service request(issue)",
 *           "color": "#06C947",
 *           "_id": "592029e6e8dd8e00048c184c",
 *           "createdAt": "2017-05-20T11:35:02.033Z",
 *           "updatedAt": "2017-05-20T11:35:02.033Z",
 *           "uri": "https://dawasco.herokuapp.com/servicegroups/592029e6e8dd8e00048c184c"
 *    }
 *
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
router.patch('/servicegroups/:id', function (request, response, next) {
  controller.update(request, response, next);
});


/**
 * @api {delete} /servicegroups/:id Delete specific service group information
 * @apiName DeleteServiceGroup
 * @apiGroup ServiceGroup
 *
 * @apiHeader {String}      accept           Accept value i.e application/json
 * @apiHeader {String}      authorization    Authorization token
 *
 * @apiParam {ObjectId}       id                  Unique Service Group  Id.
 *
 * @apiSuccess {Object}       jurisdiction        A jurisdiction under which a service group is applicable. If not available a service group is applicable to all  jurisdictions.
 * @apiSuccess {String}       code                A unique identifier of the service group.Used in deriving code of the service request(issue) and internal jurisdiction usage i.e act as an issue identifier.
 * @apiSuccess {String}       name                A unique human readable name of the service group e.g Sanitation
 * @apiSuccess {String}       description         A detailed human readable explanation about the service group.
 * @apiSuccess {String}       color           		A color code(in hexadecimal format) eg. #363636 used to differentiate a service group visually from other service group.  If not provided it will randomly generated, but it is not guarantee its visual appeal.
 * @apiSuccess {ObjectId}     _id           		  Unique Service Group Id
 * @apiSuccess {Timestamp}    createdAt       	  Service group creation date
 * @apiSuccess {Timestamp}    updatedAt           Service group last updated date
 * @apiSuccess {String}       uri          		    Service group URI
 *
 * @apiSuccessExample {json} Success-Response:
 *    HTTP/1.1 200 OK
 *    {
 *           "jurisdiction": {
 *               "code": "H",
 *               "name": "HQ",
 *               "phone": "255714999888",
 *               "email": "N/A",
 *               "domain": "dawasco.org",
 *               "_id": "592029e5e8dd8e00048c184b",
 *               "longitude": 0,
 *               "latitude": 0,
 *               "uri": "https://dawasco.herokuapp.com/jurisdictions/592029e5e8dd8e00048c184b"
 *           },
 *           "code": "C",
 *           "name": "Commercial",
 *           "description": "Commercial related service request(issue)",
 *           "color": "#06C947",
 *           "_id": "592029e6e8dd8e00048c184c",
 *           "createdAt": "2017-05-20T11:35:02.033Z",
 *           "updatedAt": "2017-05-20T11:35:02.033Z",
 *           "uri": "https://dawasco.herokuapp.com/servicegroups/592029e6e8dd8e00048c184c"
 *    }
 *
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
router.delete('/servicegroups/:id', function (request, response, next) {
  controller.destroy(request, response, next);
});


/**
 * exports servicegroups router
 * @type {Object}
 */
module.exports = router;
