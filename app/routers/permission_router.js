'use strict';


/**
 * @apiDefine Permission Permission
 * Manage party(ies) permission(s)
 * Note!: permissions are dynamic generated during booting and
 * are only assignable to party(user) roles.
 */


//dependencies
const path = require('path');
const express = require('express');
const router = express.Router();
const controller =
  require(path.join(__dirname, '..', 'controllers', 'permission_controller'));

//enable token authentication
const jwtAuth = require(path.join(__dirname, '..', 'middlewares', 'jwtAuth'));

//add specific middlewares to permissions router
router.all('/permissions*', jwtAuth);


/*
 * @api {get} /permissions Get Permissions
 * @apiGroup Permission
 * @apiName GetPermissions
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
 * curl -i http://dawasco.herokuapp.com/permissions
 *
 *
 * @apiSuccess {String}       action
 *        An action permit that this permission offer e.g create,
 *        delete, update, read etc
 * @apiSuccess {String}       resource
 *        Resource constrained under this permission e.g Jurisdiction,
 *        Service etc
 * @apiSuccess {String}       description
 *        Human readable explanation about this permission
 * @apiSuccess {String}       wildcard
 *        System readable unique identifier of this permission
 *        e.g jurisdiction:create
 * @apiSuccess {ObjectId}     _id
 *        Unique Permission Id
 * @apiSuccess {Timestamp}    createdAt
 *        Permission creation date
 * @apiSuccess {Timestamp}    updatedAt
 *        Permission last updated date
 * @apiSuccess {String}       uri
 *        Permission URI
 * @apiSuccess {Array}        _assigned
 *        Obtain role permissions as a collection of role ids
 * @apiSuccess {String}       _permissions
 *        Obtain role permissions as concatenated string
 * @apiSuccess {Number}       pages
 *        Number of results pages
 * @apiSuccess {Number}       count
 *        Number of Permissions results  in the current json response
 *
 *
 *
 * @apiSuccessExample {json} Success-Response:
 *  HTTP/1.1 200 OK
 *  {
 *    "permissions": [
 *        {
 *            "action": "create",
 *            "resource": "User",
 *            "description": "Create user",
 *            "wildcard": "user:create",
 *            "_id": "592029e5e8dd8e00048c1847",
 *            "createdAt": "2017-05-20T11:35:01.959Z",
 *            "updatedAt": "2017-05-20T11:35:01.959Z",
 *            "uri": "https://dawasco.herokuapp.com/permissions/592029e5e8dd8e00048c1847"
 *        },
 *        {
 *            "action": "view",
 *            "resource": "User",
 *            "description": "View user",
 *            "wildcard": "user:view",
 *            "_id": "592029e5e8dd8e00048c1848",
 *            "createdAt": "2017-05-20T11:35:01.964Z",
 *            "updatedAt": "2017-05-20T11:35:01.964Z",
 *            "uri": "https://dawasco.herokuapp.com/permissions/592029e5e8dd8e00048c1848"
 *        },
 *        {
 *            "action": "edit",
 *            "resource": "User",
 *            "description": "Edit user",
 *            "wildcard": "user:edit",
 *            "_id": "592029e5e8dd8e00048c1849",
 *            "createdAt": "2017-05-20T11:35:01.969Z",
 *            "updatedAt": "2017-05-20T11:35:01.969Z",
 *            "uri": "https://dawasco.herokuapp.com/permissions/592029e5e8dd8e00048c1849"
 *        },
 *        {
 *            "action": "delete",
 *            "resource": "User",
 *            "description": "Delete user",
 *            "wildcard": "user:delete",
 *            "_id": "592029e5e8dd8e00048c184a",
 *            "createdAt": "2017-05-20T11:35:01.984Z",
 *            "updatedAt": "2017-05-20T11:35:01.984Z",
 *            "uri": "https://dawasco.herokuapp.com/permissions/592029e5e8dd8e00048c184a"
 *        }
 *    ],
 *    "count": 4
 *  }
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
router.get('/permissions', function (request, response, next) {
  controller.index(request, response, next);
});


/*
 * @api {post} /permissions Create Permission
 * @apiGroup Permission
 * @apiName PostPermission
 * @apiVersion 0.1.0
 * @apiDescription
 *        Permissions are dynamic generated during booting and
 *        are only assignable to party(user) roles.
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
 * @apiError  MethodNotAllowed  Method Not allowed
 *
 * @apiErrorExample   {json} Error-Response:
 *    HTTP/1.1 405 Method Not Allowed
 *    { }
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
router.post('/permissions', function (request, response, next) {
  controller.create(request, response, next);
});


/*
 * @api {get} /permissions/:id Get Permission
 * @apiGroup Permission
 * @apiName GetPermission
 * @apiVersion 0.1.0
 *
 *
 *  @apiHeader {String}        Accept
 *        Accept value i.e application/json
 * @apiHeader {String}        Authorization
 *        Authorization token
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
router.get('/permissions/:id', function (request, response, next) {
  controller.show(request, response, next);
});


/*
 * @api {put} /permissions/:id Update(PUT) Permission
 * @apiGroup Permission
 * @apiName PutPermission
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
router.put('/permissions/:id', function (request, response, next) {
  controller.update(request, response, next);
});


/*
 * @api {patch} /permissions/:id Update(PATCH) Permission
 * @apiGroup Permission
 * @apiName PatchPermission
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
router.patch('/permissions/:id', function (request, response, next) {
  controller.update(request, response, next);
});


/*
 * @api {delete} /permissions/:id Delete Permission
 * @apiGroup Permission
 * @apiName DeletePermission
 * @apiVersion 0.1.0
 * @apiDescription
 *        Deletion of Permission is not allowed
 *
 *
 * @apiHeader {String}        Accept
 *        Accept value i.e application/json
 * @apiHeader {String}        Authorization
 *        Authorization token
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
 *
 * @apiError  MethodNotAllowed  Method Not allowed
 *
 * @apiErrorExample   {json} Error-Response:
 *    HTTP/1.1 405 Method Not Allowed
 *    { }
 *
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
router.delete('/permissions/:id', function (request, response, next) {
  controller.destroy(request, response, next);
});


/**
 * exports permissions router
 * @type {Object}
 */
module.exports = router;
