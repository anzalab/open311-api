//establish connection
var conn = new Mongo();
var db = conn.getDB('open311');

var permissions = [{
  "updatedAt": ISODate("2019-10-29T15:50:03.432Z"),
  "createdAt": ISODate("2019-10-29T15:50:03.432Z"),
  "resource": "ServiceRequest",
  "action": "reopen",
  "description": "ReOpen servicerequest",
  "wildcard": "servicerequest:reopen",
}];

//upsert zone permissions
permissions.forEach(function (permission) {
  var query = { wildcard: permission.wildcard };
  db.permissions.update(query, permission, { upsert: true });
});
