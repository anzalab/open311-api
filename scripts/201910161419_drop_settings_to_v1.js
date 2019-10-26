//establish connection
var conn = new Mongo();
var db = conn.getDB('open311');

db.settings.drop();
