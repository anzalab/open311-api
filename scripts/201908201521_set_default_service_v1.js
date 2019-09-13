// establish connection
var conn = new Mongo();
var db = conn.getDB('open311');

// set default service
db.services.update({
  'name.en': 'Request Other'
}, {
  $set: { default: true }
});
