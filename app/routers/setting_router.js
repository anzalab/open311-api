'use strict';


/**
 * @apiDefine Setting Setting
 * Manage setting(s)
 */


//dependencies
const path = require('path');
const express = require('express');
const router = express.Router();
const controller =
  require(path.join(__dirname, '..', 'controllers', 'setting_controller'));

//enable token authentication
const jwtAuth = require(path.join(__dirname, '..', 'middlewares', 'jwtAuth'));

//add specific middlewares to settings router
router.all('/settings*', jwtAuth);

/**
 * @api {get} /settings Get Settings
 * @apiGroup Setting
 * @apiName GetSettings
 * @apiVersion 0.1.0
 *
 *
 * @apiHeader {String}        Accept
 *        Accept value i.e application/json
 * @apiHeader {String}        Authorization
 *        Authorization token
 *
 *
 * @apiExample Example Usage
 * curl -i http://dawasco.herokuapp.com/settings
 *
 *
 * @apiSuccess {String}       key
 *        Unique Setting Name
 * @apiSuccess {String}       value
 *        Setting Value
 * @apiSuccess {ObjectId}     _id
 *        Unique Setting Id
 * @apiSuccess {Timestamp}    createdAt
 *        Setting creation date
 * @apiSuccess {Timestamp}    updatedAt
 *        Setting last updated date
 * @apiSuccess {String}       uri
 *        Setting URI
 * @apiSuccess {Number}       pages
 *        Number of results pages
 * @apiSuccess {Number}       count
 *        Number of Setting results  in the current json response
 *
 *
 * @apiSuccessExample {json} Success-Response:
 *    HTTP/1.1 200 OK
 *    {
 *      "settings":[
 *            {
 *                "key": "name",
 *                 "value": "Sample Company",
 *                 "_id": "592029e5e8dd8e00048c1810",
 *                 "createdAt": "2017-05-20T11:35:01.415Z",
 *                 "updatedAt": "2017-05-20T11:35:01.415Z",
 *                 "uri": "https://dawasco.herokuapp.com/settings/592029e5e8dd8e00048c1810"
 *             },
 *             {
 *                 "key": "email",
 *                 "value": "info@sample.com",
 *                 "_id": "592029e5e8dd8e00048c1811",
 *                 "createdAt": "2017-05-20T11:35:01.517Z",
 *                 "updatedAt": "2017-05-20T11:35:01.517Z",
 *                 "uri": "https://dawasco.herokuapp.com/settings/592029e5e8dd8e00048c1811"
 *             },
 *             {
 *                 "key": "phone",
 *                 "value": 255714095061,
 *                 "_id": "592029e5e8dd8e00048c1812",
 *                 "createdAt": "2017-05-20T11:35:01.528Z",
 *                 "updatedAt": "2017-05-20T11:35:01.528Z",
 *                 "uri": "https://dawasco.herokuapp.com/settings/592029e5e8dd8e00048c1812"
 *             }
 *          ],
 *      "pages": 1,
 *      "count": 3
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
 */
router.get('/settings', function (request, response, next) {
  controller.index(request, response, next);
});


/**
 * @api {post} /settings Create Setting
 * @apiGroup Setting
 * @apiName PostSetting
 * @apiVersion 0.1.0
 *
 *
 * @apiHeader {String}        Accept
 *        Accept value i.e application/json
 * @apiHeader {String}        Authorization
 *        Authorization token
 * @apiHeader {String}        Content-Type
 *        Sent content type
 *
 *
 * @apiParam {String}         key
 *        Unique Setting Name
 * @apiParam {String}         value
 *        Setting Value
 *
 *
 * @apiSuccess {String}       key
 *        Unique Setting Name
 * @apiSuccess {String}       value
 *        Setting Value
 * @apiSuccess {ObjectId}     _id
 *        Unique Setting Id
 * @apiSuccess {Timestamp}    createdAt
 *        Setting creation date
 * @apiSuccess {Timestamp}    updatedAt
 *        Setting last updated date
 * @apiSuccess {String}       uri
 *        Setting URI
 * @apiSuccess {Number}       pages
 *        Number of results pages
 * @apiSuccess {Number}       count
 *        Number of Setting results  in the current json response
 *
 *
 *
 * @apiSuccessExample {json} Success-Response:
 *    HTTP/1.1 201 Created
 *    {
 *        "key": "phone",
 *        "value": 255714095061,
 *        "_id": "592029e5e8dd8e00048c1812",
 *        "createdAt": "2017-05-20T11:35:01.528Z",
 *        "updatedAt": "2017-05-20T11:35:01.528Z",
 *        "uri": "https://dawasco.herokuapp.com/settings/592029e5e8dd8e00048c1812"
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
 */
router.post('/settings', function (request, response, next) {
  controller.create(request, response, next);
});


/**
 * @api {get} /settings/:id Get Setting
 * @apiGroup Setting
 * @apiName GetSetting
 * @apiVersion 0.1.0
 *
 *
 * @apiHeader {String}        Accept
 *        Accept value i.e application/json
 * @apiHeader {String}        Authorization
 *        Authorization token
 *
 *
 * @apiParam {ObjectId}       id
 *        Unique Setting Id
 *
 *
 * @apiSuccess {String}       key
 *        Unique Setting Name
 * @apiSuccess {String}       value
 *        Setting Value
 * @apiSuccess {ObjectId}     _id
 *        Unique Setting Id
 * @apiSuccess {Timestamp}    createdAt
 *        Setting creation date
 * @apiSuccess {Timestamp}    updatedAt
 *        Setting last updated date
 * @apiSuccess {String}       uri
 *        Setting URI
 *
 *
 *
 * @apiSuccessExample {json} Success-Response:
 *    HTTP/1.1 200 OK
 *    {
 *        "key": "phone",
 *        "value": 255714095061,
 *        "_id": "592029e5e8dd8e00048c1812",
 *        "createdAt": "2017-05-20T11:35:01.528Z",
 *        "updatedAt": "2017-05-20T11:35:01.528Z",
 *        "uri": "https://dawasco.herokuapp.com/settings/592029e5e8dd8e00048c1812"
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
 */
router.get('/settings/:id', function (request, response, next) {
  controller.show(request, response, next);
});


/**
 * @api {put} /settings/:id Update(PUT) Setting
 * @apiGroup Setting
 * @apiName PutSetting
 * @apiVersion 0.1.0
 *
 *
 * @apiHeader {String}        Accept
 *        Accept value i.e application/json
 * @apiHeader {String}        Authorization
 *        Authorization token
 * @apiHeader {String}        Content-Type
 *        Sent content type
 *
 *
 * @apiParam {ObjectId}       id
 *        Unique Setting Id
 * @apiParam {String}         [key]
 *        Unique Setting Name
 * @apiParam {String}         [value]
 *        Setting Value
 *
 *
 *
 * @apiSuccess {String}       key
 *        Unique Setting Name
 * @apiSuccess {String}       value
 *        Setting Value
 * @apiSuccess {ObjectId}     _id
 *        Unique Setting Id
 * @apiSuccess {Timestamp}    createdAt
 *        Setting creation date
 * @apiSuccess {Timestamp}    updatedAt
 *        Setting last updated date
 * @apiSuccess {String}       uri
 *        Setting URI
 *
 *
 *
 * @apiSuccessExample {json} Success-Response:
 *    HTTP/1.1 200 OK
 *    {
 *        "key": "phone",
 *        "value": 255714095061,
 *        "_id": "592029e5e8dd8e00048c1812",
 *        "createdAt": "2017-05-20T11:35:01.528Z",
 *        "updatedAt": "2017-05-20T11:35:01.528Z",
 *        "uri": "https://dawasco.herokuapp.com/settings/592029e5e8dd8e00048c1812"
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
 */
router.put('/settings/:id', function (request, response, next) {
  controller.update(request, response, next);
});


/**
 * @api {patch} /settings/:id Update(PATCH) Setting
 * @apiGroup Setting
 * @apiName PatchSetting
 * @apiVersion 0.1.0
 *
 *
 * @apiHeader {String}        Accept
 *        Accept value i.e application/json
 * @apiHeader {String}        Authorization
 *        Authorization token
 * @apiHeader {String}        Content-Type
 *        Sent content type
 *
 *
 * @apiHeader {String}        Accept
 *        Accept value i.e application/json
 * @apiHeader {String}        Authorization
 *        Authorization token
 * @apiHeader {String}        Content-Type
 *        Sent content type
 *
 *
 * @apiParam {ObjectId}       id
 *        Unique Setting Id
 * @apiParam {String}         [key]
 *        Unique Setting Name
 * @apiParam {String}         [value]
 *        Setting Value
 *
 *
 *
 * @apiSuccess {String}       key
 *        Unique Setting Name
 * @apiSuccess {String}       value
 *        Setting Value
 * @apiSuccess {ObjectId}     _id
 *        Unique Setting Id
 * @apiSuccess {Timestamp}    createdAt
 *        Setting creation date
 * @apiSuccess {Timestamp}    updatedAt
 *        Setting last updated date
 * @apiSuccess {String}       uri
 *        Setting URI
 *
 *
 *
 * @apiSuccessExample {json} Success-Response:
 *    HTTP/1.1 200 OK
 *    {
 *        "key": "phone",
 *        "value": 255714095061,
 *        "_id": "592029e5e8dd8e00048c1812",
 *        "createdAt": "2017-05-20T11:35:01.528Z",
 *        "updatedAt": "2017-05-20T11:35:01.528Z",
 *        "uri": "https://dawasco.herokuapp.com/settings/592029e5e8dd8e00048c1812"
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
 */
router.patch('/settings/:id', function (request, response, next) {
  controller.update(request, response, next);
});


/**
 * @api {delete} /settings/:id Delete Setting
 * @apiGroup Setting
 * @apiName DeleteSetting
 * @apiVersion 0.1.0
 *
 *
 * @apiHeader {String}        Accept
 *        Accept value i.e application/json
 * @apiHeader {String}        Authorization
 *        Authorization token
 *
 *
 * @apiParam {ObjectId}       id
 *        Unique Setting Id
 *
 *
 * @apiSuccess {String}       key
 *        Unique Setting Name
 * @apiSuccess {String}       value
 *        Setting Value
 * @apiSuccess {ObjectId}     _id
 *        Unique Setting Id
 * @apiSuccess {Timestamp}    createdAt
 *        Setting creation date
 * @apiSuccess {Timestamp}    updatedAt
 *        Setting last updated date
 * @apiSuccess {String}       uri
 *        Setting URI
 *
 *
 *
 * @apiSuccessExample {json} Success-Response:
 *    HTTP/1.1 200 OK
 *    {
 *        "key": "phone",
 *        "value": 255714095061,
 *        "_id": "592029e5e8dd8e00048c1812",
 *        "createdAt": "2017-05-20T11:35:01.528Z",
 *        "updatedAt": "2017-05-20T11:35:01.528Z",
 *        "uri": "https://dawasco.herokuapp.com/settings/592029e5e8dd8e00048c1812"
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
 */
router.delete('/settings/:id', function (request, response, next) {
  controller.destroy(request, response, next);
});


/**
 * exports settings router
 * @type {Object}
 */
module.exports = router;
