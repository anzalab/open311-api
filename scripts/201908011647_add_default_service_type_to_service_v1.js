// establish connection
var conn = new Mongo();
var db = conn.getDB('open311');

// obtain default service type
var type = db.predefines.findOne({
  namespace: 'ServiceType',
  bucket: 'servicetypes',
  default: true
});

// set default service type for all existing services
db.services.find().forEach(service => {
  // update service type
  db.services.update({ _id: service._id }, {
    $set: { type: type._id }
  });
});
