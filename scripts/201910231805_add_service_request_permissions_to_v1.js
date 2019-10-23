//establish connection
var conn = new Mongo();
var db = conn.getDB('open311');

var permissions = [{
  "updatedAt": ISODate("2019-10-23T23:53:03.432Z"),
  "createdAt": ISODate("2019-10-23T23:53:03.432Z"),
  "resource": "ServiceRequest",
  "action": "confirm",
  "description": "Confirm servicerequest",
  "wildcard": "servicerequest:confirm",
}];

//upsert zone permissions
permissions.forEach(function (permission) {
  var query = { wildcard: permission.wildcard };
  db.permissions.update(query, permission, { upsert: true });
});
