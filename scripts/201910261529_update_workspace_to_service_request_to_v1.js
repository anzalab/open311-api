// establish connection
var conn = new Mongo();
var db = conn.getDB('open311');

// update technical workspace for service requests
db.servicerequests.find({
  'method.workspace': 'Technician'
}).forEach(sr => {
  db.servicerequests.update({ _id: sr._id }, {
    $set: { 'method.workspace': 'Technical' }
  });
});
