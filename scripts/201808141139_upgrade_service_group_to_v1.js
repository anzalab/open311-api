//establish connection
var conn = new Mongo();
var db = conn.getDB('open311');


//drop unused indexes
db.servicegroups.dropIndexes();


//remember prevous name and description
db.servicegroups.find().forEach(function (servicegroup) {
  db.servicegroups.update({ _id: servicegroup._id }, {
    $set: {
      _name: servicegroup.name,
      _description: servicegroup.description
    }
  });
});


//unset name and description
db.servicegroups.update({}, {
  $unset: {
    name: "",
    description: ""
  }
}, { multi: true });


//shape name and description to support multi locales
db.servicegroups.find().forEach(function (servicegroup) {
  db.servicegroups.update({ _id: servicegroup._id }, {
    $set: {
      "name.en": servicegroup._name,
      "name.sw": servicegroup._name,
      "description.en": servicegroup._description,
      "description.sw": servicegroup._description
    }
  });
});


//unset unused path
db.servicegroups.update({}, {
  $unset: {
    _name: "",
    _description: ""
  }
}, { multi: true });
