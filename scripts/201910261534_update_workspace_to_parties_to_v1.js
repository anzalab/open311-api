// establish connection
var conn = new Mongo();
var db = conn.getDB('open311');

// update technical workspace for service requests
db.parties.find({
  'relation.workspace': 'Technician'
}).forEach(sr => {
  db.parties.update({ _id: sr._id }, {
    $set: { 'relation.workspace': 'Technical' }
  });
});
