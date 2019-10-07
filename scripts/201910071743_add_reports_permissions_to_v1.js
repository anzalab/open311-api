//establish connection
var conn = new Mongo();
var db = conn.getDB('open311');

var permissions = [{
    "updatedAt": ISODate("2019-10-07T17:43:03.432Z"),
    "createdAt": ISODate("2019-10-07T17:43:03.432Z"),
    "resource": "Report",
    "action": "view overview report",
    "description": "View overview report",
    "wildcard": "view:overview report"
  },
  {
    "updatedAt": ISODate("2019-10-07T17:43:03.432Z"),
    "createdAt": ISODate("2019-10-07T17:43:03.432Z"),
    "resource": "Report",
    "action": "view standing report",
    "description": "View standing report",
    "wildcard": "view:standing report"
  },
  {
    "updatedAt": ISODate("2019-10-07T17:43:03.432Z"),
    "createdAt": ISODate("2019-10-07T17:43:03.432Z"),
    "resource": "Report",
    "action": "view performance report",
    "description": "View performance report",
    "wildcard": "view:performance report"
  },
  {
    "updatedAt": ISODate("2019-10-07T17:43:03.432Z"),
    "createdAt": ISODate("2019-10-07T17:43:03.432Z"),
    "resource": "Report",
    "action": "view operational report",
    "description": "View operational report",
    "wildcard": "view:operational report"
  }
];

//upsert item permissions
permissions.forEach(function (permission) {
  var query = { wildcard: permission.wildcard }
  db.permissions.update(query, permission, { upsert: true });
});
