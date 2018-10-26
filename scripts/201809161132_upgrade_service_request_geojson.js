//establish connection
var conn = new Mongo();
var db = conn.getDB('open311');

//drop existing messages
db.servicerequests.dropIndex('location_2dsphere');
