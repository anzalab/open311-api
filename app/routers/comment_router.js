'use strict';


/**
 * @apiDefine Comment Comment
 * A record of a comment(or internal not) on a service
 * request(issue) by a party.
 */

//dependencies
const path = require('path');
const express = require('express');
const router = express.Router();
const controller =
  require(path.join(__dirname, '..', 'controllers', 'comment_controller'));

//enable token authentication
const jwtAuth = require(path.join(__dirname, '..', 'middlewares', 'jwtAuth'));

//add specific middlewares to comments router
router.all('/comments*', jwtAuth);


/**
 * @api {get} /comments Get Comments
 * @apiGroup Comment
 * @apiName GetComments
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
 * @apiSuccess {ObjectId}     request
 *        A service request which commented on
 * @apiSuccess {Object}       commentator
 *        A party whose made a comment
 * @apiSuccess {String}       content
 *        A content of a comment
 * @apiSuccess {ObjectId}     _id
 *        Unique Comment Id
 * @apiSuccess {Timestamp}    createdAt
 *        Comment creation date
 * @apiSuccess {Timestamp}    updatedAt
 *        Comment last updated date
 * @apiSuccess {String}       uri
 *        Comment URI
 * @apiSuccess {Number}       pages
 *        Number of results pages
 * @apiSuccess {Number}       count
 *        Number of Comments results  in the current json response
 *
 *
 * @apiSuccessExample {json} Success-Response:
 *  HTTP/1.1 200 OK
 * {
 *   "comments": [
 *       {
 *           "request": "592c22b07e9ff9000446e709",
 *           "commentator": {
 *               "name": "John Doe",
 *               "phone": "255765111111",
 *               "_id": "592029e6e8dd8e00048c1867",
 *               "permissions": [],
 *               "email": "johndoe@gmail.com",
 *               "uri": "https://dawasco.herokuapp.com/parties/592029e6e8dd8e00048c1867"
 *           },
 *           "content": "I've just called the ward officer",
 *           "_id": "592e8951d5ba510004b97cbf",
 *           "createdAt": "2017-05-31T09:13:53.735Z",
 *           "updatedAt": "2017-05-31T09:13:53.735Z",
 *           "uri": "https://dawasco.herokuapp.com/comments/592e8951d5ba510004b97cbf"
 *       },
 *       {
 *           "request": "595d13a7389c700004a2a081",
 *           "commentator": {
 *               "name": "John Doe",
 *               "phone": "255765111111",
 *               "_id": "592029e6e8dd8e00048c1867",
 *               "permissions": [],
 *               "email": "johndoe@gmail.com",
 *               "uri": "https://dawasco.herokuapp.com/parties/592029e6e8dd8e00048c1867"
 *           },
 *           "content": "I'm still trying to solve the problem.",
 *           "_id": "596e8dbbddd43f0004236405",
 *           "createdAt": "2017-07-18T22:37:47.040Z",
 *           "updatedAt": "2017-07-18T22:37:47.040Z",
 *           "uri": "https://dawasco.herokuapp.com/comments/596e8dbbddd43f0004236405"
 *       },
 *       {
 *           "request": "59820e3cf4ddc800047d01f6",
 *           "commentator": {
 *               "name": "John Doe",
 *               "phone": "255765111111",
 *               "_id": "592029e6e8dd8e00048c1867",
 *               "permissions": [],
 *               "email": "johndoe@gmail.com",
 *               "uri": "https://dawasco.herokuapp.com/parties/592029e6e8dd8e00048c1867"
 *           },
 *           "content": "ooiioi",
 *           "_id": "598345031cafd600040b9e72",
 *           "createdAt": "2017-08-03T15:45:07.194Z",
 *           "updatedAt": "2017-08-03T15:45:07.194Z",
 *           "uri": "https://dawasco.herokuapp.com/comments/598345031cafd600040b9e72"
 *       },
 *       {
 *           "request": "59820e3cf4ddc800047d01f6",
 *           "commentator": {
 *               "name": "John Doe",
 *               "phone": "255765111111",
 *               "_id": "592029e6e8dd8e00048c1867",
 *               "permissions": [],
 *               "email": "johndoe@gmail.com",
 *               "uri": "https://dawasco.herokuapp.com/parties/592029e6e8dd8e00048c1867"
 *           },
 *           "content": "5654",
 *           "_id": "598345081cafd600040b9e7b",
 *           "createdAt": "2017-08-03T15:45:12.372Z",
 *           "updatedAt": "2017-08-03T15:45:12.372Z",
 *           "uri": "https://dawasco.herokuapp.com/comments/598345081cafd600040b9e7b"
 *       },
 *       {
 *           "request": "59807d1ee8add60004061b5d",
 *           "commentator": {
 *               "name": "John Doe",
 *               "phone": "255765111111",
 *               "_id": "592029e6e8dd8e00048c1867",
 *               "permissions": [],
 *               "email": "johndoe@gmail.com",
 *               "uri": "https://dawasco.herokuapp.com/parties/592029e6e8dd8e00048c1867"
 *           },
 *           "content": "56465464",
 *           "_id": "598346221cafd600040b9ea2",
 *           "createdAt": "2017-08-03T15:49:54.900Z",
 *           "updatedAt": "2017-08-03T15:49:54.900Z",
 *           "uri": "https://dawasco.herokuapp.com/comments/598346221cafd600040b9ea2"
 *       },
 *       {
 *           "request": "59807d1ee8add60004061b5d",
 *           "commentator": {
 *               "name": "John Doe",
 *               "phone": "255765111111",
 *               "_id": "592029e6e8dd8e00048c1867",
 *               "permissions": [],
 *               "email": "johndoe@gmail.com",
 *               "uri": "https://dawasco.herokuapp.com/parties/592029e6e8dd8e00048c1867"
 *           },
 *           "content": "65+655656",
 *           "_id": "598346271cafd600040b9ea6",
 *           "createdAt": "2017-08-03T15:49:59.402Z",
 *           "updatedAt": "2017-08-03T15:49:59.402Z",
 *           "uri": "https://dawasco.herokuapp.com/comments/598346271cafd600040b9ea6"
 *       }
 *   ],
 *   "pages": 1,
 *   "count": 6
 * }
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
router.get('/comments', function (request, response, next) {
  controller.index(request, response, next);
});


/**
 * @api {post} /comments Create Comment
 * @apiGroup Comment
 * @apiName PostComment
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
 * @apiParam {ObjectId}       request
 *        A service request which commented on
 * @apiParam {ObjectId}       commentator
 *        A party whose made a comment
 * @apiParam {String}         content
 *        A content of a comment
 *
 * @apiSuccess {ObjectId}     request
 *        A service request which commented on
 * @apiSuccess {Object}       commentator
 *        A party whose made a comment
 * @apiSuccess {String}       content
 *        A content of a comment
 * @apiSuccess {ObjectId}     _id
 *        Unique Comment Id
 * @apiSuccess {Timestamp}    createdAt
 *        Comment creation date
 * @apiSuccess {Timestamp}    updatedAt
 *        Comment last updated date
 * @apiSuccess {String}       uri
 *        Comment URI
 * @apiSuccess {Number}       pages
 *        Number of results pages
 * @apiSuccess {Number}       count
 *        Number of Comments results  in the current json response
 *
 *
 * @apiSuccessExample {json} Success-Response:
 *  HTTP/1.1 201 Created
 *  {
 *      "request": "592c22b07e9ff9000446e709",
 *      "commentator": {
 *          "name": "John Doe",
 *          "phone": "255765111111",
 *          "_id": "592029e6e8dd8e00048c1867",
 *          "permissions": [],
 *          "email": "johndoe@gmail.com",
 *          "uri": "https://dawasco.herokuapp.com/parties/592029e6e8dd8e00048c1867"
 *      },
 *      "content": "I've just called the ward officer",
 *      "_id": "592e8951d5ba510004b97cbf",
 *      "createdAt": "2017-05-31T09:13:53.735Z",
 *      "updatedAt": "2017-05-31T09:13:53.735Z",
 *      "uri": "https://dawasco.herokuapp.com/comments/592e8951d5ba510004b97cbf"
 *  }
 *
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
router.post('/comments', function (request, response, next) {
  controller.create(request, response, next);
});


/**
 * @api {get} /comments/:id Get Comment
 * @apiGroup Comment
 * @apiName GetComment
 * @apiVersion 0.1.0
 *
 *
 * @apiHeader {String}        Accept
 *        Accept value i.e application/json
 * @apiHeader {String}        Authorization
 *        Authorization token
 *
 *
 * @apiParam {ObjectId}     id
 *        Unique Comment Id
 *
 *
 * @apiSuccess {ObjectId}     request
 *        A service request which commented on
 * @apiSuccess {Object}       commentator
 *        A party whose made a comment
 * @apiSuccess {String}       content
 *        A content of a comment
 * @apiSuccess {ObjectId}     _id
 *        Unique Comment Id
 * @apiSuccess {Timestamp}    createdAt
 *        Comment creation date
 * @apiSuccess {Timestamp}    updatedAt
 *        Comment last updated date
 * @apiSuccess {String}       uri
 *        Comment URI
 * @apiSuccess {Number}       pages
 *        Number of results pages
 * @apiSuccess {Number}       count
 *        Number of Comments results  in the current json response
 *
 *
 * @apiSuccessExample {json} Success-Response:
 *  HTTP/1.1 200 OK
 *  {
 *      "request": "592c22b07e9ff9000446e709",
 *      "commentator": {
 *          "name": "John Doe",
 *          "phone": "255765111111",
 *          "_id": "592029e6e8dd8e00048c1867",
 *          "permissions": [],
 *          "email": "johndoe@gmail.com",
 *          "uri": "https://dawasco.herokuapp.com/parties/592029e6e8dd8e00048c1867"
 *      },
 *      "content": "I've just called the ward officer",
 *      "_id": "592e8951d5ba510004b97cbf",
 *      "createdAt": "2017-05-31T09:13:53.735Z",
 *      "updatedAt": "2017-05-31T09:13:53.735Z",
 *      "uri": "https://dawasco.herokuapp.com/comments/592e8951d5ba510004b97cbf"
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
router.get('/comments/:id', function (request, response, next) {
  controller.show(request, response, next);
});


/**
 * @api {put} /comments/:id Update(PUT) Comment
 * @apiGroup Comment
 * @apiName PutComment
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
 *        Unique Comment Id
 *
 * @apiParam {ObjectId}       request
 *        A service request which commented on
 * @apiParam {ObjectId}       commentator
 *        A party whose made a comment
 * @apiParam {String}         content
 *        A content of a comment
 *
 * @apiSuccess {ObjectId}     request
 *        A service request which commented on
 * @apiSuccess {Object}       commentator
 *        A party whose made a comment
 * @apiSuccess {String}       content
 *        A content of a comment
 * @apiSuccess {ObjectId}     _id
 *        Unique Comment Id
 * @apiSuccess {Timestamp}    createdAt
 *        Comment creation date
 * @apiSuccess {Timestamp}    updatedAt
 *        Comment last updated date
 * @apiSuccess {String}       uri
 *        Comment URI
 * @apiSuccess {Number}       pages
 *        Number of results pages
 * @apiSuccess {Number}       count
 *        Number of Comments results  in the current json response
 *
 *
 * @apiSuccessExample {json} Success-Response:
 *  HTTP/1.1 200 0K
 *  {
 *      "request": "592c22b07e9ff9000446e709",
 *      "commentator": {
 *          "name": "John Doe",
 *          "phone": "255765111111",
 *          "_id": "592029e6e8dd8e00048c1867",
 *          "permissions": [],
 *          "email": "johndoe@gmail.com",
 *          "uri": "https://dawasco.herokuapp.com/parties/592029e6e8dd8e00048c1867"
 *      },
 *      "content": "I've just called the ward officer",
 *      "_id": "592e8951d5ba510004b97cbf",
 *      "createdAt": "2017-05-31T09:13:53.735Z",
 *      "updatedAt": "2017-05-31T09:13:53.735Z",
 *      "uri": "https://dawasco.herokuapp.com/comments/592e8951d5ba510004b97cbf"
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
router.put('/comments/:id', function (request, response, next) {
  controller.update(request, response, next);
});


/**
 * @api {patch} /comments/:id Update(PATCH) Comment
 * @apiGroup Comment
 * @apiName PatchComment
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
 *        Unique Comment Id
 *
 * @apiParam {ObjectId}       request
 *        A service request which commented on
 * @apiParam {ObjectId}       commentator
 *        A party whose made a comment
 * @apiParam {String}         content
 *        A content of a comment
 *
 * @apiSuccess {ObjectId}     request
 *        A service request which commented on
 * @apiSuccess {Object}       commentator
 *        A party whose made a comment
 * @apiSuccess {String}       content
 *        A content of a comment
 * @apiSuccess {ObjectId}     _id
 *        Unique Comment Id
 * @apiSuccess {Timestamp}    createdAt
 *        Comment creation date
 * @apiSuccess {Timestamp}    updatedAt
 *        Comment last updated date
 * @apiSuccess {String}       uri
 *        Comment URI
 * @apiSuccess {Number}       pages
 *        Number of results pages
 * @apiSuccess {Number}       count
 *        Number of Comments results  in the current json response
 *
 *
 * @apiSuccessExample {json} Success-Response:
 *  HTTP/1.1 200 0K
 *  {
 *      "request": "592c22b07e9ff9000446e709",
 *      "commentator": {
 *          "name": "John Doe",
 *          "phone": "255765111111",
 *          "_id": "592029e6e8dd8e00048c1867",
 *          "permissions": [],
 *          "email": "johndoe@gmail.com",
 *          "uri": "https://dawasco.herokuapp.com/parties/592029e6e8dd8e00048c1867"
 *      },
 *      "content": "I've just called the ward officer",
 *      "_id": "592e8951d5ba510004b97cbf",
 *      "createdAt": "2017-05-31T09:13:53.735Z",
 *      "updatedAt": "2017-05-31T09:13:53.735Z",
 *      "uri": "https://dawasco.herokuapp.com/comments/592e8951d5ba510004b97cbf"
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
router.patch('/comments/:id', function (request, response, next) {
  controller.update(request, response, next);
});


/**
 * @api {delete} /comments/:id Delete Comment
 * @apiGroup Comment
 * @apiName DeleteComment
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
 * @apiParam {ObjectId}       id
 *        Unique Comment Id
 *
 * @apiSuccess {ObjectId}     request
 *        A service request which commented on
 * @apiSuccess {Object}       commentator
 *        A party whose made a comment
 * @apiSuccess {String}       content
 *        A content of a comment
 * @apiSuccess {ObjectId}     _id
 *        Unique Comment Id
 * @apiSuccess {Timestamp}    createdAt
 *        Comment creation date
 * @apiSuccess {Timestamp}    updatedAt
 *        Comment last updated date
 * @apiSuccess {String}       uri
 *        Comment URI
 * @apiSuccess {Number}       pages
 *        Number of results pages
 * @apiSuccess {Number}       count
 *        Number of Comments results  in the current json response
 *
 *
 * @apiSuccessExample {json} Success-Response:
 *  HTTP/1.1 200 0K
 *  {
 *      "request": "592c22b07e9ff9000446e709",
 *      "commentator": {
 *          "name": "John Doe",
 *          "phone": "255765111111",
 *          "_id": "592029e6e8dd8e00048c1867",
 *          "permissions": [],
 *          "email": "johndoe@gmail.com",
 *          "uri": "https://dawasco.herokuapp.com/parties/592029e6e8dd8e00048c1867"
 *      },
 *      "content": "I've just called the ward officer",
 *      "_id": "592e8951d5ba510004b97cbf",
 *      "createdAt": "2017-05-31T09:13:53.735Z",
 *      "updatedAt": "2017-05-31T09:13:53.735Z",
 *      "uri": "https://dawasco.herokuapp.com/comments/592e8951d5ba510004b97cbf"
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
router.delete('/comments/:id', function (request, response, next) {
  controller.destroy(request, response, next);
});


/**
 * exports comments router
 * @type {Object}
 */
module.exports = router;
