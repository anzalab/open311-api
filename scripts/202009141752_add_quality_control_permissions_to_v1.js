//establish connection
var conn = new Mongo();
var db = conn.getDB('open311');

var causes = [{
    "updatedAt": ISODate("2020-09-14T17:57:03.432Z"),
    "createdAt": ISODate("2020-09-14T17:57:03.432Z"),
    "resource": "QualityCause",
    "action": "create",
    "description": "Create quality cause",
    "wildcard": "qualitycause:create"
  },
  {
    "updatedAt": ISODate("2020-09-14T17:57:03.717Z"),
    "createdAt": ISODate("2020-09-14T17:57:03.717Z"),
    "resource": "QualityCause",
    "action": "delete",
    "description": "Delete quality cause",
    "wildcard": "qualitycause:delete"
  },
  {
    "updatedAt": ISODate("2020-09-14T17:57:03.575Z"),
    "createdAt": ISODate("2020-09-14T17:57:03.575Z"),
    "resource": "QualityCause",
    "action": "edit",
    "description": "Edit quality cause",
    "wildcard": "qualitycause:edit"
  },
  {
    "updatedAt": ISODate("2020-09-14T17:57:03.440Z"),
    "createdAt": ISODate("2020-09-14T17:57:03.440Z"),
    "resource": "QualityCause",
    "action": "view",
    "description": "View quality cause",
    "wildcard": "qualitycause:view"
  },
  {
    "updatedAt": ISODate("2020-09-14T17:57:03.440Z"),
    "createdAt": ISODate("2020-09-14T17:57:03.440Z"),
    "resource": 'QualityCause',
    "action": "import",
    "description": "Import quality cause",
    "wildcard": "qualitycause:import"
  }, {
    "updatedAt": ISODate("2020-09-14T17:57:03.440Z"),
    "createdAt": ISODate("2020-09-14T17:57:03.440Z"),
    "resource": 'QualityCause',
    "action": "export",
    "description": "Export quality cause",
    "wildcard": "qualitycause:export"
  }
];

var measures = [{
    "updatedAt": ISODate("2020-09-14T17:57:03.432Z"),
    "createdAt": ISODate("2020-09-14T17:57:03.432Z"),
    "resource": "QualityMeasure",
    "action": "create",
    "description": "Create quality measure",
    "wildcard": "qualitymeasure:create"
  },
  {
    "updatedAt": ISODate("2020-09-14T17:57:03.717Z"),
    "createdAt": ISODate("2020-09-14T17:57:03.717Z"),
    "resource": "QualityMeasure",
    "action": "delete",
    "description": "Delete quality measure",
    "wildcard": "qualitymeasure:delete"
  },
  {
    "updatedAt": ISODate("2020-09-14T17:57:03.575Z"),
    "createdAt": ISODate("2020-09-14T17:57:03.575Z"),
    "resource": "QualityMeasure",
    "action": "edit",
    "description": "Edit quality measure",
    "wildcard": "qualitymeasure:edit"
  },
  {
    "updatedAt": ISODate("2020-09-14T17:57:03.440Z"),
    "createdAt": ISODate("2020-09-14T17:57:03.440Z"),
    "resource": "QualityMeasure",
    "action": "view",
    "description": "View quality measure",
    "wildcard": "qualitymeasure:view"
  },
  {
    "updatedAt": ISODate("2020-09-14T17:57:03.440Z"),
    "createdAt": ISODate("2020-09-14T17:57:03.440Z"),
    "resource": 'QualityMeasure',
    "action": "import",
    "description": "Import quality measure",
    "wildcard": "qualitymeasure:import"
  }, {
    "updatedAt": ISODate("2020-09-14T17:57:03.440Z"),
    "createdAt": ISODate("2020-09-14T17:57:03.440Z"),
    "resource": 'QualityMeasure',
    "action": "export",
    "description": "Export quality measure",
    "wildcard": "qualitymeasure:export"
  }
];

var advisories = [{
    "updatedAt": ISODate("2020-09-14T17:57:03.432Z"),
    "createdAt": ISODate("2020-09-14T17:57:03.432Z"),
    "resource": "QualityAdvisory",
    "action": "create",
    "description": "Create quality advisory",
    "wildcard": "qualityadvisory:create"
  },
  {
    "updatedAt": ISODate("2020-09-14T17:57:03.717Z"),
    "createdAt": ISODate("2020-09-14T17:57:03.717Z"),
    "resource": "QualityAdvisory",
    "action": "delete",
    "description": "Delete quality advisory",
    "wildcard": "qualityadvisory:delete"
  },
  {
    "updatedAt": ISODate("2020-09-14T17:57:03.575Z"),
    "createdAt": ISODate("2020-09-14T17:57:03.575Z"),
    "resource": "QualityAdvisory",
    "action": "edit",
    "description": "Edit quality advisory",
    "wildcard": "qualityadvisory:edit"
  },
  {
    "updatedAt": ISODate("2020-09-14T17:57:03.440Z"),
    "createdAt": ISODate("2020-09-14T17:57:03.440Z"),
    "resource": "QualityAdvisory",
    "action": "view",
    "description": "View quality advisory",
    "wildcard": "qualityadvisory:view"
  },
  {
    "updatedAt": ISODate("2020-09-14T17:57:03.440Z"),
    "createdAt": ISODate("2020-09-14T17:57:03.440Z"),
    "resource": 'QualityAdvisory',
    "action": "import",
    "description": "Import quality advisory",
    "wildcard": "qualityadvisory:import"
  }, {
    "updatedAt": ISODate("2020-09-14T17:57:03.440Z"),
    "createdAt": ISODate("2020-09-14T17:57:03.440Z"),
    "resource": 'QualityAdvisory',
    "action": "export",
    "description": "Export quality advisory",
    "wildcard": "qualityadvisory:export"
  }
];

var permissions = [].concat(causes).concat(measures).concat(advisories);

//upsert quality control permissions
permissions.forEach(function (permission) {
  var query = { wildcard: permission.wildcard };
  db.permissions.update(query, permission, { upsert: true });
});
