'use strict';


/**
 * @apiDefine Role Role
 * Manage parties role(s).
 * It is a collection of permission(s) that are applicable to
 * to a specific party(ies).
 */


//dependencies
const path = require('path');
const express = require('express');
const router = express.Router();
const controller =
  require(path.join(__dirname, '..', 'controllers', 'role_controller'));

//enable token authentication
const jwtAuth = require(path.join(__dirname, '..', 'middlewares', 'jwtAuth'));

//add specific middlewares to roles router
router.all('/roles*', jwtAuth);

/*
 * @api {get} /roles Get Roles
 * @apiGroup Role
 * @apiName GetRoles
 * @apiVersion 0.1.0
 *
 *
 * @apiHeader {String}        Accept
 *        Accept value i.e application/json
 * @apiHeader {String}        Authorization
 *        Authorization token
 *
 *
 *
 * @apiExample Example Usage
 * curl -i http://dawasco.herokuapp.com/roles
 *
 *
 *
 * @apiSuccess {String}       name
 *        Human readable name given to this role
 * @apiSuccess {String}       description
 *        Human readable additional explanation about this role
 * @apiSuccess {Array}        permissions
 *        Permissions that constitute this role
 * @apiSuccess {ObjectId}     _id
 *        Unique Role Id
 * @apiSuccess {Timestamp}    createdAt
 *        Role creation date
 * @apiSuccess {Timestamp}    updatedAt
 *        Role last updated date
 * @apiSuccess {String}       uri
 *        Role URI
 * @apiSuccess {Array}        _assigned
 *        Obtain role permissions as a collection of role ids
 * @apiSuccess {String}       _permissions
 *        Obtain role permissions as concatenated string
 * @apiSuccess {Number}       pages
 *        Number of results pages
 * @apiSuccess {Number}       count
 *        Number of Roles results  in the current json response
 *
 *
 * @apiSuccessExample {json} Success-Response:
 *    HTTP/1.1 200 OK
 *  {
 *      "roles": [
 *          {
 *              "name": "Administrator",
 *              "description": "Administrator",
 *              "permissions": [
 *                  {
 *                      "resource": "Jurisdiction",
 *                      "description": "Delete jurisdiction",
 *                      "wildcard": "jurisdiction:delete",
 *                      "_id": "592029e5e8dd8e00048c1826",
 *                      "uri": "https://dawasco.herokuapp.com/permissions/592029e5e8dd8e00048c1826"
 *                  }
 *              ],
 *              "_id": "592029e6e8dd8e00048c184f",
 *              "createdAt": "2017-05-20T11:35:02.219Z",
 *              "updatedAt": "2017-05-20T11:35:02.219Z",
 *              "uri": "https://dawasco.herokuapp.com/roles/592029e6e8dd8e00048c184f"
 *          }
 *      ],
 *      "pages": 1,
 *      "count": 1
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
 */
router.get('/roles', function (request, response, next) {
  controller.index(request, response, next);
});


/*
 * @api {post} /roles Create Role
 * @apiGroup Role
 * @apiName PostRole
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
 * @apiParam {String}       name
 *        Human readable name given to this role
 * @apiParam {String}       description
 *        Human readable additional explanation about this role
 * @apiParam {Array}        permissions
 *        Permissions that constitute this role
 *
 *
 *
 * @apiSuccess {String}       name
 *        Human readable name given to this role
 * @apiSuccess {String}       description
 *        Human readable additional explanation about this role
 * @apiSuccess {Array}        permissions
 *        Permissions that constitute this role
 * @apiSuccess {ObjectId}     _id
 *        Unique Role Id
 * @apiSuccess {Timestamp}    createdAt
 *        Role creation date
 * @apiSuccess {Timestamp}    updatedAt
 *        Role last updated date
 * @apiSuccess {String}       uri
 *        Role URI
 * @apiSuccess {Array}        _assigned
 *        Obtain role permissions as a collection of role ids
 * @apiSuccess {String}       _permissions
 *        Obtain role permissions as concatenated string
 * @apiSuccess {Number}       pages
 *        Number of results pages
 * @apiSuccess {Number}       count
 *        Number of Role results  in the current json response
 *
 *
 *
 * @apiSuccessExample {json} Success-Response:
 *    HTTP/1.1 201 Created
 *  {
 *      "name": "Example",
 *      "description": "Example Role",
 *      "permissions": [
 *          {
 *              "resource": "Counter",
 *              "description": "Edit counter",
 *              "wildcard": "counter:edit",
 *              "_id": "592029e5e8dd8e00048c1821",
 *              "uri": "https://dawasco.herokuapp.com/permissions/592029e5e8dd8e00048c1821"
 *          }
 *      ],
 *      "_id": "592029e6e8dd8e00048c184f",
 *      "createdAt": "2017-05-20T11:35:02.219Z",
 *      "updatedAt": "2017-05-20T11:35:02.219Z",
 *      "uri": "https://dawasco.herokuapp.com/roles/592029e6e8dd8e00048c184f"
 *  }
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
router.post('/roles', function (request, response, next) {
  controller.create(request, response, next);
});


/*
 * @api {get} /roles/:id Get Role
 * @apiGroup Role
 * @apiName GetRole
 * @apiVersion 0.1.0
 *
 *
 * @apiHeader {String}        Accept
 *        Accept value i.e application/json
 * @apiHeader {String}        Authorization
 *        Authorization token
 *
 * @apiParam {ObjectId}       id
 *        Unique Role id
 *
 *
 * @apiSuccess {String}       name
 *        Human readable name given to this role
 * @apiSuccess {String}       description
 *        Human readable additional explanation about this role
 * @apiSuccess {Array}        permissions
 *        Permissions that constitute this role
 * @apiSuccess {ObjectId}     _id
 *        Unique Role Id
 * @apiSuccess {Timestamp}    createdAt
 *        Role creation date
 * @apiSuccess {Timestamp}    updatedAt
 *        Role last updated date
 * @apiSuccess {String}       uri
 *        Role URI
 * @apiSuccess {Array}        _assigned
 *        Obtain role permissions as a collection of role ids
 * @apiSuccess {String}       _permissions
 *        Obtain role permissions as concatenated string
 * @apiSuccess {Number}       pages
 *        Number of results pages
 * @apiSuccess {Number}       count
 *        Number of Role results  in the current json response
 *
 *
 *
 * @apiSuccessExample {json} Success-Response:
 *    HTTP/1.1 200 OK
 *  {
 *      "name": "Example",
 *      "description": "Example Role",
 *      "permissions": [
 *          {
 *              "resource": "Counter",
 *              "description": "Edit counter",
 *              "wildcard": "counter:edit",
 *              "_id": "592029e5e8dd8e00048c1821",
 *              "uri": "https://dawasco.herokuapp.com/permissions/592029e5e8dd8e00048c1821"
 *          }
 *      ],
 *      "_id": "592029e6e8dd8e00048c184f",
 *      "createdAt": "2017-05-20T11:35:02.219Z",
 *      "updatedAt": "2017-05-20T11:35:02.219Z",
 *      "uri": "https://dawasco.herokuapp.com/roles/592029e6e8dd8e00048c184f"
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
 */
router.get('/roles/:id', function (request, response, next) {
  controller.show(request, response, next);
});


/*
 * @api {put} /roles/:id Update(PUT) Role
 * @apiGroup Role
 * @apiName PutRole
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
 *        Unique Role id
 * @apiParam {String}         name
 *        Human readable name given to this role
 * @apiParam {String}         description
 *        Human readable additional explanation about this role
 * @apiParam {Array}          permissions
 *        Permissions that constitute this role
 *
 *
 * @apiSuccess {String}       name
 *        Human readable name given to this role
 * @apiSuccess {String}       description
 *        Human readable additional explanation about this role
 * @apiSuccess {Array}        permissions
 *        Permissions that constitute this role
 * @apiSuccess {ObjectId}     _id
 *        Unique Role Id
 * @apiSuccess {Timestamp}    createdAt
 *        Role creation date
 * @apiSuccess {Timestamp}    updatedAt
 *        Role last updated date
 * @apiSuccess {String}       uri
 *        Role URI
 * @apiSuccess {Array}        _assigned
 *        Obtain role permissions as a collection of role ids
 * @apiSuccess {String}       _permissions
 *        Obtain role permissions as concatenated string
 * @apiSuccess {Number}       pages
 *        Number of results pages
 * @apiSuccess {Number}       count
 *        Number of Role results  in the current json response
 *
 *
 *
 * @apiSuccessExample {json} Success-Response:
 *    HTTP/1.1 200 OK
 *  {
 *      "name": "Example",
 *      "description": "Example Role",
 *      "permissions": [
 *          {
 *              "resource": "Counter",
 *              "description": "Edit counter",
 *              "wildcard": "counter:edit",
 *              "_id": "592029e5e8dd8e00048c1821",
 *              "uri": "https://dawasco.herokuapp.com/permissions/592029e5e8dd8e00048c1821"
 *          }
 *      ],
 *      "_id": "592029e6e8dd8e00048c184f",
 *      "createdAt": "2017-05-20T11:35:02.219Z",
 *      "updatedAt": "2017-05-20T11:35:02.219Z",
 *      "uri": "https://dawasco.herokuapp.com/roles/592029e6e8dd8e00048c184f"
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
 */
router.put('/roles/:id', function (request, response, next) {
  controller.update(request, response, next);
});


/*
 * @api {patch} /roles/:id Update(PATCH) Role
 * @apiGroup Role
 * @apiName PatchRole
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
 *
 * @apiParam {ObjectId}       id
 *        Unique Role id
 * @apiParam {String}         name
 *        Human readable name given to this role
 * @apiParam {String}         description
 *        Human readable additional explanation about this role
 * @apiParam {Array}          permissions
 *        Permissions that constitute this role
 *
 *
 * @apiSuccess {String}       name
 *        Human readable name given to this role
 * @apiSuccess {String}       description
 *        Human readable additional explanation about this role
 * @apiSuccess {Array}        permissions
 *        Permissions that constitute this role
 * @apiSuccess {ObjectId}     _id
 *        Unique Role Id
 * @apiSuccess {Timestamp}    createdAt
 *        Role creation date
 * @apiSuccess {Timestamp}    updatedAt
 *        Role last updated date
 * @apiSuccess {String}       uri
 *        Role URI
 * @apiSuccess {Array}        _assigned
 *        Obtain role permissions as a collection of role ids
 * @apiSuccess {String}       _permissions
 *        Obtain role permissions as concatenated string
 * @apiSuccess {Number}       pages
 *        Number of results pages
 * @apiSuccess {Number}       count
 *        Number of Role results  in the current json response
 *
 *
 *
 * @apiSuccessExample {json} Success-Response:
 *    HTTP/1.1 200 OK
 *  {
 *      "name": "Example",
 *      "description": "Example Role",
 *      "permissions": [
 *          {
 *              "resource": "Counter",
 *              "description": "Edit counter",
 *              "wildcard": "counter:edit",
 *              "_id": "592029e5e8dd8e00048c1821",
 *              "uri": "https://dawasco.herokuapp.com/permissions/592029e5e8dd8e00048c1821"
 *          }
 *      ],
 *      "_id": "592029e6e8dd8e00048c184f",
 *      "createdAt": "2017-05-20T11:35:02.219Z",
 *      "updatedAt": "2017-05-20T11:35:02.219Z",
 *      "uri": "https://dawasco.herokuapp.com/roles/592029e6e8dd8e00048c184f"
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
 */
router.patch('/roles/:id', function (request, response, next) {
  controller.update(request, response, next);
});


/*
 * @api {delete} /roles/:id Delete Role
 * @apiGroup Role
 * @apiName DeleteRole
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
 *        Unique Role id
 *
 *
 *
 * @apiSuccess {String}       name
 *        Human readable name given to this role
 * @apiSuccess {String}       description
 *        Human readable additional explanation about this role
 * @apiSuccess {Array}        permissions
 *        Permissions that constitute this role
 * @apiSuccess {ObjectId}     _id
 *        Unique Role Id
 * @apiSuccess {Timestamp}    createdAt
 *        Role creation date
 * @apiSuccess {Timestamp}    updatedAt
 *        Role last updated date
 * @apiSuccess {String}       uri
 *        Role URI
 * @apiSuccess {Array}        _assigned
 *        Obtain role permissions as a collection of role ids
 * @apiSuccess {String}       _permissions
 *        Obtain role permissions as concatenated string
 * @apiSuccess {Number}       pages
 *        Number of results pages
 * @apiSuccess {Number}       count
 *        Number of Role results  in the current json response
 *
 *
 *
 * @apiSuccessExample {json} Success-Response:
 *    HTTP/1.1 200 OK
 *  {
 *      "name": "Example",
 *      "description": "Example Role",
 *      "permissions": [
 *          {
 *              "resource": "Counter",
 *              "description": "Edit counter",
 *              "wildcard": "counter:edit",
 *              "_id": "592029e5e8dd8e00048c1821",
 *              "uri": "https://dawasco.herokuapp.com/permissions/592029e5e8dd8e00048c1821"
 *          }
 *      ],
 *      "_id": "592029e6e8dd8e00048c184f",
 *      "createdAt": "2017-05-20T11:35:02.219Z",
 *      "updatedAt": "2017-05-20T11:35:02.219Z",
 *      "uri": "https://dawasco.herokuapp.com/roles/592029e6e8dd8e00048c184f"
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
 */
router.delete('/roles/:id', function (request, response, next) {
  controller.destroy(request, response, next);
});


/**
 * exports roles router
 * @type {Object}
 */
module.exports = router;
