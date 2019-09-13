// establish connection
var conn = new Mongo();
var db = conn.getDB('open311');

// set default service group
db.servicegroups.update({
  'name.en': 'Other'
}, {
  $set: { default: true }
});
