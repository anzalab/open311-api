//establish connection
var conn = new Mongo();
var db = conn.getDB('open311');

var permissions = [{
    "updatedAt": ISODate("2019-06-06T23:53:03.432Z"),
    "createdAt": ISODate("2019-06-06T23:53:03.432Z"),
    "resource": "Zone",
    "action": "create",
    "description": "Create zone",
    "wildcard": "zone:create"
  },
  {
    "updatedAt": ISODate("2019-06-06T23:53:03.717Z"),
    "createdAt": ISODate("2019-06-06T23:53:03.717Z"),
    "resource": "Zone",
    "action": "delete",
    "description": "Delete zone",
    "wildcard": "zone:delete"
  },
  {
    "updatedAt": ISODate("2019-06-06T23:53:03.575Z"),
    "createdAt": ISODate("2019-06-06T23:53:03.575Z"),
    "resource": "Zone",
    "action": "edit",
    "description": "Edit zone",
    "wildcard": "zone:edit"
  },
  {
    "updatedAt": ISODate("2019-06-06T23:53:03.440Z"),
    "createdAt": ISODate("2019-06-06T23:53:03.440Z"),
    "resource": "Zone",
    "action": "view",
    "description": "View zone",
    "wildcard": "zone:view"
  },
  {
    "updatedAt": ISODate("2019-06-06T23:53:03.440Z"),
    "createdAt": ISODate("2019-06-06T23:53:03.440Z"),
    "resource": 'Zone',
    "action": "import",
    "description": "Import zone",
    "wildcard": "zone:import"
  }, {
    "updatedAt": ISODate("2019-06-06T23:53:03.440Z"),
    "createdAt": ISODate("2019-06-06T23:53:03.440Z"),
    "resource": 'Zone',
    "action": "export",
    "description": "Export zone",
    "wildcard": "zone:export"
  }
];

//upsert zone permissions
permissions.forEach(function (permission) {
  db.permissions.update(permission, permission, { upsert: true });
});
