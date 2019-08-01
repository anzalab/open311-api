//establish connection
var conn = new Mongo();
var db = conn.getDB('open311');

var permissions = [{
    "updatedAt": ISODate("2019-08-01T17:57:03.432Z"),
    "createdAt": ISODate("2019-08-01T17:57:03.432Z"),
    "resource": "ServiceType",
    "action": "create",
    "description": "Create service type",
    "wildcard": "servicetype:create"
  },
  {
    "updatedAt": ISODate("2019-08-01T17:57:03.717Z"),
    "createdAt": ISODate("2019-08-01T17:57:03.717Z"),
    "resource": "ServiceType",
    "action": "delete",
    "description": "Delete service type",
    "wildcard": "servicetype:delete"
  },
  {
    "updatedAt": ISODate("2019-08-01T17:57:03.575Z"),
    "createdAt": ISODate("2019-08-01T17:57:03.575Z"),
    "resource": "ServiceType",
    "action": "edit",
    "description": "Edit servicetype",
    "wildcard": "servicetype:edit"
  },
  {
    "updatedAt": ISODate("2019-08-01T17:57:03.440Z"),
    "createdAt": ISODate("2019-08-01T17:57:03.440Z"),
    "resource": "ServiceType",
    "action": "view",
    "description": "View service type",
    "wildcard": "servicetype:view"
  },
  {
    "updatedAt": ISODate("2019-08-01T17:57:03.440Z"),
    "createdAt": ISODate("2019-08-01T17:57:03.440Z"),
    "resource": 'ServiceType',
    "action": "import",
    "description": "Import service type",
    "wildcard": "servicetype:import"
  }, {
    "updatedAt": ISODate("2019-08-01T17:57:03.440Z"),
    "createdAt": ISODate("2019-08-01T17:57:03.440Z"),
    "resource": 'ServiceType',
    "action": "export",
    "description": "Export service type",
    "wildcard": "servicetype:export"
  }
];

//upsert servicetype permissions
permissions.forEach(function (permission) {
  var query = { wildcard: permission.wildcard };
  db.permissions.update(query, permission, { upsert: true });
});
