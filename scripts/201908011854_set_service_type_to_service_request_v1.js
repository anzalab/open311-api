// establish connection
var conn = new Mongo();
var db = conn.getDB('open311');

// query list of services
db.services.find().forEach(service => {
  // update service request to set type
  db.servicerequests.update({ service: service._id }, {
    $set: { type: service.type }
  }, { multi: true });
});
