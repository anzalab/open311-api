//establish connection
var conn = new Mongo();
var db = conn.getDB('open311');


//drop unused indexes
db.priorities.dropIndexes();


//remember prevous name
db.priorities.find().forEach(function (priority) {
  db.priorities.update({ _id: priority._id }, { $set: { _name: priority.name } });
});

//unset name
db.priorities.update({}, { $unset: { name: "" } }, { multi: true });

//shape name to support multi locales
db.priorities.find().forEach(function (priority) {
  db.priorities.update({ _id: priority._id }, { $set: { "name.en": priority._name, "name.sw": priority._name } });
});

//unset unused path
db.priorities.update({}, { $unset: { _name: "" } }, { multi: true });
