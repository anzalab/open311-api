'use strict';


/**
 * ServiceRequest Router
 *
 * @description :: Server-side router for managing ServiceRequest.
 */


//dependencies
const path = require('path');
const express = require('express');
const router = express.Router();
const controller =
  require(path.join(__dirname, '..', 'controllers',
    'service_request_controller'));

// enable token authentication
const jwtAuth = require(path.join(__dirname, '..', 'middlewares', 'jwtAuth'));

// add specific middlewares to servicerequests router
router.all('/servicerequests*', jwtAuth);


/**
 * @api {get} /servicerequests Get all ServiceRequests
 * @apiName GetServiceRequests
 * @apiGroup ServiceRequest
 *
 * @apiHeader {String}      accept         Accept value i.e application/json
 * @apiHeader {String}      authorization  Authorization token
 *
 * @apiExample Example Usage
 * curl -i http://dawasco.herokuapp.com/servicerequests
 *
 *
 * @apiSuccess {Object}       jurisdiction        A jurisdiction responsible in handling service request(issue)
 * @apiSuccess {Object}       group       		    A service group under which request(issue) belongs to
 * @apiSuccess {Object}       Service       		  A service under which request(issue) belongs to
 * @apiSuccess {Object}       Call       		      Log operator call details at a call center
 * @apiSuccess {Object}       Reporter        		A party i.e civilian, customer etc which reported an issue(service request)
 * @apiSuccess {Object}       Operator        		A party oversee the work on the service request(issue).It also a party that is answerable for the progress and status of the service request(issue) to a reporter. For jurisdiction that own a call center, then operator is a person who received a call.
 * @apiSuccess {Object}       assignee            A party assigned to work on the service request(issue). It also a party that is answerable for the progress and status of the service request(issue) to operator and overall jurisdiction administrative structure.
 * @apiSuccess {String}       code                A unique human readable identifier of the service request(issue). It mainly used by reporter to query for status and progress of the reported issue.
 * @apiSuccess {String}       description         A detailed human readable explanation about the service request(issue).
 * @apiSuccess {String}       address             A human entered address or description of location where service request(issue) happened.
 * @apiSuccess {String}       method           		A communication(contact) method(mechanism) used by a reporter to report the issue.
 * @apiSuccess {Object}       status             	A current status of the service request(issue)
 * @apiSuccess {Object}       priority            A priority of the service request(issue).  It used to weight a service request(issue) relative  to other(s).
 * @apiSuccess {Array}        attachments         Associated file(s) with service request(issue)
 * @apiSuccess {Duration}     ttr                 A time taken to resolve the issue(service request) in duration format.  Used to calculate Mean Time To Resolve(MTTR) KPI.  It calculated as time taken since the issue reported to the  time when issue resolved.
 * @apiSuccess {ObjectId}     _id           		  Unique ServiceRequest Id
 * @apiSuccess {Timestamp}    createdAt       	  Service request creation date
 * @apiSuccess {Timestamp}    updatedAt           Service request last updated date
 * @apiSuccess {Number}       ttrSeconds          A time taken to resolve the issue(service request) in seconds
 * @apiSuccess {Number}       ttrMinutes          A time taken to resolve the issue(service request) in minutes
 * @apiSuccess {Number}       ttrHours            A time taken to resolve the issue(service request) in hours
 * @apiSuccess {Number}       longitude           Obtain service request(issue) longitude
 * @apiSuccess {Number}       latitude            Obtain service request(issue) latitude
 * @apiSuccess {String}       uri          		    ServiceRequest URI
 * @apiSuccess {Number}       pages       		    Number of results pages
 * @apiSuccess {Number}       count       		    Number of ServiceRequest results  in the current json response
 *
 * @apiSuccessExample {json} Success-Response:
 *    HTTP/1.1 200 OK
 *    {
 *      "servicerequests": [
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
 *           "service": {
 *               "group": {
 *                   "code": "N",
 *                   "name": "Non Commercial",
 *                   "color": "#960F1E",
 *                   "_id": "592029e6e8dd8e00048c184d",
 *                   "uri": "https://dawasco.herokuapp.com/servicegroups/592029e6e8dd8e00048c184d"
 *               },
 *               "code": "LW",
 *               "name": "Lack of Water",
 *               "color": "#960F1E",
 *               "_id": "592029e6e8dd8e00048c1852",
 *               "uri": "https://dawasco.herokuapp.com/services/592029e6e8dd8e00048c1852"
 *           },
 *           "call": {
 *               "startedAt": "2017-05-20T11:35:02.421Z",
 *               "endedAt": "2017-05-20T11:35:02.421Z",
 *               "duration": 0
 *           },
 *           "reporter": {
 *               "name": "Juma John",
 *               "phone": "255765952971",
 *               "email": "scala.lally@gmail.com"
 *           },
 *           "operator": {
 *               "name": "Juma John",
 *               "phone": "255765952971",
 *               "_id": "592029e6e8dd8e00048c1856",
 *               "permissions": [],
 *               "email": "scala.lally@gmail.com",
 *               "uri": "https://dawasco.herokuapp.com/parties/592029e6e8dd8e00048c1856"
 *           },
 *           "assignee": {
 *               "name": "Moses Kabungo",
 *               "phone": "255753111039",
 *               "_id": "592029e6e8dd8e00048c185f",
 *               "permissions": [],
 *               "email": "kbng.moses@gmail.com",
 *               "uri": "https://dawasco.herokuapp.com/parties/592029e6e8dd8e00048c185f"
 *           },
 *           "code": "HLW170001",
 *           "description": "For three days now we dont have water",
 *           "address": "Mikocheni",
 *           "method": "Call",
 *           "status": {
 *               "name": "Open",
 *               "weight": -5,
 *               "color": "#0D47A1",
 *               "_id": "592029e5e8dd8e00048c180d",
 *               "createdAt": "2017-05-20T11:35:01.059Z",
 *               "updatedAt": "2017-05-20T11:35:01.059Z",
 *               "uri": "https://dawasco.herokuapp.com/statuses/592029e5e8dd8e00048c180d"
 *           },
 *           "priority": {
 *               "name": "Low",
 *               "weight": 0,
 *               "color": "#1B5E29",
 *               "_id": "592029e5e8dd8e00048c1816",
 *               "createdAt": "2017-05-20T11:35:01.586Z",
 *               "updatedAt": "2017-07-29T19:12:40.178Z",
 *               "uri": "https://dawasco.herokuapp.com/priorities/592029e5e8dd8e00048c1816"
 *           },
 *           "attachments": [],
 *           "ttr": 0,
 *           "_id": "592029e6e8dd8e00048c1859",
 *           "createdAt": "2017-05-20T11:35:02.474Z",
 *           "updatedAt": "2017-05-20T11:36:45.294Z",
 *           "ttrSeconds": 0,
 *           "ttrMinutes": 0,
 *           "ttrHours": 0,
 *           "longitude": 0,
 *           "latitude": 0,
 *           "uri": "https://dawasco.herokuapp.com/servicerequests/592029e6e8dd8e00048c1859"
 *       },
 *       {
 *           "jurisdiction": {
 *               "code": "I",
 *               "name": "Ilala",
 *               "phone": "255714999887",
 *               "email": "N/A",
 *               "domain": "ilala.dawasco.org",
 *               "_id": "592029e6e8dd8e00048c1850",
 *               "longitude": 0,
 *               "latitude": 0,
 *               "uri": "https://dawasco.herokuapp.com/jurisdictions/592029e6e8dd8e00048c1850"
 *           },
 *           "service": {
 *               "group": {
 *                   "code": "N",
 *                   "name": "Non Commercial",
 *                   "color": "#960F1E",
 *                   "_id": "592029e6e8dd8e00048c184d",
 *                   "uri": "https://dawasco.herokuapp.com/servicegroups/592029e6e8dd8e00048c184d"
 *               },
 *               "code": "LK",
 *               "name": "Leakage",
 *               "color": "#D31DBB",
 *               "_id": "592029e6e8dd8e00048c1853",
 *               "uri": "https://dawasco.herokuapp.com/services/592029e6e8dd8e00048c1853"
 *           },
 *           "call": {
 *               "startedAt": "2017-05-20T11:35:02.502Z",
 *               "endedAt": "2017-05-20T11:35:02.503Z",
 *               "duration": 0.001
 *           },
 *           "reporter": {
 *               "name": "Juma John",
 *               "phone": "255765952971",
 *               "email": "scala.lally@gmail.com"
 *           },
 *           "operator": {
 *               "name": "Juma John",
 *               "phone": "255765952971",
 *               "_id": "592029e6e8dd8e00048c1856",
 *               "permissions": [],
 *               "email": "scala.lally@gmail.com",
 *               "uri": "https://dawasco.herokuapp.com/parties/592029e6e8dd8e00048c1856"
 *           },
 *           "assignee": {
 *               "name": "Joachim Mangilima",
 *               "phone": "255713111111",
 *               "_id": "592029e6e8dd8e00048c1865",
 *               "permissions": [],
 *               "email": "joachimm3@gmail.com",
 *               "uri": "https://dawasco.herokuapp.com/parties/592029e6e8dd8e00048c1865"
 *           },
 *           "code": "ILK170001",
 *           "description": "There have been a leakage at my area. Lots of water in the street",
 *           "address": "Kijitonyama",
 *           "method": "Call",
 *           "status": {
 *               "name": "Open",
 *               "weight": -5,
 *               "color": "#0D47A1",
 *               "_id": "592029e5e8dd8e00048c180d",
 *               "createdAt": "2017-05-20T11:35:01.059Z",
 *               "updatedAt": "2017-05-20T11:35:01.059Z",
 *               "uri": "https://dawasco.herokuapp.com/statuses/592029e5e8dd8e00048c180d"
 *           },
 *           "priority": {
 *               "name": "Low",
 *               "weight": 0,
 *               "color": "#1B5E29",
 *               "_id": "592029e5e8dd8e00048c1816",
 *               "createdAt": "2017-05-20T11:35:01.586Z",
 *               "updatedAt": "2017-07-29T19:12:40.178Z",
 *               "uri": "https://dawasco.herokuapp.com/priorities/592029e5e8dd8e00048c1816"
 *           },
 *           "attachments": [],
 *           "ttr": 0,
 *           "_id": "592029e6e8dd8e00048c185a",
 *           "createdAt": "2017-05-20T11:35:02.523Z",
 *           "updatedAt": "2017-05-20T11:36:34.084Z",
 *           "ttrSeconds": 0,
 *           "ttrMinutes": 0,
 *           "ttrHours": 0,
 *           "longitude": 0,
 *           "latitude": 0,
 *           "uri": "https://dawasco.herokuapp.com/servicerequests/592029e6e8dd8e00048c185a"
 *       }
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
router.get('/servicerequests', function (request, response, next) {
  controller.index(request, response, next);
});


/**
 * @api {post} /servicerequests Create a new service request
 * @apiName PostServiceRequest
 * @apiGroup ServiceRequest
 *
 * @apiHeader {String}      accept           Accept value i.e application/json
 * @apiHeader {String}      authorization    Authorization token
 * @apiHeader {String}      content-type     Sent content type i.e application/json
 *
 * @apiParam {ObjectId}       jurisdiction        A jurisdiction responsible in handling service request(issue)
 * @apiParam {ObjectId}       group       		    A service group under which request(issue) belongs to
 * @apiParam {ObjectId}       Service       		  A service under which request(issue) belongs to
 * @apiParam {Object}         Call       		      Log operator call details at a call center
 * @apiParam {ObjectId}       Reporter        		A party i.e civilian, customer etc which reported an issue(service request)
 * @apiParam {ObjectId}       Operator        		A party oversee the work on the service request(issue).It also a party that is answerable for the progress and status of the service request(issue) to a reporter. For jurisdiction that own a call center, then operator is a person who received a call.
 * @apiParam {ObjectId}       assignee            A party assigned to work on the service request(issue). It also a party that is answerable for the progress and status of the service request(issue) to operator and overall jurisdiction administrative structure.
 * @apiParam {String}         code                A unique human readable identifier of the service request(issue). It mainly used by reporter to query for status and progress of the reported issue.
 * @apiParam {String}         description         A detailed human readable explanation about the service request(issue).
 * @apiParam {String}         address             A human entered address or description of location where service request(issue) happened.
 * @apiParam {String}         method           		A communication(contact) method(mechanism) used by a reporter to report the issue.
 * @apiParam {ObjectId}       status             	A current status of the service request(issue)
 * @apiParam {ObjectId}       priority            A priority of the service request(issue).  It used to weight a service request(issue) relative  to other(s).
 * @apiParam {Array}          attachments         Associated file(s) with service request(issue)
 *
 * @apiSuccess {Object}       jurisdiction        A jurisdiction responsible in handling service request(issue)
 * @apiSuccess {Object}       group       		    A service group under which request(issue) belongs to
 * @apiSuccess {Object}       Service       		  A service under which request(issue) belongs to
 * @apiSuccess {Object}       Call       		      Log operator call details at a call center
 * @apiSuccess {Object}       Reporter        		A party i.e civilian, customer etc which reported an issue(service request)
 * @apiSuccess {Object}       Operator        		A party oversee the work on the service request(issue).It also a party that is answerable for the progress and status of the service request(issue) to a reporter. For jurisdiction that own a call center, then operator is a person who received a call.
 * @apiSuccess {Object}       assignee            A party assigned to work on the service request(issue). It also a party that is answerable for the progress and status of the service request(issue) to operator and overall jurisdiction administrative structure.
 * @apiSuccess {String}       code                A unique human readable identifier of the service request(issue). It mainly used by reporter to query for status and progress of the reported issue.
 * @apiSuccess {String}       description         A detailed human readable explanation about the service request(issue).
 * @apiSuccess {String}       address             A human entered address or description of location where service request(issue) happened.
 * @apiSuccess {String}       method           		A communication(contact) method(mechanism) used by a reporter to report the issue.
 * @apiSuccess {Object}       status             	A current status of the service request(issue)
 * @apiSuccess {Object}       priority            A priority of the service request(issue).  It used to weight a service request(issue) relative  to other(s).
 * @apiSuccess {Array}        attachments         Associated file(s) with service request(issue)
 * @apiSuccess {Duration}     ttr                 A time taken to resolve the issue(service request) in duration format.  Used to calculate Mean Time To Resolve(MTTR) KPI.  It calculated as time taken since the issue reported to the  time when issue resolved.
 * @apiSuccess {ObjectId}     _id           		  Unique ServiceRequest Id
 * @apiSuccess {Timestamp}    createdAt       	  Service request creation date
 * @apiSuccess {Timestamp}    updatedAt           Service request last updated date
 * @apiSuccess {Number}       ttrSeconds          A time taken to resolve the issue(service request) in seconds
 * @apiSuccess {Number}       ttrMinutes          A time taken to resolve the issue(service request) in minutes
 * @apiSuccess {Number}       ttrHours            A time taken to resolve the issue(service request) in hours
 * @apiSuccess {Number}       longitude           Obtain service request(issue) longitude
 * @apiSuccess {Number}       latitude            Obtain service request(issue) latitude
 * @apiSuccess {String}       uri          		    ServiceRequest URI
 * @apiSuccess {Number}       pages       		    Number of results pages
 * @apiSuccess {Number}       count       		    Number of ServiceRequest results  in the current json response
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
 *           "service": {
 *               "group": {
 *                   "code": "N",
 *                   "name": "Non Commercial",
 *                   "color": "#960F1E",
 *                   "_id": "592029e6e8dd8e00048c184d",
 *                   "uri": "https://dawasco.herokuapp.com/servicegroups/592029e6e8dd8e00048c184d"
 *               },
 *               "code": "LW",
 *               "name": "Lack of Water",
 *               "color": "#960F1E",
 *               "_id": "592029e6e8dd8e00048c1852",
 *               "uri": "https://dawasco.herokuapp.com/services/592029e6e8dd8e00048c1852"
 *           },
 *           "call": {
 *               "startedAt": "2017-05-20T11:35:02.421Z",
 *               "endedAt": "2017-05-20T11:35:02.421Z",
 *               "duration": 0
 *           },
 *           "reporter": {
 *               "name": "Juma John",
 *               "phone": "255765952971",
 *               "email": "scala.lally@gmail.com"
 *           },
 *           "operator": {
 *               "name": "Juma John",
 *               "phone": "255765952971",
 *               "_id": "592029e6e8dd8e00048c1856",
 *               "permissions": [],
 *               "email": "scala.lally@gmail.com",
 *               "uri": "https://dawasco.herokuapp.com/parties/592029e6e8dd8e00048c1856"
 *           },
 *           "assignee": {
 *               "name": "Moses Kabungo",
 *               "phone": "255753111039",
 *               "_id": "592029e6e8dd8e00048c185f",
 *               "permissions": [],
 *               "email": "kbng.moses@gmail.com",
 *               "uri": "https://dawasco.herokuapp.com/parties/592029e6e8dd8e00048c185f"
 *           },
 *           "code": "HLW170001",
 *           "description": "For three days now we dont have water",
 *           "address": "Mikocheni",
 *           "method": "Call",
 *           "status": {
 *               "name": "Open",
 *               "weight": -5,
 *               "color": "#0D47A1",
 *               "_id": "592029e5e8dd8e00048c180d",
 *               "createdAt": "2017-05-20T11:35:01.059Z",
 *               "updatedAt": "2017-05-20T11:35:01.059Z",
 *               "uri": "https://dawasco.herokuapp.com/statuses/592029e5e8dd8e00048c180d"
 *           },
 *           "priority": {
 *               "name": "Low",
 *               "weight": 0,
 *               "color": "#1B5E29",
 *               "_id": "592029e5e8dd8e00048c1816",
 *               "createdAt": "2017-05-20T11:35:01.586Z",
 *               "updatedAt": "2017-07-29T19:12:40.178Z",
 *               "uri": "https://dawasco.herokuapp.com/priorities/592029e5e8dd8e00048c1816"
 *           },
 *           "attachments": [],
 *           "ttr": 0,
 *           "_id": "592029e6e8dd8e00048c1859",
 *           "createdAt": "2017-05-20T11:35:02.474Z",
 *           "updatedAt": "2017-05-20T11:36:45.294Z",
 *           "ttrSeconds": 0,
 *           "ttrMinutes": 0,
 *           "ttrHours": 0,
 *           "longitude": 0,
 *           "latitude": 0,
 *           "uri": "https://dawasco.herokuapp.com/servicerequests/592029e6e8dd8e00048c1859"
 *     }
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
router.post('/servicerequests', function (request, response, next) {
  controller.create(request, response, next);
});


/**
 * @api {get} /servicerequests/:id Request Service Request information
 * @apiName GetServiceRequest
 * @apiGroup ServiceRequest
 *
 * @apiHeader {String}      accept         Accept value i.e application/json
 * @apiHeader {String}      authorization  Authorization token

 *
 * @apiParam {ObjectId}       id                  Unique Service Request  Id.
 *
 * @apiSuccess {Object}       jurisdiction        A jurisdiction responsible in handling service request(issue)
 * @apiSuccess {Object}       group       		    A service group under which request(issue) belongs to
 * @apiSuccess {Object}       Service       		  A service under which request(issue) belongs to
 * @apiSuccess {Object}       Call       		      Log operator call details at a call center
 * @apiSuccess {Object}       Reporter        		A party i.e civilian, customer etc which reported an issue(service request)
 * @apiSuccess {Object}       Operator        		A party oversee the work on the service request(issue).It also a party that is answerable for the progress and status of the service request(issue) to a reporter. For jurisdiction that own a call center, then operator is a person who received a call.
 * @apiSuccess {Object}       assignee            A party assigned to work on the service request(issue). It also a party that is answerable for the progress and status of the service request(issue) to operator and overall jurisdiction administrative structure.
 * @apiSuccess {String}       code                A unique human readable identifier of the service request(issue). It mainly used by reporter to query for status and progress of the reported issue.
 * @apiSuccess {String}       description         A detailed human readable explanation about the service request(issue).
 * @apiSuccess {String}       address             A human entered address or description of location where service request(issue) happened.
 * @apiSuccess {String}       method           		A communication(contact) method(mechanism) used by a reporter to report the issue.
 * @apiSuccess {Object}       status             	A current status of the service request(issue)
 * @apiSuccess {Object}       priority            A priority of the service request(issue).  It used to weight a service request(issue) relative  to other(s).
 * @apiSuccess {Array}        attachments         Associated file(s) with service request(issue)
 * @apiSuccess {Duration}     ttr                 A time taken to resolve the issue(service request) in duration format.  Used to calculate Mean Time To Resolve(MTTR) KPI.  It calculated as time taken since the issue reported to the  time when issue resolved.
 * @apiSuccess {ObjectId}     _id           		  Unique ServiceRequest Id
 * @apiSuccess {Timestamp}    createdAt       	  Service request creation date
 * @apiSuccess {Timestamp}    updatedAt           Service request last updated date
 * @apiSuccess {Number}       ttrSeconds          A time taken to resolve the issue(service request) in seconds
 * @apiSuccess {Number}       ttrMinutes          A time taken to resolve the issue(service request) in minutes
 * @apiSuccess {Number}       ttrHours            A time taken to resolve the issue(service request) in hours
 * @apiSuccess {Number}       longitude           Obtain service request(issue) longitude
 * @apiSuccess {Number}       latitude            Obtain service request(issue) latitude
 * @apiSuccess {String}       uri          		    ServiceRequest URI
 * @apiSuccess {Number}       pages       		    Number of results pages
 * @apiSuccess {Number}       count       		    Number of ServiceRequest results  in the current json response
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
 *           "service": {
 *               "group": {
 *                   "code": "N",
 *                   "name": "Non Commercial",
 *                   "color": "#960F1E",
 *                   "_id": "592029e6e8dd8e00048c184d",
 *                   "uri": "https://dawasco.herokuapp.com/servicegroups/592029e6e8dd8e00048c184d"
 *               },
 *               "code": "LW",
 *               "name": "Lack of Water",
 *               "color": "#960F1E",
 *               "_id": "592029e6e8dd8e00048c1852",
 *               "uri": "https://dawasco.herokuapp.com/services/592029e6e8dd8e00048c1852"
 *           },
 *           "call": {
 *               "startedAt": "2017-05-20T11:35:02.421Z",
 *               "endedAt": "2017-05-20T11:35:02.421Z",
 *               "duration": 0
 *           },
 *           "reporter": {
 *               "name": "Juma John",
 *               "phone": "255765952971",
 *               "email": "scala.lally@gmail.com"
 *           },
 *           "operator": {
 *               "name": "Juma John",
 *               "phone": "255765952971",
 *               "_id": "592029e6e8dd8e00048c1856",
 *               "permissions": [],
 *               "email": "scala.lally@gmail.com",
 *               "uri": "https://dawasco.herokuapp.com/parties/592029e6e8dd8e00048c1856"
 *           },
 *           "assignee": {
 *               "name": "Moses Kabungo",
 *               "phone": "255753111039",
 *               "_id": "592029e6e8dd8e00048c185f",
 *               "permissions": [],
 *               "email": "kbng.moses@gmail.com",
 *               "uri": "https://dawasco.herokuapp.com/parties/592029e6e8dd8e00048c185f"
 *           },
 *           "code": "HLW170001",
 *           "description": "For three days now we dont have water",
 *           "address": "Mikocheni",
 *           "method": "Call",
 *           "status": {
 *               "name": "Open",
 *               "weight": -5,
 *               "color": "#0D47A1",
 *               "_id": "592029e5e8dd8e00048c180d",
 *               "createdAt": "2017-05-20T11:35:01.059Z",
 *               "updatedAt": "2017-05-20T11:35:01.059Z",
 *               "uri": "https://dawasco.herokuapp.com/statuses/592029e5e8dd8e00048c180d"
 *           },
 *           "priority": {
 *               "name": "Low",
 *               "weight": 0,
 *               "color": "#1B5E29",
 *               "_id": "592029e5e8dd8e00048c1816",
 *               "createdAt": "2017-05-20T11:35:01.586Z",
 *               "updatedAt": "2017-07-29T19:12:40.178Z",
 *               "uri": "https://dawasco.herokuapp.com/priorities/592029e5e8dd8e00048c1816"
 *           },
 *           "attachments": [],
 *           "ttr": 0,
 *           "_id": "592029e6e8dd8e00048c1859",
 *           "createdAt": "2017-05-20T11:35:02.474Z",
 *           "updatedAt": "2017-05-20T11:36:45.294Z",
 *           "ttrSeconds": 0,
 *           "ttrMinutes": 0,
 *           "ttrHours": 0,
 *           "longitude": 0,
 *           "latitude": 0,
 *           "uri": "https://dawasco.herokuapp.com/servicerequests/592029e6e8dd8e00048c1859"
 *     }
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
router.get('/servicerequests/:id', function (request, response, next) {
  controller.show(request, response, next);
});


/**
 * @api {put} /servicerequests/:id Update Service Request information
 * @apiName PutServiceRequest
 * @apiGroup ServiceRequest
 *
 * @apiHeader {String}      accept           Accept value i.e application/json
 * @apiHeader {String}      authorization    Authorization token
 * @apiHeader {String}      content-type     Content type i.e application/json
 *
 * @apiParam {ObjectId}       id                    Unique Service Request Id.
 * @apiParam {ObjectId}       [jurisdiction]        A jurisdiction responsible in handling service request(issue)
 * @apiParam {ObjectId}       [group]       		    A service group under which request(issue) belongs to
 * @apiParam {ObjectId}       [service]       		  A service under which request(issue) belongs to
 * @apiParam {Object}         [call]       		      Log operator call details at a call center
 * @apiParam {ObjectId}       [reporter]        		A party i.e civilian, customer etc which reported an issue(service request)
 * @apiParam {ObjectId}       [operator]        		A party oversee the work on the service request(issue).It also a party that is answerable for the progress and status of the service request(issue) to a reporter. For jurisdiction that own a call center, then operator is a person who received a call.
 * @apiParam {ObjectId}       [assignee]            A party assigned to work on the service request(issue). It also a party that is answerable for the progress and status of the service request(issue) to operator and overall jurisdiction administrative structure.
 * @apiParam {String}         [code]                A unique human readable identifier of the service request(issue). It mainly used by reporter to query for status and progress of the reported issue.
 * @apiParam {String}         [description]         A detailed human readable explanation about the service request(issue).
 * @apiParam {String}         [address]             A human entered address or description of location where service request(issue) happened.
 * @apiParam {String}         [method]           		A communication(contact) method(mechanism) used by a reporter to report the issue.
 * @apiParam {ObjectId}       [status]             	A current status of the service request(issue)
 * @apiParam {ObjectId}       [priority]            A priority of the service request(issue).  It used to weight a service request(issue) relative  to other(s).
 * @apiParam {Array}          [attachments]         Associated file(s) with service request(issue)
 *
 * @apiSuccess {Object}       jurisdiction        A jurisdiction responsible in handling service request(issue)
 * @apiSuccess {Object}       group       		    A service group under which request(issue) belongs to
 * @apiSuccess {Object}       Service       		  A service under which request(issue) belongs to
 * @apiSuccess {Object}       Call       		      Log operator call details at a call center
 * @apiSuccess {Object}       Reporter        		A party i.e civilian, customer etc which reported an issue(service request)
 * @apiSuccess {Object}       Operator        		A party oversee the work on the service request(issue).It also a party that is answerable for the progress and status of the service request(issue) to a reporter. For jurisdiction that own a call center, then operator is a person who received a call.
 * @apiSuccess {Object}       assignee            A party assigned to work on the service request(issue). It also a party that is answerable for the progress and status of the service request(issue) to operator and overall jurisdiction administrative structure.
 * @apiSuccess {String}       code                A unique human readable identifier of the service request(issue). It mainly used by reporter to query for status and progress of the reported issue.
 * @apiSuccess {String}       description         A detailed human readable explanation about the service request(issue).
 * @apiSuccess {String}       address             A human entered address or description of location where service request(issue) happened.
 * @apiSuccess {String}       method           		A communication(contact) method(mechanism) used by a reporter to report the issue.
 * @apiSuccess {Object}       status             	A current status of the service request(issue)
 * @apiSuccess {Object}       priority            A priority of the service request(issue).  It used to weight a service request(issue) relative  to other(s).
 * @apiSuccess {Array}        attachments         Associated file(s) with service request(issue)
 * @apiSuccess {Duration}     ttr                 A time taken to resolve the issue(service request) in duration format.  Used to calculate Mean Time To Resolve(MTTR) KPI.  It calculated as time taken since the issue reported to the  time when issue resolved.
 * @apiSuccess {ObjectId}     _id           		  Unique ServiceRequest Id
 * @apiSuccess {Timestamp}    createdAt       	  Service request creation date
 * @apiSuccess {Timestamp}    updatedAt           Service request last updated date
 * @apiSuccess {Number}       ttrSeconds          A time taken to resolve the issue(service request) in seconds
 * @apiSuccess {Number}       ttrMinutes          A time taken to resolve the issue(service request) in minutes
 * @apiSuccess {Number}       ttrHours            A time taken to resolve the issue(service request) in hours
 * @apiSuccess {Number}       longitude           Obtain service request(issue) longitude
 * @apiSuccess {Number}       latitude            Obtain service request(issue) latitude
 * @apiSuccess {String}       uri          		    ServiceRequest URI
 * @apiSuccess {Number}       pages       		    Number of results pages
 * @apiSuccess {Number}       count       		    Number of ServiceRequest results  in the current json response
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
 *           "service": {
 *               "group": {
 *                   "code": "N",
 *                   "name": "Non Commercial",
 *                   "color": "#960F1E",
 *                   "_id": "592029e6e8dd8e00048c184d",
 *                   "uri": "https://dawasco.herokuapp.com/servicegroups/592029e6e8dd8e00048c184d"
 *               },
 *               "code": "LW",
 *               "name": "Lack of Water",
 *               "color": "#960F1E",
 *               "_id": "592029e6e8dd8e00048c1852",
 *               "uri": "https://dawasco.herokuapp.com/services/592029e6e8dd8e00048c1852"
 *           },
 *           "call": {
 *               "startedAt": "2017-05-20T11:35:02.421Z",
 *               "endedAt": "2017-05-20T11:35:02.421Z",
 *               "duration": 0
 *           },
 *           "reporter": {
 *               "name": "Juma John",
 *               "phone": "255765952971",
 *               "email": "scala.lally@gmail.com"
 *           },
 *           "operator": {
 *               "name": "Juma John",
 *               "phone": "255765952971",
 *               "_id": "592029e6e8dd8e00048c1856",
 *               "permissions": [],
 *               "email": "scala.lally@gmail.com",
 *               "uri": "https://dawasco.herokuapp.com/parties/592029e6e8dd8e00048c1856"
 *           },
 *           "assignee": {
 *               "name": "Moses Kabungo",
 *               "phone": "255753111039",
 *               "_id": "592029e6e8dd8e00048c185f",
 *               "permissions": [],
 *               "email": "kbng.moses@gmail.com",
 *               "uri": "https://dawasco.herokuapp.com/parties/592029e6e8dd8e00048c185f"
 *           },
 *           "code": "HLW170001",
 *           "description": "For three days now we dont have water",
 *           "address": "Mikocheni",
 *           "method": "Call",
 *           "status": {
 *               "name": "Open",
 *               "weight": -5,
 *               "color": "#0D47A1",
 *               "_id": "592029e5e8dd8e00048c180d",
 *               "createdAt": "2017-05-20T11:35:01.059Z",
 *               "updatedAt": "2017-05-20T11:35:01.059Z",
 *               "uri": "https://dawasco.herokuapp.com/statuses/592029e5e8dd8e00048c180d"
 *           },
 *           "priority": {
 *               "name": "Low",
 *               "weight": 0,
 *               "color": "#1B5E29",
 *               "_id": "592029e5e8dd8e00048c1816",
 *               "createdAt": "2017-05-20T11:35:01.586Z",
 *               "updatedAt": "2017-07-29T19:12:40.178Z",
 *               "uri": "https://dawasco.herokuapp.com/priorities/592029e5e8dd8e00048c1816"
 *           },
 *           "attachments": [],
 *           "ttr": 0,
 *           "_id": "592029e6e8dd8e00048c1859",
 *           "createdAt": "2017-05-20T11:35:02.474Z",
 *           "updatedAt": "2017-05-20T11:36:45.294Z",
 *           "ttrSeconds": 0,
 *           "ttrMinutes": 0,
 *           "ttrHours": 0,
 *           "longitude": 0,
 *           "latitude": 0,
 *           "uri": "https://dawasco.herokuapp.com/servicerequests/592029e6e8dd8e00048c1859"
 *     }
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
router.put('/servicerequests/:id', function (request, response, next) {
  controller.update(request, response, next);
});


/**
 * @api {patch} /servicerequests/:id Update Service Request information
 * @apiName PatchServiceRequest
 * @apiGroup ServiceRequest
 *
 * @apiHeader {String}      accept           Accept value i.e application/json
 * @apiHeader {String}      authorization    Authorization token
 * @apiHeader {String}      content-type     Content type i.e application/json
 *
 * @apiParam {ObjectId}       id                    Unique Service Request Id.
 * @apiParam {ObjectId}       [jurisdiction]        A jurisdiction responsible in handling service request(issue)
 * @apiParam {ObjectId}       [group]       		    A service group under which request(issue) belongs to
 * @apiParam {ObjectId}       [service]       		  A service under which request(issue) belongs to
 * @apiParam {Object}         [call]       		      Log operator call details at a call center
 * @apiParam {ObjectId}       [reporter]        		A party i.e civilian, customer etc which reported an issue(service request)
 * @apiParam {ObjectId}       [operator]        		A party oversee the work on the service request(issue).It also a party that is answerable for the progress and status of the service request(issue) to a reporter. For jurisdiction that own a call center, then operator is a person who received a call.
 * @apiParam {ObjectId}       [assignee]            A party assigned to work on the service request(issue). It also a party that is answerable for the progress and status of the service request(issue) to operator and overall jurisdiction administrative structure.
 * @apiParam {String}         [code]                A unique human readable identifier of the service request(issue). It mainly used by reporter to query for status and progress of the reported issue.
 * @apiParam {String}         [description]         A detailed human readable explanation about the service request(issue).
 * @apiParam {String}         [address]             A human entered address or description of location where service request(issue) happened.
 * @apiParam {String}         [method]           		A communication(contact) method(mechanism) used by a reporter to report the issue.
 * @apiParam {ObjectId}       [status]             	A current status of the service request(issue)
 * @apiParam {ObjectId}       [priority]            A priority of the service request(issue).  It used to weight a service request(issue) relative  to other(s).
 * @apiParam {Array}          [attachments]         Associated file(s) with service request(issue)
 *
 * @apiSuccess {Object}       jurisdiction        A jurisdiction responsible in handling service request(issue)
 * @apiSuccess {Object}       group       		    A service group under which request(issue) belongs to
 * @apiSuccess {Object}       Service       		  A service under which request(issue) belongs to
 * @apiSuccess {Object}       Call       		      Log operator call details at a call center
 * @apiSuccess {Object}       Reporter        		A party i.e civilian, customer etc which reported an issue(service request)
 * @apiSuccess {Object}       Operator        		A party oversee the work on the service request(issue).It also a party that is answerable for the progress and status of the service request(issue) to a reporter. For jurisdiction that own a call center, then operator is a person who received a call.
 * @apiSuccess {Object}       assignee            A party assigned to work on the service request(issue). It also a party that is answerable for the progress and status of the service request(issue) to operator and overall jurisdiction administrative structure.
 * @apiSuccess {String}       code                A unique human readable identifier of the service request(issue). It mainly used by reporter to query for status and progress of the reported issue.
 * @apiSuccess {String}       description         A detailed human readable explanation about the service request(issue).
 * @apiSuccess {String}       address             A human entered address or description of location where service request(issue) happened.
 * @apiSuccess {String}       method           		A communication(contact) method(mechanism) used by a reporter to report the issue.
 * @apiSuccess {Object}       status             	A current status of the service request(issue)
 * @apiSuccess {Object}       priority            A priority of the service request(issue).  It used to weight a service request(issue) relative  to other(s).
 * @apiSuccess {Array}        attachments         Associated file(s) with service request(issue)
 * @apiSuccess {Duration}     ttr                 A time taken to resolve the issue(service request) in duration format.  Used to calculate Mean Time To Resolve(MTTR) KPI.  It calculated as time taken since the issue reported to the  time when issue resolved.
 * @apiSuccess {ObjectId}     _id           		  Unique ServiceRequest Id
 * @apiSuccess {Timestamp}    createdAt       	  Service request creation date
 * @apiSuccess {Timestamp}    updatedAt           Service request last updated date
 * @apiSuccess {Number}       ttrSeconds          A time taken to resolve the issue(service request) in seconds
 * @apiSuccess {Number}       ttrMinutes          A time taken to resolve the issue(service request) in minutes
 * @apiSuccess {Number}       ttrHours            A time taken to resolve the issue(service request) in hours
 * @apiSuccess {Number}       longitude           Obtain service request(issue) longitude
 * @apiSuccess {Number}       latitude            Obtain service request(issue) latitude
 * @apiSuccess {String}       uri          		    ServiceRequest URI
 * @apiSuccess {Number}       pages       		    Number of results pages
 * @apiSuccess {Number}       count       		    Number of ServiceRequest results  in the current json response
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
 *           "service": {
 *               "group": {
 *                   "code": "N",
 *                   "name": "Non Commercial",
 *                   "color": "#960F1E",
 *                   "_id": "592029e6e8dd8e00048c184d",
 *                   "uri": "https://dawasco.herokuapp.com/servicegroups/592029e6e8dd8e00048c184d"
 *               },
 *               "code": "LW",
 *               "name": "Lack of Water",
 *               "color": "#960F1E",
 *               "_id": "592029e6e8dd8e00048c1852",
 *               "uri": "https://dawasco.herokuapp.com/services/592029e6e8dd8e00048c1852"
 *           },
 *           "call": {
 *               "startedAt": "2017-05-20T11:35:02.421Z",
 *               "endedAt": "2017-05-20T11:35:02.421Z",
 *               "duration": 0
 *           },
 *           "reporter": {
 *               "name": "Juma John",
 *               "phone": "255765952971",
 *               "email": "scala.lally@gmail.com"
 *           },
 *           "operator": {
 *               "name": "Juma John",
 *               "phone": "255765952971",
 *               "_id": "592029e6e8dd8e00048c1856",
 *               "permissions": [],
 *               "email": "scala.lally@gmail.com",
 *               "uri": "https://dawasco.herokuapp.com/parties/592029e6e8dd8e00048c1856"
 *           },
 *           "assignee": {
 *               "name": "Moses Kabungo",
 *               "phone": "255753111039",
 *               "_id": "592029e6e8dd8e00048c185f",
 *               "permissions": [],
 *               "email": "kbng.moses@gmail.com",
 *               "uri": "https://dawasco.herokuapp.com/parties/592029e6e8dd8e00048c185f"
 *           },
 *           "code": "HLW170001",
 *           "description": "For three days now we dont have water",
 *           "address": "Mikocheni",
 *           "method": "Call",
 *           "status": {
 *               "name": "Open",
 *               "weight": -5,
 *               "color": "#0D47A1",
 *               "_id": "592029e5e8dd8e00048c180d",
 *               "createdAt": "2017-05-20T11:35:01.059Z",
 *               "updatedAt": "2017-05-20T11:35:01.059Z",
 *               "uri": "https://dawasco.herokuapp.com/statuses/592029e5e8dd8e00048c180d"
 *           },
 *           "priority": {
 *               "name": "Low",
 *               "weight": 0,
 *               "color": "#1B5E29",
 *               "_id": "592029e5e8dd8e00048c1816",
 *               "createdAt": "2017-05-20T11:35:01.586Z",
 *               "updatedAt": "2017-07-29T19:12:40.178Z",
 *               "uri": "https://dawasco.herokuapp.com/priorities/592029e5e8dd8e00048c1816"
 *           },
 *           "attachments": [],
 *           "ttr": 0,
 *           "_id": "592029e6e8dd8e00048c1859",
 *           "createdAt": "2017-05-20T11:35:02.474Z",
 *           "updatedAt": "2017-05-20T11:36:45.294Z",
 *           "ttrSeconds": 0,
 *           "ttrMinutes": 0,
 *           "ttrHours": 0,
 *           "longitude": 0,
 *           "latitude": 0,
 *           "uri": "https://dawasco.herokuapp.com/servicerequests/592029e6e8dd8e00048c1859"
 *     }
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
router.patch('/servicerequests/:id', function (request, response, next) {
  controller.update(request, response, next);
});


/**
 * @api {delete} /servicerequests/:id Delete Service Request information
 * @apiName DeleteServiceRequest
 * @apiGroup ServiceRequest
 *
 * @apiHeader {String}      accept           Accept value i.e application/json
 * @apiHeader {String}      authorization    Authorization token
 *
 * @apiParam {ObjectId}       id               Unique Service Request Id.
 *
 * @apiSuccess {Object}       jurisdiction        A jurisdiction responsible in handling service request(issue)
 * @apiSuccess {Object}       group       		    A service group under which request(issue) belongs to
 * @apiSuccess {Object}       Service       		  A service under which request(issue) belongs to
 * @apiSuccess {Object}       Call       		      Log operator call details at a call center
 * @apiSuccess {Object}       Reporter        		A party i.e civilian, customer etc which reported an issue(service request)
 * @apiSuccess {Object}       Operator        		A party oversee the work on the service request(issue).It also a party that is answerable for the progress and status of the service request(issue) to a reporter. For jurisdiction that own a call center, then operator is a person who received a call.
 * @apiSuccess {Object}       assignee            A party assigned to work on the service request(issue). It also a party that is answerable for the progress and status of the service request(issue) to operator and overall jurisdiction administrative structure.
 * @apiSuccess {String}       code                A unique human readable identifier of the service request(issue). It mainly used by reporter to query for status and progress of the reported issue.
 * @apiSuccess {String}       description         A detailed human readable explanation about the service request(issue).
 * @apiSuccess {String}       address             A human entered address or description of location where service request(issue) happened.
 * @apiSuccess {String}       method           		A communication(contact) method(mechanism) used by a reporter to report the issue.
 * @apiSuccess {Object}       status             	A current status of the service request(issue)
 * @apiSuccess {Object}       priority            A priority of the service request(issue).  It used to weight a service request(issue) relative  to other(s).
 * @apiSuccess {Array}        attachments         Associated file(s) with service request(issue)
 * @apiSuccess {Duration}     ttr                 A time taken to resolve the issue(service request) in duration format.  Used to calculate Mean Time To Resolve(MTTR) KPI.  It calculated as time taken since the issue reported to the  time when issue resolved.
 * @apiSuccess {ObjectId}     _id           		  Unique ServiceRequest Id
 * @apiSuccess {Timestamp}    createdAt       	  Service request creation date
 * @apiSuccess {Timestamp}    updatedAt           Service request last updated date
 * @apiSuccess {Number}       ttrSeconds          A time taken to resolve the issue(service request) in seconds
 * @apiSuccess {Number}       ttrMinutes          A time taken to resolve the issue(service request) in minutes
 * @apiSuccess {Number}       ttrHours            A time taken to resolve the issue(service request) in hours
 * @apiSuccess {Number}       longitude           Obtain service request(issue) longitude
 * @apiSuccess {Number}       latitude            Obtain service request(issue) latitude
 * @apiSuccess {String}       uri          		    ServiceRequest URI
 * @apiSuccess {Number}       pages       		    Number of results pages
 * @apiSuccess {Number}       count       		    Number of ServiceRequest results  in the current json response
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
 *           "service": {
 *               "group": {
 *                   "code": "N",
 *                   "name": "Non Commercial",
 *                   "color": "#960F1E",
 *                   "_id": "592029e6e8dd8e00048c184d",
 *                   "uri": "https://dawasco.herokuapp.com/servicegroups/592029e6e8dd8e00048c184d"
 *               },
 *               "code": "LW",
 *               "name": "Lack of Water",
 *               "color": "#960F1E",
 *               "_id": "592029e6e8dd8e00048c1852",
 *               "uri": "https://dawasco.herokuapp.com/services/592029e6e8dd8e00048c1852"
 *           },
 *           "call": {
 *               "startedAt": "2017-05-20T11:35:02.421Z",
 *               "endedAt": "2017-05-20T11:35:02.421Z",
 *               "duration": 0
 *           },
 *           "reporter": {
 *               "name": "Juma John",
 *               "phone": "255765952971",
 *               "email": "scala.lally@gmail.com"
 *           },
 *           "operator": {
 *               "name": "Juma John",
 *               "phone": "255765952971",
 *               "_id": "592029e6e8dd8e00048c1856",
 *               "permissions": [],
 *               "email": "scala.lally@gmail.com",
 *               "uri": "https://dawasco.herokuapp.com/parties/592029e6e8dd8e00048c1856"
 *           },
 *           "assignee": {
 *               "name": "Moses Kabungo",
 *               "phone": "255753111039",
 *               "_id": "592029e6e8dd8e00048c185f",
 *               "permissions": [],
 *               "email": "kbng.moses@gmail.com",
 *               "uri": "https://dawasco.herokuapp.com/parties/592029e6e8dd8e00048c185f"
 *           },
 *           "code": "HLW170001",
 *           "description": "For three days now we dont have water",
 *           "address": "Mikocheni",
 *           "method": "Call",
 *           "status": {
 *               "name": "Open",
 *               "weight": -5,
 *               "color": "#0D47A1",
 *               "_id": "592029e5e8dd8e00048c180d",
 *               "createdAt": "2017-05-20T11:35:01.059Z",
 *               "updatedAt": "2017-05-20T11:35:01.059Z",
 *               "uri": "https://dawasco.herokuapp.com/statuses/592029e5e8dd8e00048c180d"
 *           },
 *           "priority": {
 *               "name": "Low",
 *               "weight": 0,
 *               "color": "#1B5E29",
 *               "_id": "592029e5e8dd8e00048c1816",
 *               "createdAt": "2017-05-20T11:35:01.586Z",
 *               "updatedAt": "2017-07-29T19:12:40.178Z",
 *               "uri": "https://dawasco.herokuapp.com/priorities/592029e5e8dd8e00048c1816"
 *           },
 *           "attachments": [],
 *           "ttr": 0,
 *           "_id": "592029e6e8dd8e00048c1859",
 *           "createdAt": "2017-05-20T11:35:02.474Z",
 *           "updatedAt": "2017-05-20T11:36:45.294Z",
 *           "ttrSeconds": 0,
 *           "ttrMinutes": 0,
 *           "ttrHours": 0,
 *           "longitude": 0,
 *           "latitude": 0,
 *           "uri": "https://dawasco.herokuapp.com/servicerequests/592029e6e8dd8e00048c1859"
 *     }
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
router.delete('/servicerequests/:id', function (request, response, next) {
  controller.destroy(request, response, next);
});


/**
 * exports servicerequests router
 * @type {Object}
 */
module.exports = router;
