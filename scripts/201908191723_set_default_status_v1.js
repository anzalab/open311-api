// establish connection
var conn = new Mongo();
var db = conn.getDB('open311');

// set default status
db.status.update({
  'name.en': 'Open'
}, {
  $set: { default: true }
});
