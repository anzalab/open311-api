//establish connection
var conn = new Mongo();
var db = conn.getDB('open311');


//drop unused indexes
db.services.dropIndexes();


//remember prevous name and description
db.services.find().forEach(function (service) {
  db.services.update({ _id: service._id }, {
    $set: {
      _name: service.name,
      _description: service.description,
      _isExternal: service.isExternal
    }
  });
});


//unset name and description
db.services.update({}, {
  $unset: {
    name: "",
    description: "",
    isExternal: ""
  }
}, { multi: true });


//shape name and description to support multi locales
db.services.find().forEach(function (service) {
  db.services.update({ _id: service._id }, {
    $set: {
      "name.en": service._name,
      "name.sw": service._name,
      "description.en": service._description,
      "description.sw": service._description,
      "flags.external": service._isExternal,
      "flags.account": false
    }
  });
});


//unset unused path
db.services.update({}, {
  $unset: {
    _name: "",
    _description: "",
    _isExternal: ""
  }
}, { multi: true });
