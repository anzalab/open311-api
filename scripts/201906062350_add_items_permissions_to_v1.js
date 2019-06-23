//establish connection
var conn = new Mongo();
var db = conn.getDB('open311');

var permissions = [{
    "updatedAt": ISODate("2019-06-06T23:50:03.432Z"),
    "createdAt": ISODate("2019-06-06T23:50:03.432Z"),
    "resource": "Item",
    "action": "create",
    "description": "Create item",
    "wildcard": "item:create"
  },
  {
    "updatedAt": ISODate("2019-06-06T23:50:03.717Z"),
    "createdAt": ISODate("2019-06-06T23:50:03.717Z"),
    "resource": "Item",
    "action": "delete",
    "description": "Delete item",
    "wildcard": "item:delete"
  },
  {
    "updatedAt": ISODate("2019-06-06T23:50:03.575Z"),
    "createdAt": ISODate("2019-06-06T23:50:03.575Z"),
    "resource": "Item",
    "action": "edit",
    "description": "Edit item",
    "wildcard": "item:edit"
  },
  {
    "updatedAt": ISODate("2019-06-06T23:50:03.440Z"),
    "createdAt": ISODate("2019-06-06T23:50:03.440Z"),
    "resource": "Item",
    "action": "view",
    "description": "View item",
    "wildcard": "item:view"
  },
  {
    "updatedAt": ISODate("2019-06-06T23:50:03.440Z"),
    "createdAt": ISODate("2019-06-06T23:50:03.440Z"),
    "resource": 'Item',
    "action": "import",
    "description": "Import item",
    "wildcard": "item:import"
  }, {
    "updatedAt": ISODate("2019-06-06T23:50:03.440Z"),
    "createdAt": ISODate("2019-06-06T23:50:03.440Z"),
    "resource": 'Item',
    "action": "export",
    "description": "Export item",
    "wildcard": "item:export"
  }
];

//upsert item permissions
permissions.forEach(function (permission) {
  db.permissions.update(permission, permission, { upsert: true });
});
