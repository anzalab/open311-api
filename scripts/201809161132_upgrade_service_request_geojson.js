//establish connection
var conn = new Mongo();
var db = conn.getDB('open311');


//drop unused indexes
db.servicerequests.dropIndex('location_2dsphere');
