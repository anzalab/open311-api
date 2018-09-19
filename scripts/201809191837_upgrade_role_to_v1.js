//establish connection
var conn = new Mongo();
var db = conn.getDB('open311');


//drop unused indexes
db.roles.dropIndexes();

//set role type
db.roles.update({}, { $set: { type: "System" } }, { multi: true });
