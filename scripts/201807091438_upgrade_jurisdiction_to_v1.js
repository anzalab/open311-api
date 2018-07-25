//establish connection
var conn = new Mongo();
var db = conn.getDB('open311');

//drop unused indexes
db.jurisdictions.dropIndex('domain_1');
db.jurisdictions.dropIndex('location_2dsphere');
db.jurisdictions.dropIndex('boundaries_2dsphere');

//unset unused path
db.jurisdictions.update({}, { $unset: { location: "", boundaries: "", domain: "" } }, { multi: true });
