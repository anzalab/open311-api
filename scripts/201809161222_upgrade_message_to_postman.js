//establish connection
var conn = new Mongo();
var db = conn.getDB('open311');

//drop existing messages
db.messages.drop();

//TODO flush all redis database
