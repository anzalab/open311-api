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
 *                      "resource": "Comment",
 *                      "description": "Create comment",
 *                      "wildcard": "comment:create",
 *                      "_id": "592029e5e8dd8e00048c181b",
 *                      "uri": "https://dawasco.herokuapp.com/permissions/592029e5e8dd8e00048c181b"
 *                  },
 *                  {
 *                      "resource": "Comment",
 *                      "description": "View comment",
 *                      "wildcard": "comment:view",
 *                      "_id": "592029e5e8dd8e00048c181c",
 *                      "uri": "https://dawasco.herokuapp.com/permissions/592029e5e8dd8e00048c181c"
 *                  },
 *                  {
 *                      "resource": "Comment",
 *                      "description": "Edit comment",
 *                      "wildcard": "comment:edit",
 *                      "_id": "592029e5e8dd8e00048c181d",
 *                      "uri": "https://dawasco.herokuapp.com/permissions/592029e5e8dd8e00048c181d"
 *                  },
 *                  {
 *                      "resource": "Comment",
 *                      "description": "Delete comment",
 *                      "wildcard": "comment:delete",
 *                      "_id": "592029e5e8dd8e00048c181e",
 *                      "uri": "https://dawasco.herokuapp.com/permissions/592029e5e8dd8e00048c181e"
 *                  },
 *                  {
 *                      "resource": "Counter",
 *                      "description": "Create counter",
 *                      "wildcard": "counter:create",
 *                      "_id": "592029e5e8dd8e00048c181f",
 *                      "uri": "https://dawasco.herokuapp.com/permissions/592029e5e8dd8e00048c181f"
 *                  },
 *                  {
 *                      "resource": "Counter",
 *                      "description": "View counter",
 *                      "wildcard": "counter:view",
 *                      "_id": "592029e5e8dd8e00048c1820",
 *                      "uri": "https://dawasco.herokuapp.com/permissions/592029e5e8dd8e00048c1820"
 *                  },
 *                  {
 *                      "resource": "Counter",
 *                      "description": "Edit counter",
 *                      "wildcard": "counter:edit",
 *                      "_id": "592029e5e8dd8e00048c1821",
 *                      "uri": "https://dawasco.herokuapp.com/permissions/592029e5e8dd8e00048c1821"
 *                  },
 *                  {
 *                      "resource": "Counter",
 *                      "description": "Delete counter",
 *                      "wildcard": "counter:delete",
 *                      "_id": "592029e5e8dd8e00048c1822",
 *                      "uri": "https://dawasco.herokuapp.com/permissions/592029e5e8dd8e00048c1822"
 *                  },
 *                  {
 *                      "resource": "Jurisdiction",
 *                      "description": "Create jurisdiction",
 *                      "wildcard": "jurisdiction:create",
 *                      "_id": "592029e5e8dd8e00048c1823",
 *                      "uri": "https://dawasco.herokuapp.com/permissions/592029e5e8dd8e00048c1823"
 *                  },
 *                  {
 *                      "resource": "Jurisdiction",
 *                      "description": "View jurisdiction",
 *                      "wildcard": "jurisdiction:view",
 *                      "_id": "592029e5e8dd8e00048c1824",
 *                      "uri": "https://dawasco.herokuapp.com/permissions/592029e5e8dd8e00048c1824"
 *                  },
 *                  {
 *                      "resource": "Jurisdiction",
 *                      "description": "Edit jurisdiction",
 *                      "wildcard": "jurisdiction:edit",
 *                      "_id": "592029e5e8dd8e00048c1825",
 *                      "uri": "https://dawasco.herokuapp.com/permissions/592029e5e8dd8e00048c1825"
 *                  },
 *                  {
 *                      "resource": "Jurisdiction",
 *                      "description": "Delete jurisdiction",
 *                      "wildcard": "jurisdiction:delete",
 *                      "_id": "592029e5e8dd8e00048c1826",
 *                      "uri": "https://dawasco.herokuapp.com/permissions/592029e5e8dd8e00048c1826"
 *                  },
 *                  {
 *                      "resource": "Permission",
 *                      "description": "Create permission",
 *                      "wildcard": "permission:create",
 *                      "_id": "592029e5e8dd8e00048c1827",
 *                      "uri": "https://dawasco.herokuapp.com/permissions/592029e5e8dd8e00048c1827"
 *                  },
 *                  {
 *                      "resource": "Permission",
 *                      "description": "View permission",
 *                      "wildcard": "permission:view",
 *                      "_id": "592029e5e8dd8e00048c1828",
 *                      "uri": "https://dawasco.herokuapp.com/permissions/592029e5e8dd8e00048c1828"
 *                  },
 *                  {
 *                      "resource": "Permission",
 *                      "description": "Edit permission",
 *                      "wildcard": "permission:edit",
 *                      "_id": "592029e5e8dd8e00048c1829",
 *                      "uri": "https://dawasco.herokuapp.com/permissions/592029e5e8dd8e00048c1829"
 *                  },
 *                  {
 *                      "resource": "Permission",
 *                      "description": "Delete permission",
 *                      "wildcard": "permission:delete",
 *                      "_id": "592029e5e8dd8e00048c182a",
 *                      "uri": "https://dawasco.herokuapp.com/permissions/592029e5e8dd8e00048c182a"
 *                  },
 *                  {
 *                      "resource": "Priority",
 *                      "description": "Create priority",
 *                      "wildcard": "priority:create",
 *                      "_id": "592029e5e8dd8e00048c182b",
 *                      "uri": "https://dawasco.herokuapp.com/permissions/592029e5e8dd8e00048c182b"
 *                  },
 *                  {
 *                      "resource": "Priority",
 *                      "description": "View priority",
 *                      "wildcard": "priority:view",
 *                      "_id": "592029e5e8dd8e00048c182c",
 *                      "uri": "https://dawasco.herokuapp.com/permissions/592029e5e8dd8e00048c182c"
 *                  },
 *                  {
 *                      "resource": "Priority",
 *                      "description": "Edit priority",
 *                      "wildcard": "priority:edit",
 *                      "_id": "592029e5e8dd8e00048c182d",
 *                      "uri": "https://dawasco.herokuapp.com/permissions/592029e5e8dd8e00048c182d"
 *                  },
 *                  {
 *                      "resource": "Priority",
 *                      "description": "Delete priority",
 *                      "wildcard": "priority:delete",
 *                      "_id": "592029e5e8dd8e00048c182e",
 *                      "uri": "https://dawasco.herokuapp.com/permissions/592029e5e8dd8e00048c182e"
 *                  },
 *                  {
 *                      "resource": "Role",
 *                      "description": "Create role",
 *                      "wildcard": "role:create",
 *                      "_id": "592029e5e8dd8e00048c182f",
 *                      "uri": "https://dawasco.herokuapp.com/permissions/592029e5e8dd8e00048c182f"
 *                  },
 *                  {
 *                      "resource": "Role",
 *                      "description": "View role",
 *                      "wildcard": "role:view",
 *                      "_id": "592029e5e8dd8e00048c1830",
 *                      "uri": "https://dawasco.herokuapp.com/permissions/592029e5e8dd8e00048c1830"
 *                  },
 *                  {
 *                      "resource": "Role",
 *                      "description": "Edit role",
 *                      "wildcard": "role:edit",
 *                      "_id": "592029e5e8dd8e00048c1831",
 *                      "uri": "https://dawasco.herokuapp.com/permissions/592029e5e8dd8e00048c1831"
 *                  },
 *                  {
 *                      "resource": "Role",
 *                      "description": "Delete role",
 *                      "wildcard": "role:delete",
 *                      "_id": "592029e5e8dd8e00048c1832",
 *                      "uri": "https://dawasco.herokuapp.com/permissions/592029e5e8dd8e00048c1832"
 *                  },
 *                  {
 *                      "resource": "ServiceGroup",
 *                      "description": "Create servicegroup",
 *                      "wildcard": "servicegroup:create",
 *                      "_id": "592029e5e8dd8e00048c1833",
 *                      "uri": "https://dawasco.herokuapp.com/permissions/592029e5e8dd8e00048c1833"
 *                  },
 *                  {
 *                      "resource": "ServiceGroup",
 *                      "description": "View servicegroup",
 *                      "wildcard": "servicegroup:view",
 *                      "_id": "592029e5e8dd8e00048c1834",
 *                      "uri": "https://dawasco.herokuapp.com/permissions/592029e5e8dd8e00048c1834"
 *                  },
 *                  {
 *                      "resource": "ServiceGroup",
 *                      "description": "Edit servicegroup",
 *                      "wildcard": "servicegroup:edit",
 *                      "_id": "592029e5e8dd8e00048c1835",
 *                      "uri": "https://dawasco.herokuapp.com/permissions/592029e5e8dd8e00048c1835"
 *                  },
 *                  {
 *                      "resource": "ServiceGroup",
 *                      "description": "Delete servicegroup",
 *                      "wildcard": "servicegroup:delete",
 *                      "_id": "592029e5e8dd8e00048c1836",
 *                      "uri": "https://dawasco.herokuapp.com/permissions/592029e5e8dd8e00048c1836"
 *                  },
 *                  {
 *                      "resource": "Service",
 *                      "description": "Create service",
 *                      "wildcard": "service:create",
 *                      "_id": "592029e5e8dd8e00048c1837",
 *                      "uri": "https://dawasco.herokuapp.com/permissions/592029e5e8dd8e00048c1837"
 *                  },
 *                  {
 *                      "resource": "Service",
 *                      "description": "View service",
 *                      "wildcard": "service:view",
 *                      "_id": "592029e5e8dd8e00048c1838",
 *                      "uri": "https://dawasco.herokuapp.com/permissions/592029e5e8dd8e00048c1838"
 *                  },
 *                  {
 *                      "resource": "Service",
 *                      "description": "Edit service",
 *                      "wildcard": "service:edit",
 *                      "_id": "592029e5e8dd8e00048c1839",
 *                      "uri": "https://dawasco.herokuapp.com/permissions/592029e5e8dd8e00048c1839"
 *                  },
 *                  {
 *                      "resource": "Service",
 *                      "description": "Delete service",
 *                      "wildcard": "service:delete",
 *                      "_id": "592029e5e8dd8e00048c183a",
 *                      "uri": "https://dawasco.herokuapp.com/permissions/592029e5e8dd8e00048c183a"
 *                  },
 *                  {
 *                      "resource": "ServiceRequest",
 *                      "description": "Create servicerequest",
 *                      "wildcard": "servicerequest:create",
 *                      "_id": "592029e5e8dd8e00048c183b",
 *                      "uri": "https://dawasco.herokuapp.com/permissions/592029e5e8dd8e00048c183b"
 *                  },
 *                  {
 *                      "resource": "ServiceRequest",
 *                      "description": "View servicerequest",
 *                      "wildcard": "servicerequest:view",
 *                      "_id": "592029e5e8dd8e00048c183c",
 *                      "uri": "https://dawasco.herokuapp.com/permissions/592029e5e8dd8e00048c183c"
 *                  },
 *                  {
 *                      "resource": "ServiceRequest",
 *                      "description": "Edit servicerequest",
 *                      "wildcard": "servicerequest:edit",
 *                      "_id": "592029e5e8dd8e00048c183d",
 *                      "uri": "https://dawasco.herokuapp.com/permissions/592029e5e8dd8e00048c183d"
 *                  },
 *                  {
 *                      "resource": "ServiceRequest",
 *                      "description": "Delete servicerequest",
 *                      "wildcard": "servicerequest:delete",
 *                      "_id": "592029e5e8dd8e00048c183e",
 *                      "uri": "https://dawasco.herokuapp.com/permissions/592029e5e8dd8e00048c183e"
 *                  },
 *                  {
 *                      "resource": "Setting",
 *                      "description": "Create setting",
 *                      "wildcard": "setting:create",
 *                      "_id": "592029e5e8dd8e00048c183f",
 *                      "uri": "https://dawasco.herokuapp.com/permissions/592029e5e8dd8e00048c183f"
 *                  },
 *                  {
 *                      "resource": "Setting",
 *                      "description": "View setting",
 *                      "wildcard": "setting:view",
 *                      "_id": "592029e5e8dd8e00048c1840",
 *                      "uri": "https://dawasco.herokuapp.com/permissions/592029e5e8dd8e00048c1840"
 *                  },
 *                  {
 *                      "resource": "Setting",
 *                      "description": "Edit setting",
 *                      "wildcard": "setting:edit",
 *                      "_id": "592029e5e8dd8e00048c1841",
 *                      "uri": "https://dawasco.herokuapp.com/permissions/592029e5e8dd8e00048c1841"
 *                  },
 *                  {
 *                      "resource": "Setting",
 *                      "description": "Delete setting",
 *                      "wildcard": "setting:delete",
 *                      "_id": "592029e5e8dd8e00048c1842",
 *                      "uri": "https://dawasco.herokuapp.com/permissions/592029e5e8dd8e00048c1842"
 *                  },
 *                  {
 *                      "resource": "Status",
 *                      "description": "Create status",
 *                      "wildcard": "status:create",
 *                      "_id": "592029e5e8dd8e00048c1843",
 *                      "uri": "https://dawasco.herokuapp.com/permissions/592029e5e8dd8e00048c1843"
 *                  },
 *                  {
 *                      "resource": "Status",
 *                      "description": "View status",
 *                      "wildcard": "status:view",
 *                      "_id": "592029e5e8dd8e00048c1844",
 *                      "uri": "https://dawasco.herokuapp.com/permissions/592029e5e8dd8e00048c1844"
 *                  },
 *                  {
 *                      "resource": "Status",
 *                      "description": "Edit status",
 *                      "wildcard": "status:edit",
 *                      "_id": "592029e5e8dd8e00048c1845",
 *                      "uri": "https://dawasco.herokuapp.com/permissions/592029e5e8dd8e00048c1845"
 *                  },
 *                  {
 *                      "resource": "Status",
 *                      "description": "Delete status",
 *                      "wildcard": "status:delete",
 *                      "_id": "592029e5e8dd8e00048c1846",
 *                      "uri": "https://dawasco.herokuapp.com/permissions/592029e5e8dd8e00048c1846"
 *                  },
 *                  {
 *                      "resource": "User",
 *                      "description": "Create user",
 *                      "wildcard": "user:create",
 *                      "_id": "592029e5e8dd8e00048c1847",
 *                      "uri": "https://dawasco.herokuapp.com/permissions/592029e5e8dd8e00048c1847"
 *                  },
 *                  {
 *                      "resource": "User",
 *                      "description": "View user",
 *                      "wildcard": "user:view",
 *                      "_id": "592029e5e8dd8e00048c1848",
 *                      "uri": "https://dawasco.herokuapp.com/permissions/592029e5e8dd8e00048c1848"
 *                  },
 *                  {
 *                      "resource": "User",
 *                      "description": "Edit user",
 *                      "wildcard": "user:edit",
 *                      "_id": "592029e5e8dd8e00048c1849",
 *                      "uri": "https://dawasco.herokuapp.com/permissions/592029e5e8dd8e00048c1849"
 *                  },
 *                  {
 *                      "resource": "User",
 *                      "description": "Delete user",
 *                      "wildcard": "user:delete",
 *                      "_id": "592029e5e8dd8e00048c184a",
 *                      "uri": "https://dawasco.herokuapp.com/permissions/592029e5e8dd8e00048c184a"
 *                  }
 *              ],
 *              "_id": "592029e6e8dd8e00048c184f",
 *              "createdAt": "2017-05-20T11:35:02.219Z",
 *              "updatedAt": "2017-05-20T11:35:02.219Z",
 *              "_assigned": [
 *                  "592029e5e8dd8e00048c181b",
 *                  "592029e5e8dd8e00048c181c",
 *                  "592029e5e8dd8e00048c181d",
 *                  "592029e5e8dd8e00048c181e",
 *                  "592029e5e8dd8e00048c181f",
 *                  "592029e5e8dd8e00048c1820",
 *                  "592029e5e8dd8e00048c1821",
 *                  "592029e5e8dd8e00048c1822",
 *                  "592029e5e8dd8e00048c1823",
 *                  "592029e5e8dd8e00048c1824",
 *                  "592029e5e8dd8e00048c1825",
 *                  "592029e5e8dd8e00048c1826",
 *                  "592029e5e8dd8e00048c1827",
 *                  "592029e5e8dd8e00048c1828",
 *                  "592029e5e8dd8e00048c1829",
 *                  "592029e5e8dd8e00048c182a",
 *                  "592029e5e8dd8e00048c182b",
 *                  "592029e5e8dd8e00048c182c",
 *                  "592029e5e8dd8e00048c182d",
 *                  "592029e5e8dd8e00048c182e",
 *                  "592029e5e8dd8e00048c182f",
 *                  "592029e5e8dd8e00048c1830",
 *                  "592029e5e8dd8e00048c1831",
 *                  "592029e5e8dd8e00048c1832",
 *                  "592029e5e8dd8e00048c1833",
 *                  "592029e5e8dd8e00048c1834",
 *                  "592029e5e8dd8e00048c1835",
 *                  "592029e5e8dd8e00048c1836",
 *                  "592029e5e8dd8e00048c1837",
 *                  "592029e5e8dd8e00048c1838",
 *                  "592029e5e8dd8e00048c1839",
 *                  "592029e5e8dd8e00048c183a",
 *                  "592029e5e8dd8e00048c183b",
 *                  "592029e5e8dd8e00048c183c",
 *                  "592029e5e8dd8e00048c183d",
 *                  "592029e5e8dd8e00048c183e",
 *                  "592029e5e8dd8e00048c183f",
 *                  "592029e5e8dd8e00048c1840",
 *                  "592029e5e8dd8e00048c1841",
 *                  "592029e5e8dd8e00048c1842",
 *                  "592029e5e8dd8e00048c1843",
 *                  "592029e5e8dd8e00048c1844",
 *                  "592029e5e8dd8e00048c1845",
 *                  "592029e5e8dd8e00048c1846",
 *                  "592029e5e8dd8e00048c1847",
 *                  "592029e5e8dd8e00048c1848",
 *                  "592029e5e8dd8e00048c1849",
 *                  "592029e5e8dd8e00048c184a"
 *              ],
 *              "_permissions": "comment:create, comment:view, comment:edit, comment:delete, counter:create, counter:view, counter:edit, counter:delete, jurisdiction:create, jurisdiction:view, jurisdiction:edit, jurisdiction:delete, permission:create, permission:view, permission:edit, permission:delete, priority:create, priority:view, priority:edit, priority:delete, role:create, role:view, role:edit, role:delete, servicegroup:create, servicegroup:view, servicegroup:edit, servicegroup:delete, service:create, service:view, service:edit, service:delete, servicerequest:create, servicerequest:view, servicerequest:edit, servicerequest:delete, setting:create, setting:view, setting:edit, setting:delete, status:create, status:view, status:edit, status:delete, user:create, user:view, user:edit, user:delete",
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
 *        Unique Setting Id
 * @apiSuccess {Timestamp}    createdAt
 *        Setting creation date
 * @apiSuccess {Timestamp}    updatedAt
 *        Setting last updated date
 * @apiSuccess {String}       uri
 *        Setting URI
 * @apiSuccess {Array}        _assigned
 *        Obtain role permissions as a collection of role ids
 * @apiSuccess {String}       _permissions
 *        Obtain role permissions as concatenated string
 * @apiSuccess {Number}       pages
 *        Number of results pages
 * @apiSuccess {Number}       count
 *        Number of Setting results  in the current json response
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
 *              "resource": "Comment",
 *              "description": "Create comment",
 *              "wildcard": "comment:create",
 *              "_id": "592029e5e8dd8e00048c181b",
 *              "uri": "https://dawasco.herokuapp.com/permissions/592029e5e8dd8e00048c181b"
 *          },
 *          {
 *              "resource": "Comment",
 *              "description": "View comment",
 *              "wildcard": "comment:view",
 *              "_id": "592029e5e8dd8e00048c181c",
 *              "uri": "https://dawasco.herokuapp.com/permissions/592029e5e8dd8e00048c181c"
 *          },
 *          {
 *              "resource": "Comment",
 *              "description": "Edit comment",
 *              "wildcard": "comment:edit",
 *              "_id": "592029e5e8dd8e00048c181d",
 *              "uri": "https://dawasco.herokuapp.com/permissions/592029e5e8dd8e00048c181d"
 *          },
 *          {
 *              "resource": "Comment",
 *              "description": "Delete comment",
 *              "wildcard": "comment:delete",
 *              "_id": "592029e5e8dd8e00048c181e",
 *              "uri": "https://dawasco.herokuapp.com/permissions/592029e5e8dd8e00048c181e"
 *          },
 *          {
 *              "resource": "Counter",
 *              "description": "Create counter",
 *              "wildcard": "counter:create",
 *              "_id": "592029e5e8dd8e00048c181f",
 *              "uri": "https://dawasco.herokuapp.com/permissions/592029e5e8dd8e00048c181f"
 *          },
 *          {
 *              "resource": "Counter",
 *              "description": "View counter",
 *              "wildcard": "counter:view",
 *              "_id": "592029e5e8dd8e00048c1820",
 *              "uri": "https://dawasco.herokuapp.com/permissions/592029e5e8dd8e00048c1820"
 *          },
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
 *      "_assigned": [
 *          "592029e5e8dd8e00048c181b",
 *          "592029e5e8dd8e00048c181c",
 *          "592029e5e8dd8e00048c181d",
 *          "592029e5e8dd8e00048c181e",
 *          "592029e5e8dd8e00048c181f",
 *          "592029e5e8dd8e00048c1820",
 *          "592029e5e8dd8e00048c1821",

 *      ],
 *      "_permissions": "comment:create, comment:view, comment:edit, comment:delete, counter:create, counter:view, counter:edit",
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
 *        Unique Setting Id
 * @apiSuccess {Timestamp}    createdAt
 *        Setting creation date
 * @apiSuccess {Timestamp}    updatedAt
 *        Setting last updated date
 * @apiSuccess {String}       uri
 *        Setting URI
 * @apiSuccess {Array}        _assigned
 *        Obtain role permissions as a collection of role ids
 * @apiSuccess {String}       _permissions
 *        Obtain role permissions as concatenated string
 * @apiSuccess {Number}       pages
 *        Number of results pages
 * @apiSuccess {Number}       count
 *        Number of Setting results  in the current json response
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
 *              "resource": "Comment",
 *              "description": "Create comment",
 *              "wildcard": "comment:create",
 *              "_id": "592029e5e8dd8e00048c181b",
 *              "uri": "https://dawasco.herokuapp.com/permissions/592029e5e8dd8e00048c181b"
 *          },
 *          {
 *              "resource": "Comment",
 *              "description": "View comment",
 *              "wildcard": "comment:view",
 *              "_id": "592029e5e8dd8e00048c181c",
 *              "uri": "https://dawasco.herokuapp.com/permissions/592029e5e8dd8e00048c181c"
 *          },
 *          {
 *              "resource": "Comment",
 *              "description": "Edit comment",
 *              "wildcard": "comment:edit",
 *              "_id": "592029e5e8dd8e00048c181d",
 *              "uri": "https://dawasco.herokuapp.com/permissions/592029e5e8dd8e00048c181d"
 *          },
 *          {
 *              "resource": "Comment",
 *              "description": "Delete comment",
 *              "wildcard": "comment:delete",
 *              "_id": "592029e5e8dd8e00048c181e",
 *              "uri": "https://dawasco.herokuapp.com/permissions/592029e5e8dd8e00048c181e"
 *          },
 *          {
 *              "resource": "Counter",
 *              "description": "Create counter",
 *              "wildcard": "counter:create",
 *              "_id": "592029e5e8dd8e00048c181f",
 *              "uri": "https://dawasco.herokuapp.com/permissions/592029e5e8dd8e00048c181f"
 *          },
 *          {
 *              "resource": "Counter",
 *              "description": "View counter",
 *              "wildcard": "counter:view",
 *              "_id": "592029e5e8dd8e00048c1820",
 *              "uri": "https://dawasco.herokuapp.com/permissions/592029e5e8dd8e00048c1820"
 *          },
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
 *      "_assigned": [
 *          "592029e5e8dd8e00048c181b",
 *          "592029e5e8dd8e00048c181c",
 *          "592029e5e8dd8e00048c181d",
 *          "592029e5e8dd8e00048c181e",
 *          "592029e5e8dd8e00048c181f",
 *          "592029e5e8dd8e00048c1820",
 *          "592029e5e8dd8e00048c1821",

 *      ],
 *      "_permissions": "comment:create, comment:view, comment:edit, comment:delete, counter:create, counter:view, counter:edit",
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
 *        Unique Setting Id
 * @apiSuccess {Timestamp}    createdAt
 *        Setting creation date
 * @apiSuccess {Timestamp}    updatedAt
 *        Setting last updated date
 * @apiSuccess {String}       uri
 *        Setting URI
 * @apiSuccess {Array}        _assigned
 *        Obtain role permissions as a collection of role ids
 * @apiSuccess {String}       _permissions
 *        Obtain role permissions as concatenated string
 * @apiSuccess {Number}       pages
 *        Number of results pages
 * @apiSuccess {Number}       count
 *        Number of Setting results  in the current json response
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
 *              "resource": "Comment",
 *              "description": "Create comment",
 *              "wildcard": "comment:create",
 *              "_id": "592029e5e8dd8e00048c181b",
 *              "uri": "https://dawasco.herokuapp.com/permissions/592029e5e8dd8e00048c181b"
 *          },
 *          {
 *              "resource": "Comment",
 *              "description": "View comment",
 *              "wildcard": "comment:view",
 *              "_id": "592029e5e8dd8e00048c181c",
 *              "uri": "https://dawasco.herokuapp.com/permissions/592029e5e8dd8e00048c181c"
 *          },
 *          {
 *              "resource": "Comment",
 *              "description": "Edit comment",
 *              "wildcard": "comment:edit",
 *              "_id": "592029e5e8dd8e00048c181d",
 *              "uri": "https://dawasco.herokuapp.com/permissions/592029e5e8dd8e00048c181d"
 *          },
 *          {
 *              "resource": "Comment",
 *              "description": "Delete comment",
 *              "wildcard": "comment:delete",
 *              "_id": "592029e5e8dd8e00048c181e",
 *              "uri": "https://dawasco.herokuapp.com/permissions/592029e5e8dd8e00048c181e"
 *          },
 *          {
 *              "resource": "Counter",
 *              "description": "Create counter",
 *              "wildcard": "counter:create",
 *              "_id": "592029e5e8dd8e00048c181f",
 *              "uri": "https://dawasco.herokuapp.com/permissions/592029e5e8dd8e00048c181f"
 *          },
 *          {
 *              "resource": "Counter",
 *              "description": "View counter",
 *              "wildcard": "counter:view",
 *              "_id": "592029e5e8dd8e00048c1820",
 *              "uri": "https://dawasco.herokuapp.com/permissions/592029e5e8dd8e00048c1820"
 *          },
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
 *      "_assigned": [
 *          "592029e5e8dd8e00048c181b",
 *          "592029e5e8dd8e00048c181c",
 *          "592029e5e8dd8e00048c181d",
 *          "592029e5e8dd8e00048c181e",
 *          "592029e5e8dd8e00048c181f",
 *          "592029e5e8dd8e00048c1820",
 *          "592029e5e8dd8e00048c1821",

 *      ],
 *      "_permissions": "comment:create, comment:view, comment:edit, comment:delete, counter:create, counter:view, counter:edit",
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
 *        Unique Setting Id
 * @apiSuccess {Timestamp}    createdAt
 *        Setting creation date
 * @apiSuccess {Timestamp}    updatedAt
 *        Setting last updated date
 * @apiSuccess {String}       uri
 *        Setting URI
 * @apiSuccess {Array}        _assigned
 *        Obtain role permissions as a collection of role ids
 * @apiSuccess {String}       _permissions
 *        Obtain role permissions as concatenated string
 * @apiSuccess {Number}       pages
 *        Number of results pages
 * @apiSuccess {Number}       count
 *        Number of Setting results  in the current json response
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
 *              "resource": "Comment",
 *              "description": "Create comment",
 *              "wildcard": "comment:create",
 *              "_id": "592029e5e8dd8e00048c181b",
 *              "uri": "https://dawasco.herokuapp.com/permissions/592029e5e8dd8e00048c181b"
 *          },
 *          {
 *              "resource": "Comment",
 *              "description": "View comment",
 *              "wildcard": "comment:view",
 *              "_id": "592029e5e8dd8e00048c181c",
 *              "uri": "https://dawasco.herokuapp.com/permissions/592029e5e8dd8e00048c181c"
 *          },
 *          {
 *              "resource": "Comment",
 *              "description": "Edit comment",
 *              "wildcard": "comment:edit",
 *              "_id": "592029e5e8dd8e00048c181d",
 *              "uri": "https://dawasco.herokuapp.com/permissions/592029e5e8dd8e00048c181d"
 *          },
 *          {
 *              "resource": "Comment",
 *              "description": "Delete comment",
 *              "wildcard": "comment:delete",
 *              "_id": "592029e5e8dd8e00048c181e",
 *              "uri": "https://dawasco.herokuapp.com/permissions/592029e5e8dd8e00048c181e"
 *          },
 *          {
 *              "resource": "Counter",
 *              "description": "Create counter",
 *              "wildcard": "counter:create",
 *              "_id": "592029e5e8dd8e00048c181f",
 *              "uri": "https://dawasco.herokuapp.com/permissions/592029e5e8dd8e00048c181f"
 *          },
 *          {
 *              "resource": "Counter",
 *              "description": "View counter",
 *              "wildcard": "counter:view",
 *              "_id": "592029e5e8dd8e00048c1820",
 *              "uri": "https://dawasco.herokuapp.com/permissions/592029e5e8dd8e00048c1820"
 *          },
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
 *      "_assigned": [
 *          "592029e5e8dd8e00048c181b",
 *          "592029e5e8dd8e00048c181c",
 *          "592029e5e8dd8e00048c181d",
 *          "592029e5e8dd8e00048c181e",
 *          "592029e5e8dd8e00048c181f",
 *          "592029e5e8dd8e00048c1820",
 *          "592029e5e8dd8e00048c1821",

 *      ],
 *      "_permissions": "comment:create, comment:view, comment:edit, comment:delete, counter:create, counter:view, counter:edit",
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
 *        Unique Setting Id
 * @apiSuccess {Timestamp}    createdAt
 *        Setting creation date
 * @apiSuccess {Timestamp}    updatedAt
 *        Setting last updated date
 * @apiSuccess {String}       uri
 *        Setting URI
 * @apiSuccess {Array}        _assigned
 *        Obtain role permissions as a collection of role ids
 * @apiSuccess {String}       _permissions
 *        Obtain role permissions as concatenated string
 * @apiSuccess {Number}       pages
 *        Number of results pages
 * @apiSuccess {Number}       count
 *        Number of Setting results  in the current json response
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
 *              "resource": "Comment",
 *              "description": "Create comment",
 *              "wildcard": "comment:create",
 *              "_id": "592029e5e8dd8e00048c181b",
 *              "uri": "https://dawasco.herokuapp.com/permissions/592029e5e8dd8e00048c181b"
 *          },
 *          {
 *              "resource": "Comment",
 *              "description": "View comment",
 *              "wildcard": "comment:view",
 *              "_id": "592029e5e8dd8e00048c181c",
 *              "uri": "https://dawasco.herokuapp.com/permissions/592029e5e8dd8e00048c181c"
 *          },
 *          {
 *              "resource": "Comment",
 *              "description": "Edit comment",
 *              "wildcard": "comment:edit",
 *              "_id": "592029e5e8dd8e00048c181d",
 *              "uri": "https://dawasco.herokuapp.com/permissions/592029e5e8dd8e00048c181d"
 *          },
 *          {
 *              "resource": "Comment",
 *              "description": "Delete comment",
 *              "wildcard": "comment:delete",
 *              "_id": "592029e5e8dd8e00048c181e",
 *              "uri": "https://dawasco.herokuapp.com/permissions/592029e5e8dd8e00048c181e"
 *          },
 *          {
 *              "resource": "Counter",
 *              "description": "Create counter",
 *              "wildcard": "counter:create",
 *              "_id": "592029e5e8dd8e00048c181f",
 *              "uri": "https://dawasco.herokuapp.com/permissions/592029e5e8dd8e00048c181f"
 *          },
 *          {
 *              "resource": "Counter",
 *              "description": "View counter",
 *              "wildcard": "counter:view",
 *              "_id": "592029e5e8dd8e00048c1820",
 *              "uri": "https://dawasco.herokuapp.com/permissions/592029e5e8dd8e00048c1820"
 *          },
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
 *      "_assigned": [
 *          "592029e5e8dd8e00048c181b",
 *          "592029e5e8dd8e00048c181c",
 *          "592029e5e8dd8e00048c181d",
 *          "592029e5e8dd8e00048c181e",
 *          "592029e5e8dd8e00048c181f",
 *          "592029e5e8dd8e00048c1820",
 *          "592029e5e8dd8e00048c1821",

 *      ],
 *      "_permissions": "comment:create, comment:view, comment:edit, comment:delete, counter:create, counter:view, counter:edit",
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
