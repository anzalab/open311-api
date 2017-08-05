'use strict';


/**
 * @apiDefine Jurisdiction  Jurisdiction
 *
 * An entity (e.g minicipal) responsible for addressing
 * service request(issue).
 *
 * It may be a self managed entity or division within another
 * entity(jurisdiction) in case there is hierarchy.
 */


//dependencies
const path = require('path');
const express = require('express');
const router = express.Router();
const controller =
  require(path.join(__dirname, '..', 'controllers', 'jurisdiction_controller'));

// enable token authentication
const jwtAuth = require(path.join(__dirname, '..', 'middlewares', 'jwtAuth'));

// add specific middlewares to jurisdictions router
router.all('/jurisdictions*', jwtAuth);

/**
 * @api {get} /jurisdictions Get Jurisdictions
 * @apiGroup Jurisdiction
 * @apiName GetJurisdictions
 * @apiVersion 0.1.0
 *
 * @apiHeader {String}      Accept='application/json'         Accept value i.e application/json
 * @apiHeader {String}      Authorization  Authorization token
 *
 * @apiExample Example Usage
 * curl -i http://dawasco.herokuapp.com/jurisdictions
 *
 *
 * @apiSuccess {Object}       [jurisdiction]      Top jurisdiction under which this jurisdiction derived.  This is applicable where a large jurisdiction delegates its power to its division(s). If not set the jurisdiction will be treated as a top jurisdiction and will be affected by any logics implemented  accordingly.
 * @apiSuccess {String}       code                Human readable coded name of the jurisdiction. Used in deriving service request code.
 * @apiSuccess {String}       name                Human readable name of the jurisdiction
 * @apiSuccess {String}       phone               Primary mobile phone number used to contact jurisdiction. Used when a party want to send an SMS or call the jurisdiction
 * @apiSuccess {String}       email           		Primary email address used to contact jurisdiction direct. Used when a party want to send direct mail to specific jurisdiction.
 * @apiSuccess {String}       domain             	Unique reserved domain name of the jurisdiction e.g example.go.tz. It used as jurisdiction_id in open311 api specification and whenever applicable.
 * @apiSuccess {String}       about               A brief summary about jurisdiction if available i.e additional details that clarify what a jurisdiction do.
 * @apiSuccess {String}       address             Human readable physical address of jurisdiction office. Used when a party what to physical go or visit the jurisdiction office.
 * @apiSuccess {Object}       location            Jurisdiction location coordinations
 * @apiSuccess {String}       color               A color code(in hexadecimal format) eg. #363636 used to differentiate jurisdiction visually from other service group.  If not provided it will randomly generated, but it is not guarantee its visual appeal.
 * @apiSuccess {ObjectId}     _id           		  Unique Jurisdiction Id
 * @apiSuccess {Timestamp}    createdAt       	  Jurisdiction creation date
 * @apiSuccess {Timestamp}    updatedAt           Jurisdiction last updated date
 * @apiSuccess {Number}       longitude           Jurisdiction longitude
 * @apiSuccess {Number}       latitude            Jurisdiction latitude
 * @apiSuccess {String}       uri          		    Jurisdiction URI
 * @apiSuccess {Number}       pages       		    Number of results pages
 * @apiSuccess {Number}       count       		    Number of Jurisdiction results  in the current json response
 *
 * @apiSuccessExample {json} Success-Response:
 *    HTTP/1.1 200 OK
 *    {
 *    "jurisdictions": [
 *       {
 *           "code": "H",
 *           "name": "HQ",
 *           "phone": "255714999888",
 *           "email": "N/A",
 *           "domain": "dawasco.org",
 *           "about": "Main office for Dar es salaam Water Supply Company(DAWASCO)",
 *           "address": "N/A",
 *           "location": {
 *               "type": "Point",
 *               "coordinates": [
 *                   0,
 *                   0
 *               ]
 *           },
 *           "color": "#143B7F",
 *           "_id": "592029e5e8dd8e00048c184b",
 *           "createdAt": "2017-05-20T11:35:02.007Z",
 *           "updatedAt": "2017-06-16T12:04:10.893Z",
 *           "longitude": 0,
 *           "latitude": 0,
 *           "uri": "https://dawasco.herokuapp.com/jurisdictions/592029e5e8dd8e00048c184b"
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
 *           "code": "I",
 *           "name": "Ilala",
 *           "phone": "255714999887",
 *           "email": "N/A",
 *           "domain": "ilala.dawasco.org",
 *           "about": "Ilala Area Office for Dar es salaam Water Supply Company(DAWASCO)",
 *           "address": "N/A",
 *           "location": {
 *               "type": "Point",
 *               "coordinates": [
 *                   0,
 *                   0
 *               ]
 *           },
 *           "color": "#6EDD9B",
 *           "_id": "592029e6e8dd8e00048c1850",
 *           "createdAt": "2017-05-20T11:35:02.241Z",
 *          "updatedAt": "2017-06-16T12:04:24.716Z",
 *            "longitude": 0,
 *           "latitude": 0,
 *           "uri": "https://dawasco.herokuapp.com/jurisdictions/592029e6e8dd8e00048c1850"
 *       }
 *      ],
 *      "pages": 1,
 *      "count": 2
 *   }
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
router.get('/jurisdictions', function (request, response, next) {
  controller.index(request, response, next);
});


/**
 * @api {post} /jurisdictions Create Jurisdictions
 * @apiGroup Jurisdiction
 * @apiName CreateJurisdiction
 * @apiVersion 0.1.0
 *
 * @apiHeader {String}        Accept              Accept value i.e application/json
 * @apiHeader {String}        Authorization       Authorization token
 * @apiHeader {String}        Content-Type        Sent content type
 *
 * @apiParam {ObjectId}       [jurisdiction]
 *    Top jurisdiction under which this jurisdiction derived.
 *    This is applicable where a large jurisdiction delegates its power to its division(s).
 *    If not set the jurisdiction will be treated as a top jurisdiction and will be affected by any logics implemented  accordingly.
 *
 * @apiParam {String}         code                Human readable coded name of the jurisdiction. Used in deriving service request code.
 * @apiParam {String}         name                Human readable name of the jurisdiction
 * @apiParam {String}         phone               Primary mobile phone number used to contact jurisdiction. Used when a party want to send an SMS or call the jurisdiction
 * @apiParam {String}         email           		Primary email address used to contact jurisdiction direct. Used when a party want to send direct mail to specific jurisdiction.
 * @apiParam {String}         domain             	Unique reserved domain name of the jurisdiction e.g example.go.tz. It used as jurisdiction_id in open311 api specification and whenever applicable.
 * @apiParam {String}         [about]             A brief summary about jurisdiction if available i.e additional details that clarify what a jurisdiction do.
 * @apiParam {String}         [address]           Human readable physical address of jurisdiction office. Used when a party what to physical go or visit the jurisdiction office.
 * @apiParam {Object}         [location]          Jurisdiction location coordinations
 * @apiParam {String}         [color]             A color code(in hexadecimal format) eg. #363636 used to differentiate jurisdiction visually from other service group.  If not provided it will randomly generated, but it is not guarantee its visual appeal.
 *
 *
 * @apiSuccess {Object}       [jurisdiction]      Top jurisdiction under which this jurisdiction derived.  This is applicable where a large jurisdiction delegates its power to its division(s). If not set the jurisdiction will be treated as a top jurisdiction and will be affected by any logics implemented  accordingly.
 * @apiSuccess {String}       code                Human readable coded name of the jurisdiction. Used in deriving service request code.
 * @apiSuccess {String}       name                Human readable name of the jurisdiction
 * @apiSuccess {String}       phone               Primary mobile phone number used to contact jurisdiction. Used when a party want to send an SMS or call the jurisdiction
 * @apiSuccess {String}       email           		Primary email address used to contact jurisdiction direct. Used when a party want to send direct mail to specific jurisdiction.
 * @apiSuccess {String}       domain             	Unique reserved domain name of the jurisdiction e.g example.go.tz. It used as jurisdiction_id in open311 api specification and whenever applicable.
 * @apiSuccess {String}       about               A brief summary about jurisdiction if available i.e additional details that clarify what a jurisdiction do.
 * @apiSuccess {String}       address             Human readable physical address of jurisdiction office. Used when a party what to physical go or visit the jurisdiction office.
 * @apiSuccess {Object}       location            Jurisdiction location coordinations
 * @apiSuccess {String}       color               A color code(in hexadecimal format) eg. #363636 used to differentiate jurisdiction visually from other service group.  If not provided it will randomly generated, but it is not guarantee its visual appeal.
 * @apiSuccess {ObjectId}     _id           		  Unique Jurisdiction Id
 * @apiSuccess {Timestamp}    createdAt       	  Jurisdiction creation date
 * @apiSuccess {Timestamp}    updatedAt           Jurisdiction last updated date
 * @apiSuccess {Number}       longitude           Jurisdiction longitude
 * @apiSuccess {Number}       latitude            Jurisdiction latitude
 * @apiSuccess {String}       uri          		    Jurisdiction URI
 *
 * @apiSuccessExample {json} Success-Response:
 *    HTTP/1.1 201 Created
 *    {
 *           "code": "TSM",
 *           "name": "Test",
 *           "phone": "255714999886",
 *           "email": "N/A",
 *           "domain": "test.example.org",
 *           "about": "Test Area Office for Dar es salaam Water Supply Company(DAWASCO)",
 *           "address": "N/A",
 *           "location": {
 *               "type": "Point",
 *               "coordinates": [
 *                   0,
 *                   0
 *               ]
 *           },
 *           "color": "#ECB7F7",
 *           "_id": "592029e6e8dd8e00048c1851",
 *           "createdAt": "2017-05-20T11:35:02.263Z",
 *           "updatedAt": "2017-06-16T12:04:37.645Z",
 *           "longitude": 0,
 *           "latitude": 0,
 *           "uri": "https://dawasco.herokuapp.com/jurisdictions/592029e6e8dd8e00048c1851"
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
router.post('/jurisdictions', function (request, response, next) {
  controller.create(request, response, next);
});


/**
 * @api {get} /jurisdictions/:id Get Jurisdiction
 * @apiGroup Jurisdiction
 * @apiName GetJurisdiction
 * @apiVersion 0.1.0
 *
 * @apiHeader {String}      Accept         Accept value i.e application/json
 * @apiHeader {String}      Authorization  Authorization token

 *
 * @apiParam {ObjectId}       id                  Unique jurisdiction Id.
 *
 * @apiSuccess {Object}       [jurisdiction]      Top jurisdiction under which this jurisdiction derived.  This is applicable where a large jurisdiction delegates its power to its division(s). If not set the jurisdiction will be treated as a top jurisdiction and will be affected by any logics implemented  accordingly.
 * @apiSuccess {String}       code                Human readable coded name of the jurisdiction. Used in deriving service request code.
 * @apiSuccess {String}       name                Human readable name of the jurisdiction
 * @apiSuccess {String}       phone               Primary mobile phone number used to contact jurisdiction. Used when a party want to send an SMS or call the jurisdiction
 * @apiSuccess {String}       email           		Primary email address used to contact jurisdiction direct. Used when a party want to send direct mail to specific jurisdiction.
 * @apiSuccess {String}       domain             	Unique reserved domain name of the jurisdiction e.g example.go.tz. It used as jurisdiction_id in open311 api specification and whenever applicable.
 * @apiSuccess {String}       about               A brief summary about jurisdiction if available i.e additional details that clarify what a jurisdiction do.
 * @apiSuccess {String}       address             Human readable physical address of jurisdiction office. Used when a party what to physical go or visit the jurisdiction office.
 * @apiSuccess {Object}       location            Jurisdiction location coordinations
 * @apiSuccess {String}       color               A color code(in hexadecimal format) eg. #363636 used to differentiate jurisdiction visually from other service group.  If not provided it will randomly generated, but it is not guarantee its visual appeal.
 * @apiSuccess {ObjectId}     _id           		  Unique Jurisdiction Id
 * @apiSuccess {Timestamp}    createdAt       	  Jurisdiction creation date
 * @apiSuccess {Timestamp}    updatedAt           Jurisdiction last updated date
 * @apiSuccess {Number}       longitude           Jurisdiction longitude
 * @apiSuccess {Number}       latitude            Jurisdiction latitude
 * @apiSuccess {String}       uri          		    Jurisdiction URI
 *
 * @apiSuccessExample {json} Success-Response:
 *    HTTP/1.1 200 OK
 *    {
 *           "code": "TSM",
 *           "name": "Test",
 *           "phone": "255714999886",
 *           "email": "N/A",
 *           "domain": "test.example.org",
 *           "about": "Test Area Office for Dar es salaam Water Supply Company(DAWASCO)",
 *           "address": "N/A",
 *           "location": {
 *               "type": "Point",
 *               "coordinates": [
 *                   0,
 *                   0
 *               ]
 *           },
 *           "color": "#ECB7F7",
 *           "_id": "592029e6e8dd8e00048c1851",
 *           "createdAt": "2017-05-20T11:35:02.263Z",
 *           "updatedAt": "2017-06-16T12:04:37.645Z",
 *           "longitude": 0,
 *           "latitude": 0,
 *           "uri": "https://dawasco.herokuapp.com/jurisdictions/592029e6e8dd8e00048c1851"
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
router.get('/jurisdictions/:id', function (request, response, next) {
  controller.show(request, response, next);
});


/**
 * @api {put} /jurisdictions/:id Update(PUT) Jurisdiction
 * @apiGroup Jurisdiction
 * @apiName PutJurisdiction
 * @apiVersion 0.1.0
 *
 * @apiHeader {String}        Accept              Accept value i.e application/json
 * @apiHeader {String}        Authorization       Authorization token
 * @apiHeader {String}        Content-Type        Sent content type
 *
 * @apiParam {ObjectId}       id                  Unique jurisdiction Id.
 *
 * @apiParam {ObjectId}       [jurisdiction]      Top jurisdiction under which this jurisdiction derived.  This is applicable where a large jurisdiction delegates its power to its division(s). If not set the jurisdiction will be treated as a top jurisdiction and will be affected by any logics implemented  accordingly.
 * @apiParam {String}         [code]                Human readable coded name of the jurisdiction. Used in deriving service request code.
 * @apiParam {String}         [name]                Human readable name of the jurisdiction
 * @apiParam {String}         [phone]               Primary mobile phone number used to contact jurisdiction. Used when a party want to send an SMS or call the jurisdiction
 * @apiParam {String}         [email]           		Primary email address used to contact jurisdiction direct. Used when a party want to send direct mail to specific jurisdiction.
 * @apiParam {String}         [domain]             	Unique reserved domain name of the jurisdiction e.g example.go.tz. It used as jurisdiction_id in open311 api specification and whenever applicable.
 * @apiParam {String}         [about]             A brief summary about jurisdiction if available i.e additional details that clarify what a jurisdiction do.
 * @apiParam {String}         [address]           Human readable physical address of jurisdiction office. Used when a party what to physical go or visit the jurisdiction office.
 * @apiParam {Object}         [location]          Jurisdiction location coordinations
 * @apiParam {String}         [color]             A color code(in hexadecimal format) eg. #363636 used to differentiate jurisdiction visually from other service group.  If not provided it will randomly generated, but it is not guarantee its visual appeal.
 *
 *
 * @apiSuccess {Object}       [jurisdiction]      Top jurisdiction under which this jurisdiction derived.  This is applicable where a large jurisdiction delegates its power to its division(s). If not set the jurisdiction will be treated as a top jurisdiction and will be affected by any logics implemented  accordingly.
 * @apiSuccess {String}       code                Human readable coded name of the jurisdiction. Used in deriving service request code.
 * @apiSuccess {String}       name                Human readable name of the jurisdiction
 * @apiSuccess {String}       phone               Primary mobile phone number used to contact jurisdiction. Used when a party want to send an SMS or call the jurisdiction
 * @apiSuccess {String}       email           		Primary email address used to contact jurisdiction direct. Used when a party want to send direct mail to specific jurisdiction.
 * @apiSuccess {String}       domain             	Unique reserved domain name of the jurisdiction e.g example.go.tz. It used as jurisdiction_id in open311 api specification and whenever applicable.
 * @apiSuccess {String}       about               A brief summary about jurisdiction if available i.e additional details that clarify what a jurisdiction do.
 * @apiSuccess {String}       address             Human readable physical address of jurisdiction office. Used when a party what to physical go or visit the jurisdiction office.
 * @apiSuccess {Object}       location            Jurisdiction location coordinations
 * @apiSuccess {String}       color               A color code(in hexadecimal format) eg. #363636 used to differentiate jurisdiction visually from other service group.  If not provided it will randomly generated, but it is not guarantee its visual appeal.
 * @apiSuccess {ObjectId}     _id           		  Unique Jurisdiction Id
 * @apiSuccess {Timestamp}    createdAt       	  Jurisdiction creation date
 * @apiSuccess {Timestamp}    updatedAt           Jurisdiction last updated date
 * @apiSuccess {Number}       longitude           Jurisdiction longitude
 * @apiSuccess {Number}       latitude            Jurisdiction latitude
 * @apiSuccess {String}       uri          		    Jurisdiction URI
 *
 * @apiSuccessExample {json} Success-Response:
 *    HTTP/1.1 200 OK
 *    {
 *           "code": "TSM",
 *           "name": "Test",
 *           "phone": "255714999886",
 *           "email": "N/A",
 *           "domain": "test.example.org",
 *           "about": "Test Area Office for Dar es salaam Water Supply Company(DAWASCO)",
 *           "address": "N/A",
 *           "location": {
 *               "type": "Point",
 *               "coordinates": [
 *                   0,
 *                   0
 *               ]
 *           },
 *           "color": "#ECB7F7",
 *           "_id": "592029e6e8dd8e00048c1851",
 *           "createdAt": "2017-05-20T11:35:02.263Z",
 *           "updatedAt": "2017-06-16T12:04:37.645Z",
 *           "longitude": 0,
 *           "latitude": 0,
 *           "uri": "https://dawasco.herokuapp.com/jurisdictions/592029e6e8dd8e00048c1851"
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
router.put('/jurisdictions/:id', function (request, response, next) {
  controller.update(request, response, next);
});


/**
 * @api {patch} /jurisdictions/:id Update(PATCH)  Jurisdiction
 * @apiGroup Jurisdiction
 * @apiName PatchJurisdiction
 * @apiVersion 0.1.0
 *
 * @apiHeader {String}        Accept              Accept value i.e application/json
 * @apiHeader {String}        Authorization       Authorization token
 * @apiHeader {String}        Content-Type        Sent content type
 *
 * @apiParam {ObjectId}       id                  Unique jurisdiction Id.
 *
 * @apiParam {ObjectId}       [jurisdiction]      Top jurisdiction under which this jurisdiction derived.  This is applicable where a large jurisdiction delegates its power to its division(s). If not set the jurisdiction will be treated as a top jurisdiction and will be affected by any logics implemented  accordingly.
 * @apiParam {String}         code                Human readable coded name of the jurisdiction. Used in deriving service request code.
 * @apiParam {String}         name                Human readable name of the jurisdiction
 * @apiParam {String}         phone               Primary mobile phone number used to contact jurisdiction. Used when a party want to send an SMS or call the jurisdiction
 * @apiParam {String}         email           		Primary email address used to contact jurisdiction direct. Used when a party want to send direct mail to specific jurisdiction.
 * @apiParam {String}         domain             	Unique reserved domain name of the jurisdiction e.g example.go.tz. It used as jurisdiction_id in open311 api specification and whenever applicable.
 * @apiParam {String}         [about]             A brief summary about jurisdiction if available i.e additional details that clarify what a jurisdiction do.
 * @apiParam {String}         [address]           Human readable physical address of jurisdiction office. Used when a party what to physical go or visit the jurisdiction office.
 * @apiParam {Object}         [location]          Jurisdiction location coordinations
 * @apiParam {String}         [color]             A color code(in hexadecimal format) eg. #363636 used to differentiate jurisdiction visually from other service group.  If not provided it will randomly generated, but it is not guarantee its visual appeal.
 *
 *
 * @apiSuccess {Object}       [jurisdiction]      Top jurisdiction under which this jurisdiction derived.  This is applicable where a large jurisdiction delegates its power to its division(s). If not set the jurisdiction will be treated as a top jurisdiction and will be affected by any logics implemented  accordingly.
 * @apiSuccess {String}       code                Human readable coded name of the jurisdiction. Used in deriving service request code.
 * @apiSuccess {String}       name                Human readable name of the jurisdiction
 * @apiSuccess {String}       phone               Primary mobile phone number used to contact jurisdiction. Used when a party want to send an SMS or call the jurisdiction
 * @apiSuccess {String}       email           		Primary email address used to contact jurisdiction direct. Used when a party want to send direct mail to specific jurisdiction.
 * @apiSuccess {String}       domain             	Unique reserved domain name of the jurisdiction e.g example.go.tz. It used as jurisdiction_id in open311 api specification and whenever applicable.
 * @apiSuccess {String}       about               A brief summary about jurisdiction if available i.e additional details that clarify what a jurisdiction do.
 * @apiSuccess {String}       address             Human readable physical address of jurisdiction office. Used when a party what to physical go or visit the jurisdiction office.
 * @apiSuccess {Object}       location            Jurisdiction location coordinations
 * @apiSuccess {String}       color               A color code(in hexadecimal format) eg. #363636 used to differentiate jurisdiction visually from other service group.  If not provided it will randomly generated, but it is not guarantee its visual appeal.
 * @apiSuccess {ObjectId}     _id           		  Unique Jurisdiction Id
 * @apiSuccess {Timestamp}    createdAt       	  Jurisdiction creation date
 * @apiSuccess {Timestamp}    updatedAt           Jurisdiction last updated date
 * @apiSuccess {Number}       longitude           Jurisdiction longitude
 * @apiSuccess {Number}       latitude            Jurisdiction latitude
 * @apiSuccess {String}       uri          		    Jurisdiction URI
 *
 * @apiSuccessExample {json} Success-Response:
 *    HTTP/1.1 200 OK
 *    {
 *           "code": "TSM",
 *           "name": "Test",
 *           "phone": "255714999886",
 *           "email": "N/A",
 *           "domain": "test.example.org",
 *           "about": "Test Area Office for Dar es salaam Water Supply Company(DAWASCO)",
 *           "address": "N/A",
 *           "location": {
 *               "type": "Point",
 *               "coordinates": [
 *                   0,
 *                   0
 *               ]
 *           },
 *           "color": "#ECB7F7",
 *           "_id": "592029e6e8dd8e00048c1851",
 *           "createdAt": "2017-05-20T11:35:02.263Z",
 *           "updatedAt": "2017-06-16T12:04:37.645Z",
 *           "longitude": 0,
 *           "latitude": 0,
 *           "uri": "https://dawasco.herokuapp.com/jurisdictions/592029e6e8dd8e00048c1851"
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
router.patch('/jurisdictions/:id', function (request, response, next) {
  controller.update(request, response, next);
});


/**
 * @api {delete} /jurisdictions/:id Delete Jurisdiction
 * @apiGroup Jurisdiction
 * @apiName DeleteJurisdiction
 * @apiVersion 0.1.0
 *
 * @apiHeader {String}        Accept              Accept value i.e application/json
 * @apiHeader {String}        Authorization       Authorization token
 *
 * @apiParam {ObjectId}       id                  Unique jurisdiction Id.
 *
 * @apiSuccess {Object}       [jurisdiction]      Top jurisdiction under which this jurisdiction derived.  This is applicable where a large jurisdiction delegates its power to its division(s). If not set the jurisdiction will be treated as a top jurisdiction and will be affected by any logics implemented  accordingly.
 * @apiSuccess {String}       code                Human readable coded name of the jurisdiction. Used in deriving service request code.
 * @apiSuccess {String}       name                Human readable name of the jurisdiction
 * @apiSuccess {String}       phone               Primary mobile phone number used to contact jurisdiction. Used when a party want to send an SMS or call the jurisdiction
 * @apiSuccess {String}       email           		Primary email address used to contact jurisdiction direct. Used when a party want to send direct mail to specific jurisdiction.
 * @apiSuccess {String}       domain             	Unique reserved domain name of the jurisdiction e.g example.go.tz. It used as jurisdiction_id in open311 api specification and whenever applicable.
 * @apiSuccess {String}       about               A brief summary about jurisdiction if available i.e additional details that clarify what a jurisdiction do.
 * @apiSuccess {String}       address             Human readable physical address of jurisdiction office. Used when a party what to physical go or visit the jurisdiction office.
 * @apiSuccess {Object}       location            Jurisdiction location coordinations
 * @apiSuccess {String}       color               A color code(in hexadecimal format) eg. #363636 used to differentiate jurisdiction visually from other service group.  If not provided it will randomly generated, but it is not guarantee its visual appeal.
 * @apiSuccess {ObjectId}     _id           		  Unique Jurisdiction Id
 * @apiSuccess {Timestamp}    createdAt       	  Jurisdiction creation date
 * @apiSuccess {Timestamp}    updatedAt           Jurisdiction last updated date
 * @apiSuccess {Number}       longitude           Jurisdiction longitude
 * @apiSuccess {Number}       latitude            Jurisdiction latitude
 * @apiSuccess {String}       uri          		    Jurisdiction URI
 *
 * @apiSuccessExample {json} Success-Response:
 *    HTTP/1.1 200 OK
 *    {
 *           "code": "TSM",
 *           "name": "Test",
 *           "phone": "255714999886",
 *           "email": "N/A",
 *           "domain": "test.example.org",
 *           "about": "Test Area Office for Dar es salaam Water Supply Company(DAWASCO)",
 *           "address": "N/A",
 *           "location": {
 *               "type": "Point",
 *               "coordinates": [
 *                   0,
 *                   0
 *               ]
 *           },
 *           "color": "#ECB7F7",
 *           "_id": "592029e6e8dd8e00048c1851",
 *           "createdAt": "2017-05-20T11:35:02.263Z",
 *           "updatedAt": "2017-06-16T12:04:37.645Z",
 *           "longitude": 0,
 *           "latitude": 0,
 *           "uri": "https://dawasco.herokuapp.com/jurisdictions/592029e6e8dd8e00048c1851"
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
router.delete('/jurisdictions/:id', function (request, response, next) {
  controller.destroy(request, response, next);
});


/**
 * Handle Http GET on /jurisdictions/:id/servicegroups
 * @description display a specific jurisdiction service groups
 * @param  {HttpRequest} request  a http request
 * @param  {HttpResponse} response a http response
 */
// router.get('/jurisdictions/:id/groups', function (request, response, next) {
//   controller.show(request, response, next);
// });


/**
 * Handle Http GET on /jurisdictions/:id/services
 * @description display a specific jurisdiction services
 * @param  {HttpRequest} request  a http request
 * @param  {HttpResponse} response a http response
 */
// router.get('/jurisdictions/:id/services', function (request, response, next) {
//   controller.show(request, response, next);
// });


/**
 * exports jurisdictions router
 * @type {Object}
 */
module.exports = router;
