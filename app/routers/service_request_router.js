'use strict';


/**
 * @apiDefine ServiceRequest ServiceRequest
 * An issue(or service request) reported by civilian(or customer)
 * e.g Water Leakage occur at a particular area
 */

//dependencies
const express = require('express');
const router = express.Router();
const controller = require('../controllers/service_request_controller');
const { uploaderFor } = require('@lykmapipo/file');

// enable token authentication
const jwtAuth = require('../middlewares/jwtAuth');
const jurisdiction = require('../middlewares/jurisdiction');
const preloader = require('../middlewares/preloader'); //TODO: move to ChangeLog.track

// add specific middlewares to servicerequests router
router.all('/servicerequests*', jwtAuth);


/**
 * @api {get} /servicerequests Get Service Requests
 * @apiGroup ServiceRequest
 * @apiName GetServiceRequests
 * @apiVersion 0.1.0
 *
 * @apiHeader {String}      Accept
 *        Accept value
 * @apiHeader {String}      Authorization
 *        Authorization token
 *
 * @apiExample Example Usage
 * curl -i http://dawasco.herokuapp.com/servicerequests
 *
 *
 * @apiSuccess {Object}       jurisdiction
 *        A jurisdiction responsible in handling service request(issue)
 * @apiSuccess {Object}       group
 *        A service group under which request(issue) belongs to
 * @apiSuccess {Object}       Service
 *        A service under which request(issue) belongs to
 * @apiSuccess {Object}       Call
 *        Log operator call details at a call center
 * @apiSuccess {Object}       Reporter
 *        A party i.e civilian, customer etc which reported an issue(service request)
 * @apiSuccess {Object}       Operator
 *        A party oversee the work on the service request(issue).
 *        It also a party that is answerable for the progress and status of the
 *        service request(issue) to a reporter. For jurisdiction that own a call
 *        center, then operator is a person who received a call.
 * @apiSuccess {Object}       assignee
 *        A party assigned to work on the service request(issue).
 *        It also a party that is answerable for the progress and status of
 *        the service request(issue) to operator and overall jurisdiction
 *        administrative structure.
 * @apiSuccess {String}       code
 *        A unique human readable identifier of the service request(issue).
 *        It mainly used by reporter to query for status and progress of the reported issue.
 * @apiSuccess {String}       description
 *        A detailed human readable explanation about the service request(issue).
 * @apiSuccess {String}       address
 *        A human entered address or description of location where service request(issue) happened.
 * @apiSuccess {String}       method
 *        A communication(contact) method(mechanism) used by a reporter to report the issue.
 * @apiSuccess {Object}       status
 *        A current status of the service request(issue)
 * @apiSuccess {Object}       priority
 *        A priority of the service request(issue).
 *        It used to weight a service request(issue) relative  to other(s).
 * @apiSuccess {Array}        attachments
 *        Associated file(s) with service request(issue)
 * @apiSuccess {Duration}     ttr
 *        A time taken to resolve the issue(service request) in duration format.
 *        Used to calculate Mean Time To Resolve(MTTR) KPI.
 *        It calculated as time taken since the issue reported to the  time when issue resolved.
 * @apiSuccess {ObjectId}     _id
 *        Unique ServiceRequest Id
 * @apiSuccess {Timestamp}    createdAt
 *        Service request creation date
 * @apiSuccess {Timestamp}    updatedAt
 *        Service request last updated date
 * @apiSuccess {Number}       ttrSeconds
 *        A time taken to resolve the issue(service request) in seconds
 * @apiSuccess {Number}       ttrMinutes
 *        A time taken to resolve the issue(service request) in minutes
 * @apiSuccess {Number}       ttrHours
 *        A time taken to resolve the issue(service request) in hours
 * @apiSuccess {Number}       longitude
 *        Service request(issue) longitude
 * @apiSuccess {Number}       latitude
 *        Service request(issue) latitude
 * @apiSuccess {String}       uri
 *        ServiceRequest URI
 * @apiSuccess {Number}       pages
 *        Number of results pages
 * @apiSuccess {Number}       count
 *        Number of ServiceRequest results  in the current json response
 *
 * @apiSuccessExample {json} Success-Response:
 *    HTTP/1.1 200 OK
 *    {
 *      "servicerequests": [
 *       {
 *           "jurisdiction": {
 *               "_id": "592029e5e8dd8e00048c184b",
 *               "code": "H",
 *               "name": "HQ",
 *               "phone": "255714999888",
 *           },
 *           "service": {
 *               "_id": "592029e6e8dd8e00048c1852",
 *               "code": "LW",
 *               "name": "Lack of Water",
 *               "color": "#960F1E",
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
 *               "_id": "592029e6e8dd8e00048c1856",
 *               "name": "Juma John",
 *               "phone": "255765952971",
 *               "email": "scala.lally@gmail.com",
 *           },
 *           "assignee": {
 *               "_id": "592029e6e8dd8e00048c185f",
 *               "name": "Moses Kabungo",
 *               "phone": "255753111039",
 *               "email": "kbng.moses@gmail.com",
 *           },
 *           "code": "HLW170001",
 *           "description": "For three days now we dont have water",
 *           "address": "Mikocheni",
 *           "method": "Call",
 *           "status": {
 *               "_id": "592029e5e8dd8e00048c180d",
 *               "name": "Open",
 *               "weight": -5,
 *               "color": "#0D47A1",
 *           },
 *           "priority": {
 *               "_id": "592029e5e8dd8e00048c1816",
 *               "name": "Low",
 *               "weight": 0,
 *               "color": "#1B5E29",
 *           },
 *           "_id": "592029e6e8dd8e00048c1859",
 *           "createdAt": "2017-05-20T11:35:02.474Z",
 *           "updatedAt": "2017-05-20T11:36:45.294Z",
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
router.get('/servicerequests', jurisdiction, function (request, response, next) {
  controller.index(request, response, next);
});


/**
 * @api {post} /servicerequests Create Service Request
 * @apiGroup ServiceRequest
 * @apiName PostServiceRequest
 * @apiVersion 0.1.0
 *
 * @apiHeader {String}      Accept
 *        Accept value i.e application/json
 * @apiHeader {String}      Authorization
 *        Authorization token
 * @apiHeader {String}      Content-Type
 *        Sent content type i.e application/json
 *
 * @apiParam {ObjectId}       jurisdiction
 *        A jurisdiction responsible in handling service request(issue)
 * @apiParam {ObjectId}       group
 *        A service group under which request(issue) belongs to
 * @apiParam {ObjectId}       service
 *        A service under which request(issue) belongs to
 * @apiParam {Object}         call
 *        Log operator call details at a call center
 * @apiParam {ObjectId}       reporter
 *        A party i.e civilian, customer etc which reported an issue(service request)
 * @apiParam {ObjectId}       Operator
 *        A party oversee the work on the service request(issue).It also a party
 *        that is answerable for the progress and status of the service request(issue)
 *        to a reporter. For jurisdiction that own a call center, then operator is a
 *        person who received a call.
 * @apiParam {ObjectId}       assignee
 *        A party assigned to work on the service request(issue). It also a party that
 *        is answerable for the progress and status of the service request(issue)
 *        to operator and overall jurisdiction administrative structure.
 * @apiParam {String}         code
 *        A unique human readable identifier of the service request(issue). It
 *        mainly used by reporter to query for status and progress of the reported issue.
 * @apiParam {String}         description
 *        A detailed human readable explanation about the service request(issue).
 * @apiParam {String}         address
 *        A human entered address or description of location where service
 *        request(issue) happened.
 * @apiParam {String}         method
 *        A communication(contact) method(mechanism) used by a reporter to
 *        report the issue.
 * @apiParam {ObjectId}       status
 *        A current status of the service request(issue)
 * @apiParam {ObjectId}       priority
 *        A priority of the service request(issue).  It used to weight a service
 *        request(issue) relative  to other(s).
 * @apiParam {Array}          attachments
 *        Associated file(s) with service request(issue)
 *
 *
 * @apiSuccess {Object}       jurisdiction
 *        A jurisdiction responsible in handling service request(issue)
 * @apiSuccess {Object}       group
 *        A service group under which request(issue) belongs to
 * @apiSuccess {Object}       Service
 *        A service under which request(issue) belongs to
 * @apiSuccess {Object}       Call
 *        Log operator call details at a call center
 * @apiSuccess {Object}       Reporter
 *        A party i.e civilian, customer etc which reported an issue(service request)
 * @apiSuccess {Object}       Operator
 *        A party oversee the work on the service request(issue).
 *        It also a party that is answerable for the progress and status of the
 *        service request(issue) to a reporter. For jurisdiction that own a call
 *        center, then operator is a person who received a call.
 * @apiSuccess {Object}       assignee
 *        A party assigned to work on the service request(issue).
 *        It also a party that is answerable for the progress and status of
 *        the service request(issue) to operator and overall jurisdiction
 *        administrative structure.
 * @apiSuccess {String}       code
 *        A unique human readable identifier of the service request(issue).
 *        It mainly used by reporter to query for status and progress of the reported issue.
 * @apiSuccess {String}       description
 *        A detailed human readable explanation about the service request(issue).
 * @apiSuccess {String}       address
 *        A human entered address or description of location where service request(issue) happened.
 * @apiSuccess {String}       method
 *        A communication(contact) method(mechanism) used by a reporter to report the issue.
 * @apiSuccess {Object}       status
 *        A current status of the service request(issue)
 * @apiSuccess {Object}       priority
 *        A priority of the service request(issue).
 *        It used to weight a service request(issue) relative  to other(s).
 * @apiSuccess {Array}        attachments
 *        Associated file(s) with service request(issue)
 * @apiSuccess {Duration}     ttr
 *        A time taken to resolve the issue(service request) in duration format.
 *        Used to calculate Mean Time To Resolve(MTTR) KPI.
 *        It calculated as time taken since the issue reported to the  time when issue resolved.
 * @apiSuccess {ObjectId}     _id
 *        Unique ServiceRequest Id
 * @apiSuccess {Timestamp}    createdAt
 *        Service request creation date
 * @apiSuccess {Timestamp}    updatedAt
 *        Service request last updated date
 * @apiSuccess {Number}       ttrSeconds
 *        A time taken to resolve the issue(service request) in seconds
 * @apiSuccess {Number}       ttrMinutes
 *        A time taken to resolve the issue(service request) in minutes
 * @apiSuccess {Number}       ttrHours
 *        A time taken to resolve the issue(service request) in hours
 * @apiSuccess {Number}       longitude
 *        Service request(issue) longitude
 * @apiSuccess {Number}       latitude
 *        Service request(issue) latitude
 * @apiSuccess {String}       uri
 *        ServiceRequest URI
 *
 * @apiSuccessExample {json} Success-Response:
 *    HTTP/1.1 201 Created
 *    {
 *           "_id": "592029e6e8dd8e00048c1859",
 *           "jurisdiction": {
 *               "_id": "592029e5e8dd8e00048c184b",
 *               "code": "H",
 *               "name": "HQ",
 *               "phone": "255714999888",
 *               "email": "N/A",
 *           },
 *           "service": {
 *               "_id": "592029e6e8dd8e00048c1852",
 *               "code": "LW",
 *               "name": "Lack of Water",
 *               "color": "#960F1E",
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
 *               "_id": "592029e6e8dd8e00048c1856",
 *               "name": "Juma John",
 *               "phone": "255765952971",
 *               "email": "scala.lally@gmail.com",
 *           },
 *           "assignee": {
 *               "_id": "592029e6e8dd8e00048c185f",
 *               "name": "Moses Kabungo",
 *               "phone": "255753111039",
 *               "email": "kbng.moses@gmail.com",
 *           },
 *           "code": "HLW170001",
 *           "description": "For three days now we dont have water",
 *           "address": "Mikocheni",
 *           "method": "Call",
 *           "status": {
 *               "_id": "592029e5e8dd8e00048c180d",
 *               "name": "Open",
 *               "weight": -5,
 *               "color": "#0D47A1",
 *           },
 *           "priority": {
 *               "_id": "592029e5e8dd8e00048c1816",
 *               "name": "Low",
 *               "weight": 0,
 *               "color": "#1B5E29",
 *           },
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
router.post('/servicerequests', uploaderFor(), preloader,
  function (request, response, next) {
    controller.create(request, response, next);
  });


/**
 * @api {get} /servicerequests/:id Get Service Request
 * @apiGroup ServiceRequest
 * @apiName GetServiceRequest
 * @apiVersion 0.1.0
 *
 * @apiHeader {String}      Accept
 *        Accept value i.e application/json
 * @apiHeader {String}      Authorization
 *        Authorization token

 *
 * @apiParam {ObjectId}       id                  Unique Service Request  Id.
 *
 * @apiSuccess {Object}       jurisdiction
 *        A jurisdiction responsible in handling service request(issue)
 * @apiSuccess {Object}       group
 *        A service group under which request(issue) belongs to
 * @apiSuccess {Object}       Service
 *        A service under which request(issue) belongs to
 * @apiSuccess {Object}       Call
 *        Log operator call details at a call center
 * @apiSuccess {Object}       Reporter
 *        A party i.e civilian, customer etc which reported an issue(service request)
 * @apiSuccess {Object}       Operator
 *        A party oversee the work on the service request(issue).
 *        It also a party that is answerable for the progress and status of the
 *        service request(issue) to a reporter. For jurisdiction that own a call
 *        center, then operator is a person who received a call.
 * @apiSuccess {Object}       assignee
 *        A party assigned to work on the service request(issue).
 *        It also a party that is answerable for the progress and status of
 *        the service request(issue) to operator and overall jurisdiction
 *        administrative structure.
 * @apiSuccess {String}       code
 *        A unique human readable identifier of the service request(issue).
 *        It mainly used by reporter to query for status and progress of the reported issue.
 * @apiSuccess {String}       description
 *        A detailed human readable explanation about the service request(issue).
 * @apiSuccess {String}       address
 *        A human entered address or description of location where service request(issue) happened.
 * @apiSuccess {String}       method
 *        A communication(contact) method(mechanism) used by a reporter to report the issue.
 * @apiSuccess {Object}       status
 *        A current status of the service request(issue)
 * @apiSuccess {Object}       priority
 *        A priority of the service request(issue).
 *        It used to weight a service request(issue) relative  to other(s).
 * @apiSuccess {Array}        attachments
 *        Associated file(s) with service request(issue)
 * @apiSuccess {Duration}     ttr
 *        A time taken to resolve the issue(service request) in duration format.
 *        Used to calculate Mean Time To Resolve(MTTR) KPI.
 *        It calculated as time taken since the issue reported to the  time when issue resolved.
 * @apiSuccess {ObjectId}     _id
 *        Unique ServiceRequest Id
 * @apiSuccess {Timestamp}    createdAt
 *        Service request creation date
 * @apiSuccess {Timestamp}    updatedAt
 *        Service request last updated date
 * @apiSuccess {Number}       ttrSeconds
 *        A time taken to resolve the issue(service request) in seconds
 * @apiSuccess {Number}       ttrMinutes
 *        A time taken to resolve the issue(service request) in minutes
 * @apiSuccess {Number}       ttrHours
 *        A time taken to resolve the issue(service request) in hours
 * @apiSuccess {Number}       longitude
 *        Service request(issue) longitude
 * @apiSuccess {Number}       latitude
 *        Service request(issue) latitude
 * @apiSuccess {String}       uri
 *        ServiceRequest URI
 *
 * @apiSuccessExample {json} Success-Response:
 *    HTTP/1.1 201 Created
 *    {
 *           "_id": "592029e6e8dd8e00048c1859",
 *           "jurisdiction": {
 *               "_id": "592029e5e8dd8e00048c184b",
 *               "code": "H",
 *               "name": "HQ",
 *               "phone": "255714999888",
 *               "email": "N/A",
 *           },
 *           "service": {
 *               "_id": "592029e6e8dd8e00048c1852",
 *               "code": "LW",
 *               "name": "Lack of Water",
 *               "color": "#960F1E",
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
 *               "_id": "592029e6e8dd8e00048c1856",
 *               "name": "Juma John",
 *               "phone": "255765952971",
 *               "email": "scala.lally@gmail.com",
 *           },
 *           "assignee": {
 *               "_id": "592029e6e8dd8e00048c185f",
 *               "name": "Moses Kabungo",
 *               "phone": "255753111039",
 *               "email": "kbng.moses@gmail.com",
 *           },
 *           "code": "HLW170001",
 *           "description": "For three days now we dont have water",
 *           "address": "Mikocheni",
 *           "method": "Call",
 *           "status": {
 *               "_id": "592029e5e8dd8e00048c180d",
 *               "name": "Open",
 *               "weight": -5,
 *               "color": "#0D47A1",
 *           },
 *           "priority": {
 *               "_id": "592029e5e8dd8e00048c1816",
 *               "name": "Low",
 *               "weight": 0,
 *               "color": "#1B5E29",
 *           },
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
 * @api {put} /servicerequests/:id Update(PUT) Service Request
 * @apiGroup ServiceRequest
 * @apiName PutServiceRequest
 * @apiVersion 0.1.0
 *
 * @apiHeader {String}      Accept
 *        Accept value i.e application/json
 * @apiHeader {String}      Authorization
 *        Authorization token
 * @apiHeader {String}      Content-Type
 *        Sent content type i.e application/json
 *
 * @apiParam {ObjectId}       id
 *        Unique Service Request Id.
 * @apiParam {ObjectId}       [jurisdiction]
 *        A jurisdiction responsible in handling service request(issue)
 * @apiParam {ObjectId}       [group]
 *        A service group under which request(issue) belongs to
 * @apiParam {ObjectId}       [service]
 *        A service under which request(issue) belongs to
 * @apiParam {Object}         [call]
 *        Log operator call details at a call center
 * @apiParam {ObjectId}       [reporter]
 *        A party i.e civilian, customer etc which reported an issue(service request)
 * @apiParam {ObjectId}       [operator]
 *        A party oversee the work on the service request(issue).It also a party
 *        that is answerable for the progress and status of the service request(issue)
 *        to a reporter. For jurisdiction that own a call center, then operator is a
 *        person who received a call.
 * @apiParam {ObjectId}       [assignee]
 *        A party assigned to work on the service request(issue). It also a party that
 *        is answerable for the progress and status of the service request(issue)
 *        to operator and overall jurisdiction administrative structure.
 * @apiParam {String}         [code]
 *        A unique human readable identifier of the service request(issue). It
 *        mainly used by reporter to query for status and progress of the reported issue.
 * @apiParam {String}         [description]
 *        A detailed human readable explanation about the service request(issue).
 * @apiParam {String}         [address]
 *        A human entered address or description of location where service
 *        request(issue) happened.
 * @apiParam {String}         [method]
 *        A communication(contact) method(mechanism) used by a reporter to
 *        report the issue.
 * @apiParam {ObjectId}       [status]
 *        A current status of the service request(issue)
 * @apiParam {ObjectId}       [priority]
 *        A priority of the service request(issue).  It used to weight a service
 *        request(issue) relative  to other(s).
 * @apiParam {Array}          [attachments]
 *        Associated file(s) with service request(issue)
 *
 * @apiSuccess {Object}       jurisdiction
 *        A jurisdiction responsible in handling service request(issue)
 * @apiSuccess {Object}       group
 *        A service group under which request(issue) belongs to
 * @apiSuccess {Object}       Service
 *        A service under which request(issue) belongs to
 * @apiSuccess {Object}       Call
 *        Log operator call details at a call center
 * @apiSuccess {Object}       Reporter
 *        A party i.e civilian, customer etc which reported an issue(service request)
 * @apiSuccess {Object}       Operator
 *        A party oversee the work on the service request(issue).
 *        It also a party that is answerable for the progress and status of the
 *        service request(issue) to a reporter. For jurisdiction that own a call
 *        center, then operator is a person who received a call.
 * @apiSuccess {Object}       assignee
 *        A party assigned to work on the service request(issue).
 *        It also a party that is answerable for the progress and status of
 *        the service request(issue) to operator and overall jurisdiction
 *        administrative structure.
 * @apiSuccess {String}       code
 *        A unique human readable identifier of the service request(issue).
 *        It mainly used by reporter to query for status and progress of the reported issue.
 * @apiSuccess {String}       description
 *        A detailed human readable explanation about the service request(issue).
 * @apiSuccess {String}       address
 *        A human entered address or description of location where service request(issue) happened.
 * @apiSuccess {String}       method
 *        A communication(contact) method(mechanism) used by a reporter to report the issue.
 * @apiSuccess {Object}       status
 *        A current status of the service request(issue)
 * @apiSuccess {Object}       priority
 *        A priority of the service request(issue).
 *        It used to weight a service request(issue) relative  to other(s).
 * @apiSuccess {Array}        attachments
 *        Associated file(s) with service request(issue)
 * @apiSuccess {Duration}     ttr
 *        A time taken to resolve the issue(service request) in duration format.
 *        Used to calculate Mean Time To Resolve(MTTR) KPI.
 *        It calculated as time taken since the issue reported to the  time when issue resolved.
 * @apiSuccess {ObjectId}     _id
 *        Unique ServiceRequest Id
 * @apiSuccess {Timestamp}    createdAt
 *        Service request creation date
 * @apiSuccess {Timestamp}    updatedAt
 *        Service request last updated date
 * @apiSuccess {Number}       ttrSeconds
 *        A time taken to resolve the issue(service request) in seconds
 * @apiSuccess {Number}       ttrMinutes
 *        A time taken to resolve the issue(service request) in minutes
 * @apiSuccess {Number}       ttrHours
 *        A time taken to resolve the issue(service request) in hours
 * @apiSuccess {Number}       longitude
 *        Service request(issue) longitude
 * @apiSuccess {Number}       latitude
 *        Service request(issue) latitude
 * @apiSuccess {String}       uri
 *        ServiceRequest URI
 *
 * @apiSuccessExample {json} Success-Response:
 *    HTTP/1.1 201 Created
 *    {
 *           "_id": "592029e6e8dd8e00048c1859",
 *           "jurisdiction": {
 *               "_id": "592029e5e8dd8e00048c184b",
 *               "code": "H",
 *               "name": "HQ",
 *               "phone": "255714999888",
 *               "email": "N/A",
 *           },
 *           "service": {
 *               "_id": "592029e6e8dd8e00048c1852",
 *               "code": "LW",
 *               "name": "Lack of Water",
 *               "color": "#960F1E",
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
 *               "_id": "592029e6e8dd8e00048c1856",
 *               "name": "Juma John",
 *               "phone": "255765952971",
 *               "email": "scala.lally@gmail.com",
 *           },
 *           "assignee": {
 *               "_id": "592029e6e8dd8e00048c185f",
 *               "name": "Moses Kabungo",
 *               "phone": "255753111039",
 *               "email": "kbng.moses@gmail.com",
 *           },
 *           "code": "HLW170001",
 *           "description": "For three days now we dont have water",
 *           "address": "Mikocheni",
 *           "method": "Call",
 *           "status": {
 *               "_id": "592029e5e8dd8e00048c180d",
 *               "name": "Open",
 *               "weight": -5,
 *               "color": "#0D47A1",
 *           },
 *           "priority": {
 *               "_id": "592029e5e8dd8e00048c1816",
 *               "name": "Low",
 *               "weight": 0,
 *               "color": "#1B5E29",
 *           },
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
 * @api {patch} /servicerequests/:id Update(PATCH) Service Request
 * @apiGroup ServiceRequest
 * @apiName PatchServiceRequest
 * @apiVersion 0.1.0
 *
 * @apiHeader {String}      Accept
 *        Accept value i.e application/json
 * @apiHeader {String}      Authorization
 *        Authorization token
 * @apiHeader {String}      Content-Type
 *        Sent content type i.e application/json
 *
 * @apiParam {ObjectId}       id
 *        Unique Service Request Id.
 * @apiParam {ObjectId}       [jurisdiction]
 *        A jurisdiction responsible in handling service request(issue)
 * @apiParam {ObjectId}       [group]
 *        A service group under which request(issue) belongs to
 * @apiParam {ObjectId}       [service]
 *        A service under which request(issue) belongs to
 * @apiParam {Object}         [call]
 *        Log operator call details at a call center
 * @apiParam {ObjectId}       [reporter]
 *        A party i.e civilian, customer etc which reported an issue(service request)
 * @apiParam {ObjectId}       [operator]
 *        A party oversee the work on the service request(issue).It also a party
 *        that is answerable for the progress and status of the service request(issue)
 *        to a reporter. For jurisdiction that own a call center, then operator is a
 *        person who received a call.
 * @apiParam {ObjectId}       [assignee]
 *        A party assigned to work on the service request(issue). It also a party that
 *        is answerable for the progress and status of the service request(issue)
 *        to operator and overall jurisdiction administrative structure.
 * @apiParam {String}         [code]
 *        A unique human readable identifier of the service request(issue). It
 *        mainly used by reporter to query for status and progress of the reported issue.
 * @apiParam {String}         [description]
 *        A detailed human readable explanation about the service request(issue).
 * @apiParam {String}         [address]
 *        A human entered address or description of location where service
 *        request(issue) happened.
 * @apiParam {String}         [method]
 *        A communication(contact) method(mechanism) used by a reporter to
 *        report the issue.
 * @apiParam {ObjectId}       [status]
 *        A current status of the service request(issue)
 * @apiParam {ObjectId}       [priority]
 *        A priority of the service request(issue).  It used to weight a service
 *        request(issue) relative  to other(s).
 * @apiParam {Array}          [attachments]
 *        Associated file(s) with service request(issue)
 *
 * @apiSuccess {Object}       jurisdiction
 *        A jurisdiction responsible in handling service request(issue)
 * @apiSuccess {Object}       group
 *        A service group under which request(issue) belongs to
 * @apiSuccess {Object}       Service
 *        A service under which request(issue) belongs to
 * @apiSuccess {Object}       Call
 *        Log operator call details at a call center
 * @apiSuccess {Object}       Reporter
 *        A party i.e civilian, customer etc which reported an issue(service request)
 * @apiSuccess {Object}       Operator
 *        A party oversee the work on the service request(issue).
 *        It also a party that is answerable for the progress and status of the
 *        service request(issue) to a reporter. For jurisdiction that own a call
 *        center, then operator is a person who received a call.
 * @apiSuccess {Object}       assignee
 *        A party assigned to work on the service request(issue).
 *        It also a party that is answerable for the progress and status of
 *        the service request(issue) to operator and overall jurisdiction
 *        administrative structure.
 * @apiSuccess {String}       code
 *        A unique human readable identifier of the service request(issue).
 *        It mainly used by reporter to query for status and progress of the reported issue.
 * @apiSuccess {String}       description
 *        A detailed human readable explanation about the service request(issue).
 * @apiSuccess {String}       address
 *        A human entered address or description of location where service request(issue) happened.
 * @apiSuccess {String}       method
 *        A communication(contact) method(mechanism) used by a reporter to report the issue.
 * @apiSuccess {Object}       status
 *        A current status of the service request(issue)
 * @apiSuccess {Object}       priority
 *        A priority of the service request(issue).
 *        It used to weight a service request(issue) relative  to other(s).
 * @apiSuccess {Array}        attachments
 *        Associated file(s) with service request(issue)
 * @apiSuccess {Duration}     ttr
 *        A time taken to resolve the issue(service request) in duration format.
 *        Used to calculate Mean Time To Resolve(MTTR) KPI.
 *        It calculated as time taken since the issue reported to the  time when issue resolved.
 * @apiSuccess {ObjectId}     _id
 *        Unique ServiceRequest Id
 * @apiSuccess {Timestamp}    createdAt
 *        Service request creation date
 * @apiSuccess {Timestamp}    updatedAt
 *        Service request last updated date
 * @apiSuccess {Number}       ttrSeconds
 *        A time taken to resolve the issue(service request) in seconds
 * @apiSuccess {Number}       ttrMinutes
 *        A time taken to resolve the issue(service request) in minutes
 * @apiSuccess {Number}       ttrHours
 *        A time taken to resolve the issue(service request) in hours
 * @apiSuccess {Number}       longitude
 *        Service request(issue) longitude
 * @apiSuccess {Number}       latitude
 *        Service request(issue) latitude
 * @apiSuccess {String}       uri
 *        ServiceRequest URI
 *
 * @apiSuccessExample {json} Success-Response:
 *    HTTP/1.1 201 Created
 *    {
 *           "_id": "592029e6e8dd8e00048c1859",
 *           "jurisdiction": {
 *               "_id": "592029e5e8dd8e00048c184b",
 *               "code": "H",
 *               "name": "HQ",
 *               "phone": "255714999888",
 *               "email": "N/A",
 *           },
 *           "service": {
 *               "_id": "592029e6e8dd8e00048c1852",
 *               "code": "LW",
 *               "name": "Lack of Water",
 *               "color": "#960F1E",
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
 *               "_id": "592029e6e8dd8e00048c1856",
 *               "name": "Juma John",
 *               "phone": "255765952971",
 *               "email": "scala.lally@gmail.com",
 *           },
 *           "assignee": {
 *               "_id": "592029e6e8dd8e00048c185f",
 *               "name": "Moses Kabungo",
 *               "phone": "255753111039",
 *               "email": "kbng.moses@gmail.com",
 *           },
 *           "code": "HLW170001",
 *           "description": "For three days now we dont have water",
 *           "address": "Mikocheni",
 *           "method": "Call",
 *           "status": {
 *               "_id": "592029e5e8dd8e00048c180d",
 *               "name": "Open",
 *               "weight": -5,
 *               "color": "#0D47A1",
 *           },
 *           "priority": {
 *               "_id": "592029e5e8dd8e00048c1816",
 *               "name": "Low",
 *               "weight": 0,
 *               "color": "#1B5E29",
 *           },
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
 * @api {delete} /servicerequests/:id Delete Service Request
 * @apiGroup ServiceRequest
 * @apiName DeleteServiceRequest
 * @apiVersion 0.1.0
 *
 * @apiHeader {String}      Accept
 *        Accept value i.e application/json
 * @apiHeader {String}      Authorization
 *        Authorization token
 *
 * @apiParam {ObjectId}       id
 *        Unique Service Request Id.
 *
 * @apiSuccess {Object}       jurisdiction
 *        A jurisdiction responsible in handling service request(issue)
 * @apiSuccess {Object}       group
 *        A service group under which request(issue) belongs to
 * @apiSuccess {Object}       Service
 *        A service under which request(issue) belongs to
 * @apiSuccess {Object}       Call
 *        Log operator call details at a call center
 * @apiSuccess {Object}       Reporter
 *        A party i.e civilian, customer etc which reported an issue(service request)
 * @apiSuccess {Object}       Operator
 *        A party oversee the work on the service request(issue).
 *        It also a party that is answerable for the progress and status of the
 *        service request(issue) to a reporter. For jurisdiction that own a call
 *        center, then operator is a person who received a call.
 * @apiSuccess {Object}       assignee
 *        A party assigned to work on the service request(issue).
 *        It also a party that is answerable for the progress and status of
 *        the service request(issue) to operator and overall jurisdiction
 *        administrative structure.
 * @apiSuccess {String}       code
 *        A unique human readable identifier of the service request(issue).
 *        It mainly used by reporter to query for status and progress of the reported issue.
 * @apiSuccess {String}       description
 *        A detailed human readable explanation about the service request(issue).
 * @apiSuccess {String}       address
 *        A human entered address or description of location where service request(issue) happened.
 * @apiSuccess {String}       method
 *        A communication(contact) method(mechanism) used by a reporter to report the issue.
 * @apiSuccess {Object}       status
 *        A current status of the service request(issue)
 * @apiSuccess {Object}       priority
 *        A priority of the service request(issue).
 *        It used to weight a service request(issue) relative  to other(s).
 * @apiSuccess {Array}        attachments
 *        Associated file(s) with service request(issue)
 * @apiSuccess {Duration}     ttr
 *        A time taken to resolve the issue(service request) in duration format.
 *        Used to calculate Mean Time To Resolve(MTTR) KPI.
 *        It calculated as time taken since the issue reported to the  time when issue resolved.
 * @apiSuccess {ObjectId}     _id
 *        Unique ServiceRequest Id
 * @apiSuccess {Timestamp}    createdAt
 *        Service request creation date
 * @apiSuccess {Timestamp}    updatedAt
 *        Service request last updated date
 * @apiSuccess {Number}       ttrSeconds
 *        A time taken to resolve the issue(service request) in seconds
 * @apiSuccess {Number}       ttrMinutes
 *        A time taken to resolve the issue(service request) in minutes
 * @apiSuccess {Number}       ttrHours
 *        A time taken to resolve the issue(service request) in hours
 * @apiSuccess {Number}       longitude
 *        Service request(issue) longitude
 * @apiSuccess {Number}       latitude
 *        Service request(issue) latitude
 * @apiSuccess {String}       uri
 *        ServiceRequest URI
 *
 * @apiSuccessExample {json} Success-Response:
 *    HTTP/1.1 201 Created
 *    {
 *           "_id": "592029e6e8dd8e00048c1859",
 *           "jurisdiction": {
 *               "_id": "592029e5e8dd8e00048c184b",
 *               "code": "H",
 *               "name": "HQ",
 *               "phone": "255714999888",
 *               "email": "N/A",
 *           },
 *           "service": {
 *               "_id": "592029e6e8dd8e00048c1852",
 *               "code": "LW",
 *               "name": "Lack of Water",
 *               "color": "#960F1E",
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
 *               "_id": "592029e6e8dd8e00048c1856",
 *               "name": "Juma John",
 *               "phone": "255765952971",
 *               "email": "scala.lally@gmail.com",
 *           },
 *           "assignee": {
 *               "_id": "592029e6e8dd8e00048c185f",
 *               "name": "Moses Kabungo",
 *               "phone": "255753111039",
 *               "email": "kbng.moses@gmail.com",
 *           },
 *           "code": "HLW170001",
 *           "description": "For three days now we dont have water",
 *           "address": "Mikocheni",
 *           "method": "Call",
 *           "status": {
 *               "_id": "592029e5e8dd8e00048c180d",
 *               "name": "Open",
 *               "weight": -5,
 *               "color": "#0D47A1",
 *           },
 *           "priority": {
 *               "_id": "592029e5e8dd8e00048c1816",
 *               "name": "Low",
 *               "weight": 0,
 *               "color": "#1B5E29",
 *           },
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


/*
 * @api {patch} /servicerequests/:id/changelogs Get ServiceRequest ChangeLogs
 * @apiGroup ServiceRequest
 * @apiName PatchServiceRequestChangeLogs
 * @apiVersion 0.1.0
 *
 *
 * @apiHeader {String}        Accept
 *        Accept value i.e application/json
 * @apiHeader {String}        Authorization
 *        Authorization token
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
 */
router.patch('/servicerequests/:id/changelogs', uploaderFor(), preloader,
  function (request, response, next) {
    controller.changelogs(request, response, next);
  });

router.put('/servicerequests/:id/changelogs', uploaderFor(), preloader,
  function (request, response, next) {
    controller.changelogs(request, response, next);
  });

router.post('/servicerequests/:id/changelogs', uploaderFor(), preloader,
  function (request, response, next) {
    controller.changelogs(request, response, next);
  });


/**
 * exports servicerequests router
 * @type {Object}
 */
module.exports = router;
