// establish connection
var conn = new Mongo();
var db = conn.getDB('open311');

// set default jurisdiction
db.jurisdictions.update({
  'name' : 'Gerezani'
}, {
  $set: { default: true }
});
