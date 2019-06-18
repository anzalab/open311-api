//establish connection
var conn = new Mongo();
var db = conn.getDB('open311');

var permissions = [{
  "updatedAt": ISODate("2019-06-06T23:53:03.432Z"),
  "createdAt": ISODate("2019-06-06T23:53:03.432Z"),
  "resource": "ServiceRequest",
  "action": "verify",
  "description": "Verify servicerequest",
  "wildcard": "servicerequest:verify",
}, {
  "updatedAt": ISODate("2019-06-06T23:53:03.432Z"),
  "createdAt": ISODate("2019-06-06T23:53:03.432Z"),
  "resource": "ServiceRequest",
  "action": "approve",
  "description": "Approve servicerequest",
  "wildcard": "servicerequest:approve",
}, {
  "updatedAt": ISODate("2019-06-06T23:53:03.432Z"),
  "createdAt": ISODate("2019-06-06T23:53:03.432Z"),
  "resource": "ServiceRequest",
  "action": "assign",
  "description": "Assign servicerequest",
  "wildcard": "servicerequest:assign",
}, {
  "updatedAt": ISODate("2019-06-06T23:53:03.432Z"),
  "createdAt": ISODate("2019-06-06T23:53:03.432Z"),
  "resource": "ServiceRequest",
  "action": "complete",
  "description": "Complete servicerequest",
  "wildcard": "servicerequest:complete",
}, {
  "updatedAt": ISODate("2019-06-06T23:53:03.432Z"),
  "createdAt": ISODate("2019-06-06T23:53:03.432Z"),
  "resource": "ServiceRequest",
  "action": "work",
  "description": "Complete servicerequest",
  "wildcard": "servicerequest:work",
}];

//upsert zone permissions
permissions.forEach(function (permission) {
  var query = { wildcard: permission.wildcard };
  db.permissions.update(query, permission, { upsert: true });
});
