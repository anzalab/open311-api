'use strict';


/**
 * Service Router
 *
 * @description :: Server-side router for managing Service.
 */


//dependencies
const path = require('path');
const express = require('express');
const router = express.Router();
const controller =
  require(path.join(__dirname, '..', 'controllers', 'service_controller'));

// enable token authentication
const jwtAuth = require(path.join(__dirname, '..', 'middlewares', 'jwtAuth'));

// add specific middlewares to services router
router.all('/services*', jwtAuth);


/**
 * @api {get} /services Get all Services
 * @apiName GetServices
 * @apiGroup Service
 *
 * @apiHeader {String}      accept         Accept value i.e application/json
 * @apiHeader {String}      authorization  Authorization token
 *
 * @apiExample Example Usage
 * curl -i http://dawasco.herokuapp.com/services
 *
 *
 * @apiSuccess {Object}       jurisdiction        A jurisdiction under which a service (request type) is applicable.If not available a service is applicable to all jurisdictions.
 * @apiSuccess {Object}       group       		    A service group under which a service belongs to
 * @apiSuccess {String}       code        		 	  A unique identifier of the service.Used in deriving code of the service request(issue) and internal usage.
 * @apiSuccess {String}       name           		  A unique human readable name of the service (request type) e.g Water Leakage
 * @apiSuccess {String}       description         A detailed human readable explanation about the service(request type)
 * @apiSuccess {String}       color           		A color (hexadecimal format) used to differentiate service request type visually from other service
 * @apiSuccess {ObjectId}     _id           		  Unique Service Id
 * @apiSuccess {Timestamp}    createdAt       	  Service creation date
 * @apiSuccess {Timestamp}    updatedAt           Service last updated date
 * @apiSuccess {String}       uri          		    Service URI
 * @apiSuccess {Number}       pages       		    Number of results pages
 * @apiSuccess {Number}       count       		    Number of Service results  in the current json response
 *
 * @apiSuccessExample {json} Success-Response:
 *    HTTP/1.1 200 OK
 *    {
 *      "services": [
 *         {
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
 *           "group": {
 *               "code": "N",
 *               "name": "Non Commercial",
 *               "color": "#960F1E",
 *               "_id": "592029e6e8dd8e00048c184d",
 *               "uri": "https://dawasco.herokuapp.com/servicegroups/592029e6e8dd8e00048c184d"
 *           },
 *           "code": "LW",
 *           "name": "Lack of Water",
 *           "description": "Lack of Water related service request(issue)",
 *           "color": "#960F1E",
 *           "_id": "592029e6e8dd8e00048c1852",
 *           "createdAt": "2017-05-20T11:35:02.299Z",
 *           "updatedAt": "2017-05-20T11:35:02.299Z",
 *           "uri": "https://dawasco.herokuapp.com/services/592029e6e8dd8e00048c1852"
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
 *           "group": {
 *               "code": "N",
 *               "name": "Non Commercial",
 *               "color": "#960F1E",
 *               "_id": "592029e6e8dd8e00048c184d",
 *               "uri": "https://dawasco.herokuapp.com/servicegroups/592029e6e8dd8e00048c184d"
 *           },
 *           "code": "LK",
 *           "name": "Leakage",
 *           "description": "Water Leakage related service request(issue)",
 *           "color": "#D31DBB",
 *           "_id": "592029e6e8dd8e00048c1853",
 *           "createdAt": "2017-05-20T11:35:02.315Z",
 *           "updatedAt": "2017-05-20T11:35:02.315Z",
 *           "uri": "https://dawasco.herokuapp.com/services/592029e6e8dd8e00048c1853"
 *       },
 *      ],
 *      "pages": 1,
 *      "count": 2
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
router.get('/services', function (request, response, next) {
  controller.index(request, response, next);
});


/**
 * @api {post} /services Create a new Service
 * @apiName PostService
 * @apiGroup Service
 *
 * @apiHeader {String}        accept              Accept value i.e application/json
 * @apiHeader {String}        authorization       Authorization token
 * @apiHeader {String}        content-type        Sent content type
 *
 * @apiParam {ObjectId}      jurisdiction        A jurisdiction under which a service (request type) is applicable.If not available a service is applicable to all jurisdictions.
 * @apiParam {ObjectId}      group       		    A service group under which a service belongs to
 * @apiParam {String}        code        		 	  A unique identifier of the service.Used in deriving code of the service request(issue) and internal usage.
 * @apiParam {String}        name           		  A unique human readable name of the service (request type) e.g Water Leakage
 * @apiParam {String}        description         A detailed human readable explanation about the service(request type)
 * @apiParam {String}        color           		A color (hexadecimal format) used to differentiate service request type visually from other service
 *
 *
 * @apiSuccess {Object}       jurisdiction        A jurisdiction under which a service (request type) is applicable.If not available a service is applicable to all jurisdictions.
 * @apiSuccess {Object}       group       		    A service group under which a service belongs to
 * @apiSuccess {String}       code        		 	  A unique identifier of the service.Used in deriving code of the service request(issue) and internal usage.
 * @apiSuccess {String}       name           		  A unique human readable name of the service (request type) e.g Water Leakage
 * @apiSuccess {String}       description         A detailed human readable explanation about the service(request type)
 * @apiSuccess {String}       color           		A color (hexadecimal format) used to differentiate service request type visually from other service
 * @apiSuccess {ObjectId}     _id           		  Unique Service Id
 * @apiSuccess {Timestamp}    createdAt       	  Service creation date
 * @apiSuccess {Timestamp}    updatedAt           Service last updated date
 * @apiSuccess {String}       uri          		    Service URI
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
 *           "group": {
 *               "code": "N",
 *               "name": "Non Commercial",
 *               "color": "#960F1E",
 *               "_id": "592029e6e8dd8e00048c184d",
 *               "uri": "https://dawasco.herokuapp.com/servicegroups/592029e6e8dd8e00048c184d"
 *           },
 *           "code": "LW",
 *           "name": "Lack of Water",
 *           "description": "Lack of Water related service request(issue)",
 *           "color": "#960F1E",
 *           "_id": "592029e6e8dd8e00048c1852",
 *           "createdAt": "2017-05-20T11:35:02.299Z",
 *           "updatedAt": "2017-05-20T11:35:02.299Z",
 *           "uri": "https://dawasco.herokuapp.com/services/592029e6e8dd8e00048c1852"
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
 * @apiError JWTExpired     Authorization token has expired
 *
 * @apiErrorExample  {json}   Error-Response:
 *    HTTP/1.1 403 Forbidden
 *    {
 *      "success":false,
 *      "message :"jwt expired",
 *      "error":{}
 *    }
 */
router.post('/services', function (request, response, next) {
  controller.create(request, response, next);
});


/**
 * @api {get} /services/:id Request Service information
 * @apiName GetService
 * @apiGroup Service
 *
 * @apiHeader {String}      accept         Accept value i.e application/json
 * @apiHeader {String}      authorization  Authorization token

 *
 * @apiParam {ObjectId}       id                  Unique service Id.
 *
 * @apiSuccess {Object}       jurisdiction        A jurisdiction under which a service (request type) is applicable.If not available a service is applicable to all jurisdictions.
 * @apiSuccess {Object}       group       		    A service group under which a service belongs to
 * @apiSuccess {String}       code        		 	  A unique identifier of the service.Used in deriving code of the service request(issue) and internal usage.
 * @apiSuccess {String}       name           		  A unique human readable name of the service (request type) e.g Water Leakage
 * @apiSuccess {String}       description         A detailed human readable explanation about the service(request type)
 * @apiSuccess {String}       color           		A color (hexadecimal format) used to differentiate service request type visually from other service
 * @apiSuccess {ObjectId}     _id           		  Unique Service Id
 * @apiSuccess {Timestamp}    createdAt       	  Service creation date
 * @apiSuccess {Timestamp}    updatedAt           Service last updated date
 * @apiSuccess {String}       uri          		    Service URI
 * @apiSuccess {Number}       pages       		    Number of results pages
 * @apiSuccess {Number}       count       		    Number of Service results  in the current json response
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
 *           "group": {
 *               "code": "N",
 *               "name": "Non Commercial",
 *               "color": "#960F1E",
 *               "_id": "592029e6e8dd8e00048c184d",
 *               "uri": "https://dawasco.herokuapp.com/servicegroups/592029e6e8dd8e00048c184d"
 *           },
 *           "code": "LW",
 *           "name": "Lack of Water",
 *           "description": "Lack of Water related service request(issue)",
 *           "color": "#960F1E",
 *           "_id": "592029e6e8dd8e00048c1852",
 *           "createdAt": "2017-05-20T11:35:02.299Z",
 *           "updatedAt": "2017-05-20T11:35:02.299Z",
 *           "uri": "https://dawasco.herokuapp.com/services/592029e6e8dd8e00048c1852"
 *    }
 *
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
router.get('/services/:id', function (request, response, next) {
  controller.show(request, response, next);
});


/**
 * @api {put} /services/:id Update Service information
 * @apiName PutService
 * @apiGroup Service
 *
 * @apiHeader {String}      accept           Accept value i.e application/json
 * @apiHeader {String}      authorization    Authorization token
 * @apiHeader {String}      content-type     Content type i.e application/json
 *
 * @apiParam   {ObjectId}     id                  Unique service Id.
 * @apiParam  {ObjectId}     [jurisdiction]      A jurisdiction under which a service (request type) is applicable.If not available a service is applicable to all jurisdictions.
 * @apiParam  {ObjectId}     [group]       		  A service group under which a service belongs to
 * @apiParam  {String}       [code]        		  Unique identifier of the service.Used in deriving code of the service request(issue) and internal usage.
 * @apiParam  {String}       [name]           	  A unique human readable name of the service (request type) e.g Water Leakage
 * @apiParam  {String}       [description]       A detailed human readable explanation about the service(request type)
 * @apiParam  {String}       [color]             A color (hexadecimal format) used to differentiate service request type visually from other service
 *
 * @apiSuccess {Object}       jurisdiction        A jurisdiction under which a service (request type) is applicable.If not available a service is applicable to all jurisdictions.
 * @apiSuccess {Object}       group       		    A service group under which a service belongs to
 * @apiSuccess {String}       code        		 	  A unique identifier of the service.Used in deriving code of the service request(issue) and internal usage.
 * @apiSuccess {String}       name           		  A unique human readable name of the service (request type) e.g Water Leakage
 * @apiSuccess {String}       description         A detailed human readable explanation about the service(request type)
 * @apiSuccess {String}       color           		A color (hexadecimal format) used to differentiate service request type visually from other service
 * @apiSuccess {ObjectId}     _id           		  Unique Service Id
 * @apiSuccess {Timestamp}    createdAt       	  Service creation date
 * @apiSuccess {Timestamp}    updatedAt           Service last updated date
 * @apiSuccess {String}       uri          		    Service URI
 * @apiSuccess {Number}       pages       		    Number of results pages
 * @apiSuccess {Number}       count       		    Number of Service results  in the current json response
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
 *           "group": {
 *               "code": "N",
 *               "name": "Non Commercial",
 *               "color": "#960F1E",
 *               "_id": "592029e6e8dd8e00048c184d",
 *               "uri": "https://dawasco.herokuapp.com/servicegroups/592029e6e8dd8e00048c184d"
 *           },
 *           "code": "LW",
 *           "name": "Lack of Water",
 *           "description": "Lack of Water related service request(issue)",
 *           "color": "#960F1E",
 *           "_id": "592029e6e8dd8e00048c1852",
 *           "createdAt": "2017-05-20T11:35:02.299Z",
 *           "updatedAt": "2017-05-20T11:35:02.299Z",
 *           "uri": "https://dawasco.herokuapp.com/services/592029e6e8dd8e00048c1852"
 *    }
 *
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
router.put('/services/:id', function (request, response, next) {
  controller.update(request, response, next);
});


/**
 * @api {patch} /services/:id Update Service information
 * @apiName  PatchService
 * @apiGroup Service
 *
 * @apiHeader {String}      accept           Accept value i.e application/json
 * @apiHeader {String}      authorization    Authorization token
 * @apiHeader {String}      content-type     Content type i.e application/json
 *
 * @apiParam   {ObjectId}     id                  Unique Service Id.
 * @apiParam  {ObjectId}     [jurisdiction]      A jurisdiction under which a service (request type) is applicable.If not available a service is applicable to all jurisdictions.
 * @apiParam  {ObjectId}     [group]       		  A service group under which a service belongs to
 * @apiParam  {String}       [code]        		  Unique identifier of the service.Used in deriving code of the service request(issue) and internal usage.
 * @apiParam  {String}       [name]           	  A unique human readable name of the service (request type) e.g Water Leakage
 * @apiParam  {String}       [description]       A detailed human readable explanation about the service(request type)
 * @apiParam  {String}       [color]             A color (hexadecimal format) used to differentiate service request type visually from other service
 *
 * @apiSuccess {Object}       jurisdiction        A jurisdiction under which a service (request type) is applicable.If not available a service is applicable to all jurisdictions.
 * @apiSuccess {Object}       group       		    A service group under which a service belongs to
 * @apiSuccess {String}       code        		 	  A unique identifier of the service.Used in deriving code of the service request(issue) and internal usage.
 * @apiSuccess {String}       name           		  A unique human readable name of the service (request type) e.g Water Leakage
 * @apiSuccess {String}       description         A detailed human readable explanation about the service(request type)
 * @apiSuccess {String}       color           		A color (hexadecimal format) used to differentiate service request type visually from other service
 * @apiSuccess {ObjectId}     _id           		  Unique Service Id
 * @apiSuccess {Timestamp}    createdAt       	  Service creation date
 * @apiSuccess {Timestamp}    updatedAt           Service last updated date
 * @apiSuccess {String}       uri          		    Service URI
 * @apiSuccess {Number}       pages       		    Number of results pages
 * @apiSuccess {Number}       count       		    Number of Service results  in the current json response
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
 *           "group": {
 *               "code": "N",
 *               "name": "Non Commercial",
 *               "color": "#960F1E",
 *               "_id": "592029e6e8dd8e00048c184d",
 *               "uri": "https://dawasco.herokuapp.com/servicegroups/592029e6e8dd8e00048c184d"
 *           },
 *           "code": "LW",
 *           "name": "Lack of Water",
 *           "description": "Lack of Water related service request(issue)",
 *           "color": "#960F1E",
 *           "_id": "592029e6e8dd8e00048c1852",
 *           "createdAt": "2017-05-20T11:35:02.299Z",
 *           "updatedAt": "2017-05-20T11:35:02.299Z",
 *           "uri": "https://dawasco.herokuapp.com/services/592029e6e8dd8e00048c1852"
 *    }
 *
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
router.patch('/services/:id', function (request, response, next) {
  controller.update(request, response, next);
});


/**
 * @api {delete} /services/:id Delete Service information
 * @apiName DeleteService
 * @apiGroup Service
 *
 * @apiHeader {String}      accept           Accept value i.e application/json
 * @apiHeader {String}      authorization    Authorization token
 *
 * @apiParam {ObjectId}     id               Unique Service Id.
 *
 * @apiSuccess {Object}       jurisdiction        A jurisdiction under which a service (request type) is applicable.If not available a service is applicable to all jurisdictions.
 * @apiSuccess {Object}       group       		    A service group under which a service belongs to
 * @apiSuccess {String}       code        		 	  A unique identifier of the service.Used in deriving code of the service request(issue) and internal usage.
 * @apiSuccess {String}       name           		  A unique human readable name of the service (request type) e.g Water Leakage
 * @apiSuccess {String}       description         A detailed human readable explanation about the service(request type)
 * @apiSuccess {String}       color           		A color (hexadecimal format) used to differentiate service request type visually from other service
 * @apiSuccess {ObjectId}     _id           		  Unique Service Id
 * @apiSuccess {Timestamp}    createdAt       	  Service creation date
 * @apiSuccess {Timestamp}    updatedAt           Service last updated date
 * @apiSuccess {String}       uri          		    Service URI
 * @apiSuccess {Number}       pages       		    Number of results pages
 * @apiSuccess {Number}       count       		    Number of Service results  in the current json response
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
 *           "group": {
 *               "code": "N",
 *               "name": "Non Commercial",
 *               "color": "#960F1E",
 *               "_id": "592029e6e8dd8e00048c184d",
 *               "uri": "https://dawasco.herokuapp.com/servicegroups/592029e6e8dd8e00048c184d"
 *           },
 *           "code": "LW",
 *           "name": "Lack of Water",
 *           "description": "Lack of Water related service request(issue)",
 *           "color": "#960F1E",
 *           "_id": "592029e6e8dd8e00048c1852",
 *           "createdAt": "2017-05-20T11:35:02.299Z",
 *           "updatedAt": "2017-05-20T11:35:02.299Z",
 *           "uri": "https://dawasco.herokuapp.com/services/592029e6e8dd8e00048c1852"
 *    }
 *
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
router.delete('/services/:id', function (request, response, next) {
  controller.destroy(request, response, next);
});


/**
 * exports services router
 * @type {Object}
 */
module.exports = router;
