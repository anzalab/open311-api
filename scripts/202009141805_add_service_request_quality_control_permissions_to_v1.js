//establish connection
var conn = new Mongo();
var db = conn.getDB('open311');

var permissions = [{
  "updatedAt": ISODate("2020-09-14T15:50:03.432Z"),
  "createdAt": ISODate("2020-09-14T15:50:03.432Z"),
  "resource": "ServiceRequest",
  "action": "control quality",
  "description": "Perform servicerequest quality control",
  "wildcard": "servicerequest:control quality",
}];

//upsert service request permissions
permissions.forEach(function (permission) {
  var query = { wildcard: permission.wildcard };
  db.permissions.update(query, permission, { upsert: true });
});
