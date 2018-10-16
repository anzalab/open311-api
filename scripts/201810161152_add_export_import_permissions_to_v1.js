//establish connection
var conn = new Mongo();
var db = conn.getDB('open311');

//obtain distinct existing resources
var resources = db.permissions.distinct('resource');

//collect import/export permissions
var permissions = [];
if (resources) {
  resources = resources.forEach(function (resource) {
    permissions = permissions.concat([{
      "updatedAt": ISODate("2018-10-16T11:54:03.432Z"),
      "createdAt": ISODate("2018-10-16T11:54:03.432Z"),
      "resource": resource,
      "action": "import",
      "description": "Import " + resource.toLowerCase(),
      "wildcard": resource.toLowerCase() + ":import"
    }, {
      "updatedAt": ISODate("2018-10-16T11:54:03.432Z"),
      "createdAt": ISODate("2018-10-16T11:54:03.432Z"),
      "resource": resource,
      "action": "export",
      "description": "Export " + resource.toLowerCase(),
      "wildcard": resource.toLowerCase() + ":export"
    }]);
  });
}

//upsert import/export permissions
permissions.forEach(function (permission) {
  db.permissions.update(permission, permission, { upsert: true });
});
