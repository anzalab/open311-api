//establish connection
var conn = new Mongo();
var db = conn.getDB('open311');

var permissions = [{
    "updatedAt": ISODate("2018-10-16T11:54:03.432Z"),
    "createdAt": ISODate("2018-10-16T11:54:03.432Z"),
    "resource": "Alert",
    "action": "create",
    "description": "Create alert",
    "wildcard": "alert:create"
  },
  {
    "updatedAt": ISODate("2018-10-16T11:54:03.717Z"),
    "createdAt": ISODate("2018-10-16T11:54:03.717Z"),
    "resource": "Alert",
    "action": "delete",
    "description": "Delete alert",
    "wildcard": "alert:delete"
  },
  {
    "updatedAt": ISODate("2018-10-16T11:54:03.575Z"),
    "createdAt": ISODate("2018-10-16T11:54:03.575Z"),
    "resource": "Alert",
    "action": "edit",
    "description": "Edit alert",
    "wildcard": "alert:edit"
  },
  {
    "updatedAt": ISODate("2018-10-16T11:54:03.440Z"),
    "createdAt": ISODate("2018-10-16T11:54:03.440Z"),
    "resource": "Alert",
    "action": "view",
    "description": "View alert",
    "wildcard": "alert:view"
  }
];

//upsert alert permissions
permissions.forEach(function (permission) {
  db.permissions.update(permission, permission, { upsert: true });
});
