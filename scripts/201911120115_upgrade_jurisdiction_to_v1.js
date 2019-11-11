//establish connection
var conn = new Mongo();
var db = conn.getDB('open311');

//set city & country
db.jurisdictions.update({}, { $set: { city: "Dar es Salaam", country: "Tanzania" } }, { multi: true });
