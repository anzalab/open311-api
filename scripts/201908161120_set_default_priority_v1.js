// establish connection
var conn = new Mongo();
var db = conn.getDB('open311');

// set default priority
db.priorities.update({
  'name.en': 'Low'
}, {
  $set: { default: true }
});
