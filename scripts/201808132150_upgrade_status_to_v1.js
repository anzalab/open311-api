//establish connection
var conn = new Mongo();
var db = conn.getDB('open311');


//drop unused indexes
db.status.dropIndexes();


//remember prevous name
db.status.find().forEach(function (status) {
  db.status.update({ _id: status._id }, { $set: { _name: status.name } });
});

//unset name
db.status.update({}, { $unset: { name: "" } }, { multi: true });

//shape name to support multi locales
db.status.find().forEach(function (status) {
  db.status.update({ _id: status._id }, { $set: { "name.en": status._name, "name.sw": status._name } });
});

//unset unused path
db.status.update({}, { $unset: { _name: "" } }, { multi: true });
